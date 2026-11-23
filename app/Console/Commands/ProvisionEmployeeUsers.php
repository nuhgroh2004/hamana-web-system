<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Services\Pegawai\CreateUserFromEmployeeProfileService;
use Illuminate\Console\Command;

class ProvisionEmployeeUsers extends Command
{
    protected $signature = 'employees:provision-users';

    protected $description = 'Create or link karyawan user accounts from employee profiles';

    public function handle(CreateUserFromEmployeeProfileService $createUser): int
    {
        $counts = [
            CreateUserFromEmployeeProfileService::CREATED => 0,
            CreateUserFromEmployeeProfileService::LINKED => 0,
            CreateUserFromEmployeeProfileService::ALREADY_LINKED => 0,
            CreateUserFromEmployeeProfileService::INCOMPLETE => 0,
            CreateUserFromEmployeeProfileService::CONFLICT => 0,
            'email_missing' => 0,
            'email_invalid' => 0,
            'birth_date_missing' => 0,
        ];

        Employee::query()
            ->forDataPegawai()
            ->with('profile')
            ->orderBy('id')
            ->chunkById(100, function ($employees) use ($createUser, &$counts) {
                foreach ($employees as $employee) {
                    $status = $createUser->handle($employee);
                    $counts[$status]++;

                    $email = trim((string) $employee->profile?->email);

                    if ($email === '') {
                        $counts['email_missing']++;
                    } elseif (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        $counts['email_invalid']++;
                    }

                    if ($employee->profile?->tanggal_lahir === null) {
                        $counts['birth_date_missing']++;
                    }
                }
            });

        $this->table(
            ['Hasil', 'Jumlah'],
            [
                ['Akun dibuat', $counts[CreateUserFromEmployeeProfileService::CREATED]],
                ['Akun lama dihubungkan', $counts[CreateUserFromEmployeeProfileService::LINKED]],
                ['Sudah terhubung', $counts[CreateUserFromEmployeeProfileService::ALREADY_LINKED]],
                ['Nama pegawai kosong', $counts[CreateUserFromEmployeeProfileService::INCOMPLETE]],
                ['Email kosong (tetap dibuat)', $counts['email_missing']],
                ['Email tidak valid (login nonaktif)', $counts['email_invalid']],
                ['Tanggal lahir kosong', $counts['birth_date_missing']],
                ['Konflik email/NIK', $counts[CreateUserFromEmployeeProfileService::CONFLICT]],
            ],
        );

        return $counts[CreateUserFromEmployeeProfileService::INCOMPLETE] === 0
            && $counts[CreateUserFromEmployeeProfileService::CONFLICT] === 0
            ? self::SUCCESS
            : self::FAILURE;
    }
}
