<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreatePegawaiService
{
    public function __construct(
        private readonly CreateUserFromEmployeeProfileService $createUser,
    ) {}

    /**
     * Create an employee and its login account.
     */
    public function handle(array $data): Employee
    {
        return DB::transaction(function () use ($data) {
            $employee = Employee::query()->create([
                'nik' => trim($data['nik']),
                'nama' => trim($data['nama']),
                'jabatan' => $this->value($data['jabatan'] ?? null),
                'posisi' => $this->value($data['posisi'] ?? null),
                'status_pegawai' => $this->status($data['status'] ?? null),
            ]);

            $employee->profile()->create([
                'email' => $this->email($data['email'] ?? null),
                'tanggal_lahir' => $data['tanggal_lahir'] ?? null,
            ]);

            $status = $this->createUser->handle($employee);

            if (! in_array($status, [
                CreateUserFromEmployeeProfileService::CREATED,
                CreateUserFromEmployeeProfileService::LINKED,
            ], true)) {
                throw ValidationException::withMessages([
                    'email' => 'Akun pengguna tidak dapat dibuat. Periksa email, NIK, dan tanggal lahir pegawai.',
                ]);
            }

            return $employee->fresh();
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
