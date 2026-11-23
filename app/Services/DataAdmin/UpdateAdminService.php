<?php

namespace App\Services\DataAdmin;

use App\Models\Employee;
use App\Models\User;
use App\Services\Employee\SyncEmployeeFromUserService;

class UpdateAdminService
{
    /**
     * Update an admin account and its linked employee record.
     */
    public function handle(User $user, array $data): User
    {
        $user->nik = trim((string) $data['nik']);
        $user->name = trim((string) $data['nama']);
        $user->email = mb_strtolower(trim((string) $data['email']));
        $user->is_active = (bool) ($data['aktif'] ?? true);

        if (! empty($data['password'])) {
            $user->password = $data['password'];
        }

        $user->save();

        $employee = app(SyncEmployeeFromUserService::class)->handle($user);

        $employee->update([
            'status_pegawai' => ($data['karyawan_aktif'] ?? true)
                ? Employee::STATUS_AKTIF
                : Employee::STATUS_TIDAK_AKTIF,
        ]);

        return $user->load('employee');
    }
}
