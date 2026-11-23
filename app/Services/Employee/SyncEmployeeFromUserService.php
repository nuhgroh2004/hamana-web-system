<?php

namespace App\Services\Employee;

use App\Models\Employee;
use App\Models\User;

class SyncEmployeeFromUserService
{
    /**
     * Keep the employee record in sync with a user account.
     *
     * The account is the source of truth for NIK, name, and position, so the
     * matching employee row is created, linked, or updated whenever an account
     * is saved from the Hak Akses page.
     */
    public function handle(User $user): Employee
    {
        $employee = Employee::query()->where('user_id', $user->id)->first();

        if (! $employee && $user->nik) {
            $employee = Employee::query()
                ->where('nik', $user->nik)
                ->whereNull('user_id')
                ->first();
        }

        $data = [
            'nama' => $user->name,
            'jabatan' => $user->position,
            'posisi' => $user->position,
        ];

        if (! $employee) {
            return Employee::query()->create($data + [
                'user_id' => $user->id,
                'nik' => $this->uniqueNik($user),
                'status_pegawai' => Employee::STATUS_AKTIF,
            ]);
        }

        $employee->user_id = $user->id;

        $nik = $this->availableNik($user, $employee);

        if ($nik !== null) {
            $data['nik'] = $nik;
        }

        $employee->fill($data)->save();

        return $employee;
    }

    /**
     * The user NIK, unless another employee already uses it.
     */
    private function availableNik(User $user, Employee $employee): ?string
    {
        if (! $user->nik) {
            return null;
        }

        $taken = Employee::query()
            ->where('nik', $user->nik)
            ->whereKeyNot($employee->id)
            ->exists();

        return $taken ? null : $user->nik;
    }

    /**
     * Build a NIK that is not used by another employee yet.
     */
    private function uniqueNik(User $user): string
    {
        $candidate = $user->nik ?: 'USR-'.$user->id;

        if (! Employee::query()->where('nik', $candidate)->exists()) {
            return $candidate;
        }

        return 'USR-'.$user->id;
    }
}
