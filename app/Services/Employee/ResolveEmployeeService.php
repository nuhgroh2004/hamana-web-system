<?php

namespace App\Services\Employee;

use App\Models\Employee;
use App\Models\User;

class ResolveEmployeeService
{
    /**
     * Resolve the employee that the current request is allowed to work with.
     *
     * Users with Data Pegawai access may open another employee's profile via ?nik=.
     */
    public function handle(User $user, ?string $nik = null): Employee
    {
        $canBrowse = $user->isAdmin() || $user->canAccess('data-pegawai');

        if ($canBrowse && $nik !== null && $nik !== '') {
            $employee = Employee::query()->where('nik', $nik)->first();

            abort_unless($employee, 404, 'Data pegawai tidak ditemukan.');

            return $employee;
        }

        $employee = Employee::query()->where('user_id', $user->id)->first();

        if (! $employee && $user->nik) {
            $employee = Employee::query()
                ->where('nik', $user->nik)
                ->whereNull('user_id')
                ->first();

            if ($employee) {
                $employee->update(['user_id' => $user->id]);
            }
        }

        if (! $employee) {
            $employee = Employee::query()->create([
                'user_id' => $user->id,
                'nik' => $this->uniqueNik($user),
                'nama' => $user->name,
                'jabatan' => $user->position,
                'posisi' => $user->position,
                'status_pegawai' => Employee::STATUS_AKTIF,
            ]);
        }

        return $employee;
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
