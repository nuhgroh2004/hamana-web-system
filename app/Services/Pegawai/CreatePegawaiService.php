<?php

namespace App\Services\Pegawai;

use App\Models\Employee;

class CreatePegawaiService
{
    /**
     * Create a new employee record.
     */
    public function handle(array $data): Employee
    {
        return Employee::query()->create([
            'nik' => trim($data['nik']),
            'nama' => trim($data['nama']),
            'jabatan' => $this->value($data['jabatan'] ?? null),
            'posisi' => $this->value($data['posisi'] ?? null),
            'status_pegawai' => $this->status($data['status'] ?? null),
        ]);
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
