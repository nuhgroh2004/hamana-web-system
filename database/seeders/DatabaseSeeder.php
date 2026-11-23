<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::where('email', 'test@example.com')->delete();

        $admin = User::updateOrCreate(
            ['email' => 'admin@hamana.co.id'],
            [
                'nik' => '1232.31.23.12',
                'name' => 'Admin Hamana',
                'password' => 'password',
                'role' => 'admin',
                'position' => 'Administrator',
                'email_verified_at' => now(),
            ],
        );

        $karyawan = User::updateOrCreate(
            ['email' => 'karyawan@hamana.co.id'],
            [
                'nik' => '1232.31.23.13',
                'name' => 'Karyawan Hamana',
                'password' => 'password',
                'role' => 'karyawan',
                'position' => 'Staff Operasional',
                'email_verified_at' => now(),
            ],
        );

        foreach ([$admin, $karyawan] as $user) {
            Employee::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nik' => $user->nik,
                    'nama' => $user->name,
                    'jabatan' => $user->position,
                    'posisi' => $user->position,
                    'status_pegawai' => Employee::STATUS_AKTIF,
                ],
            );
        }
    }
}
