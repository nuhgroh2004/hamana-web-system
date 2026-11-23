<?php

namespace App\Services\DataAdmin;

use App\Models\Employee;
use App\Models\User;
use App\Services\Employee\SyncEmployeeFromUserService;

class CreateSatpamService
{
    /**
     * Create a satpam account and its linked employee record.
     */
    public function handle(array $data): User
    {
        $user = User::query()->create([
            'name' => trim((string) $data['nama']),
            'email' => mb_strtolower(trim((string) $data['email'])),
            'password' => $data['password'],
            'role' => User::ROLE_SATPAM,
            'is_active' => (bool) ($data['aktif'] ?? true),
            'position' => 'Satpam',
            'email_verified_at' => now(),
        ]);

        $employee = app(SyncEmployeeFromUserService::class)->handle($user);

        $employee->update([
            'status_pegawai' => $user->isActive()
                ? Employee::STATUS_AKTIF
                : Employee::STATUS_TIDAK_AKTIF,
        ]);

        return $user;
    }
}
