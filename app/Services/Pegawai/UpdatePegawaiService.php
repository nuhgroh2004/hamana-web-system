<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use App\Services\Pegawai\CreateUserFromEmployeeProfileService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdatePegawaiService
{
    public function __construct(
        private readonly CreateUserFromEmployeeProfileService $createUser,
    ) {}

    /**
     * Update an employee and synchronize its linked login account.
     */
    public function handle(Employee $employee, array $data): Employee
    {
        return DB::transaction(function () use ($employee, $data) {
            $employee->update([
                'nik' => trim($data['nik']),
                'nama' => trim($data['nama']),
                'jabatan' => $this->value($data['jabatan'] ?? null),
                'posisi' => $this->value($data['posisi'] ?? null),
                'status_pegawai' => $this->status($data['status'] ?? $employee->status_pegawai),
            ]);

            $profile = $employee->profile;
            $email = array_key_exists('email', $data)
                ? $this->email($data['email'])
                : $profile?->email;
            $tanggalLahir = array_key_exists('tanggal_lahir', $data)
                ? $this->value($data['tanggal_lahir'])
                : $profile?->tanggal_lahir?->format('Y-m-d');

            $employee->profile()->updateOrCreate(
                ['employee_id' => $employee->id],
                [
                    'email' => $email,
                    'tanggal_lahir' => $tanggalLahir,
                ],
            );

            $status = $this->createUser->handle(
                $employee,
                ($data['password'] ?? '') !== '' ? $data['password'] : null,
            );

            if (! in_array($status, [
                CreateUserFromEmployeeProfileService::CREATED,
                CreateUserFromEmployeeProfileService::LINKED,
                CreateUserFromEmployeeProfileService::ALREADY_LINKED,
            ], true)) {
                throw ValidationException::withMessages([
                    'email' => 'Data akun tidak dapat disinkronkan karena NIK atau email sudah digunakan.',
                ]);
            }

            return $employee->fresh(['profile']);
        });
    }

    /**
     * Normalize an optional text value.
     */
    private function value(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function email(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : mb_strtolower($value);
    }

    /**
     * Normalize the employment status.
     */
    private function status(?string $status): string
    {
        return $status === Employee::STATUS_TIDAK_AKTIF
            ? Employee::STATUS_TIDAK_AKTIF
            : Employee::STATUS_AKTIF;
    }
}
