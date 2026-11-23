<?php

namespace App\Services\Profile;

use App\Models\Employee;

class SaveCiriFisikService
{
    /**
     * Persist the employee's physical traits.
     */
    public function handle(Employee $employee, array $data): array
    {
        $employee->physical()->updateOrCreate(
            ['employee_id' => $employee->id],
            [
                'warna_kulit' => $this->value($data['warna_kulit'] ?? null),
                'golongan_darah' => $this->upper($data['golongan_darah'] ?? null),
                'warna_rambut' => $this->value($data['warna_rambut'] ?? null),
                'ukuran_baju' => $this->value($data['ukuran_baju'] ?? null),
                'warna_mata' => $this->value($data['warna_mata'] ?? null),
                'ukuran_celana' => $this->value($data['ukuran_celana'] ?? null),
                'tinggi_badan' => $this->decimal($data['tinggi_badan'] ?? null),
                'ukuran_sepatu' => $this->value($data['ukuran_sepatu'] ?? null),
                'berat_badan' => $this->decimal($data['berat_badan'] ?? null),
            ],
        );

        $physical = $employee->physical()->first();

        return [
            'warna_kulit' => $physical->warna_kulit,
            'golongan_darah' => $physical->golongan_darah,
            'warna_rambut' => $physical->warna_rambut,
            'ukuran_baju' => $physical->ukuran_baju,
            'warna_mata' => $physical->warna_mata,
            'ukuran_celana' => $physical->ukuran_celana,
            'tinggi_badan' => $physical->tinggi_badan,
            'ukuran_sepatu' => $physical->ukuran_sepatu,
            'berat_badan' => $physical->berat_badan,
        ];
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
     * Normalize a code value to uppercase.
     */
    private function upper(?string $value): ?string
    {
        $value = $this->value($value);

        return $value === null ? null : mb_strtoupper($value);
    }

    /**
     * Normalize an optional decimal value.
     */
    private function decimal(mixed $value): ?float
    {
        return $value !== null && $value !== '' ? (float) $value : null;
    }
}
