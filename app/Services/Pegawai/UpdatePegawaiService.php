<?php

namespace App\Services\Pegawai;

use App\Models\Employee;

class UpdatePegawaiService
{
    /**
     * Update an existing employee record.
     */
    public function handle(Employee $employee, array $data): Employee
    {
        $employee->update([
            'nik' => trim($data['nik']),
            'nama' => trim($data['nama']),
            'jabatan' => $this->value($data['jabatan'] ?? null),
            'posisi' => $this->value($data['posisi'] ?? null),
            'status_pegawai' => $this->status($data['status'] ?? $employee->status_pegawai),
        ]);

        return $employee->fresh();
    }

    /**
     * Normalize an optional text value.
     */
    private function value(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
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
