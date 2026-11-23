<?php

namespace App\Services\DataAdmin;

use App\Models\Employee;
use App\Models\User;
use App\Services\Employee\SyncEmployeeFromUserService;

class CreateAdminService
{
    /**
     * Create an admin account and its linked employee record.
     */
    public function handle(array $data): User
    {
        $user = User::query()->create([
            'nik' => trim((string) $data['nik']),
            'name' => trim((string) $data['nama']),
            'email' => mb_strtolower(trim((string) $data['email'])),
            'password' => $data['password'],
            'role' => User::ROLE_ADMIN,
            'is_active' => (bool) ($data['aktif'] ?? true),
            'position' => 'Administrator',
            'email_verified_at' => now(),
        ]);

        $employee = app(SyncEmployeeFromUserService::class)->handle($user);

        $employee->update([
            'status_pegawai' => ($data['karyawan_aktif'] ?? true)
                ? Employee::STATUS_AKTIF
                : Employee::STATUS_TIDAK_AKTIF,
        ]);

        return $user->load('employee');
    }
}
