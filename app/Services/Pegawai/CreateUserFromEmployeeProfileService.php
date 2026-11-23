<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateUserFromEmployeeProfileService
{
    public const CREATED = 'created';

    public const LINKED = 'linked';

    public const ALREADY_LINKED = 'already_linked';

    public const INCOMPLETE = 'incomplete';

    public const CONFLICT = 'conflict';

    public function handle(Employee $employee, ?string $password = null): string
    {
        return DB::transaction(function () use ($employee, $password) {
            $employee = Employee::query()
                ->with(['profile', 'user'])
                ->lockForUpdate()
                ->findOrFail($employee->id);

            $profile = $employee->profile;
            $name = trim($employee->nama);
            $firstName = preg_split('/\s+/u', $name, -1, PREG_SPLIT_NO_EMPTY)[0] ?? '';
            $profileEmail = trim((string) $profile?->email);
            $email = filter_var($profileEmail, FILTER_VALIDATE_EMAIL)
                ? mb_strtolower($profileEmail)
                : null;

            if ($firstName === '') {
                return self::INCOMPLETE;
            }

            $byEmail = $email === null
                ? null
                : User::query()->whereRaw('lower(email) = ?', [$email])->first();
            $byNik = User::query()->where('nik', $employee->nik)->first();

            if ($byEmail && $byNik && $byEmail->id !== $byNik->id) {
                return self::CONFLICT;
            }

            if ($employee->user_id !== null) {
                $user = $employee->user;

                if (
                    ! $user
                    || $user->role !== User::ROLE_KARYAWAN
                    || ($byEmail && $byEmail->id !== $user->id)
                    || ($byNik && $byNik->id !== $user->id)
                ) {
                    return self::CONFLICT;
                }

                $this->syncUser($user, $employee, $email, $name, $password);
                $this->normalizeProfileEmail($profile, $email);

                return self::ALREADY_LINKED;
            }

            $existingUser = $byEmail ?? $byNik;

            if ($existingUser) {
                if (
                    $existingUser->role !== User::ROLE_KARYAWAN
                    || $existingUser->employee()->exists()
                ) {
                    return self::CONFLICT;
                }

                $this->syncUser($existingUser, $employee, $email, $name, $password);
                $this->normalizeProfileEmail($profile, $email);
                $employee->user_id = $existingUser->id;
                $employee->save();

                return self::LINKED;
            }

            $user = User::query()->create([
                'nik' => $employee->nik,
                'name' => $name,
                'email' => $email,
                'password' => $password
                    ?? ($profile?->tanggal_lahir
                        ? mb_strtolower($firstName).$profile->tanggal_lahir->format('dm')
                        : Str::random(48)),
                'role' => User::ROLE_KARYAWAN,
                'position' => $employee->posisi ?: $employee->jabatan,
                'permissions' => null,
                'is_active' => $employee->status_pegawai !== Employee::STATUS_TIDAK_AKTIF,
            ]);

            $this->normalizeProfileEmail($profile, $email);
            $employee->user_id = $user->id;
            $employee->save();

            return self::CREATED;
        });
    }

    /**
     * Synchronize login-facing employee data without changing permissions.
     */
    private function syncUser(
        User $user,
        Employee $employee,
        ?string $email,
        string $name,
        ?string $password,
    ): void {
        $user->nik = $employee->nik;
        $user->name = $name;
        $user->email = $email;
        $user->position = $employee->posisi ?: $employee->jabatan;
        $user->is_active = $employee->status_pegawai !== Employee::STATUS_TIDAK_AKTIF;

        if ($password !== null) {
            $user->password = $password;
        }

        $user->save();
    }

    /**
     * Normalize valid profile email addresses without discarding invalid source data.
     */
    private function normalizeProfileEmail(?\App\Models\EmployeeProfile $profile, ?string $email): void
    {
        if ($profile !== null && $email !== null && $profile->email !== $email) {
            $profile->email = $email;
            $profile->save();
        }
    }
}
