<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateUserFromEmployeeProfileService
{
    public const CREATED = 'created';

    public const LINKED = 'linked';

    public const ALREADY_LINKED = 'already_linked';

    public const INCOMPLETE = 'incomplete';

    public const CONFLICT = 'conflict';

    public function handle(Employee $employee): string
    {
        return DB::transaction(function () use ($employee) {
            $employee = Employee::query()
                ->with('profile')
                ->lockForUpdate()
                ->findOrFail($employee->id);

            if ($employee->user_id !== null) {
                if ($employee->profile !== null) {
                    $profileEmail = trim((string) $employee->profile->email);

                    if (filter_var($profileEmail, FILTER_VALIDATE_EMAIL)) {
                        $normalizedEmail = mb_strtolower($profileEmail);

                        if ($employee->profile->email !== $normalizedEmail) {
                            $employee->profile->email = $normalizedEmail;
                            $employee->profile->save();
                        }
                    }
                }

                return self::ALREADY_LINKED;
            }

            $profile = $employee->profile;
            $email = mb_strtolower(trim((string) $profile?->email));
            $name = trim($employee->nama);
            $firstName = preg_split('/\s+/u', $name, -1, PREG_SPLIT_NO_EMPTY)[0] ?? '';

            if (
                $profile?->tanggal_lahir === null
                || ! filter_var($email, FILTER_VALIDATE_EMAIL)
                || $firstName === ''
            ) {
                return self::INCOMPLETE;
            }

            $byEmail = User::query()->whereRaw('lower(email) = ?', [$email])->first();
            $byNik = User::query()->where('nik', $employee->nik)->first();

            if ($byEmail && $byNik && $byEmail->id !== $byNik->id) {
                return self::CONFLICT;
            }

            $existingUser = $byEmail ?? $byNik;

            if ($existingUser) {
                if (
                    $existingUser->role !== User::ROLE_KARYAWAN
                    || $existingUser->employee()->exists()
                ) {
                    return self::CONFLICT;
                }

                $existingUser->update([
                    'nik' => $employee->nik,
                    'name' => $name,
                    'email' => $email,
                    'position' => $employee->posisi ?: $employee->jabatan,
                ]);
                $profile->email = $email;
                $profile->save();
                $employee->user_id = $existingUser->id;
                $employee->save();

                return self::LINKED;
            }

            $user = User::query()->create([
                'nik' => $employee->nik,
                'name' => $name,
                'email' => $email,
                'password' => mb_strtolower($firstName).$profile->tanggal_lahir->format('dm'),
                'role' => User::ROLE_KARYAWAN,
                'position' => $employee->posisi ?: $employee->jabatan,
                'permissions' => null,
                'is_active' => $employee->status_pegawai !== Employee::STATUS_TIDAK_AKTIF,
                'email_verified_at' => now(),
            ]);

            $profile->email = $email;
            $profile->save();
            $employee->user_id = $user->id;
            $employee->save();

            return self::CREATED;
        });
    }
}
