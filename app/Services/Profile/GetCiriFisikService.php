<?php

namespace App\Services\Profile;

use App\Models\Employee;
use App\Models\EmployeePhysical;

class GetCiriFisikService
{
    /**
     * Return the employee's physical traits.
     */
    public function handle(Employee $employee): array
    {
        $physical = $employee->physical;
        $physical ??= new EmployeePhysical(['employee_id' => $employee->id]);

        return [
            'warna_kulit' => $physical->warna_kulit,
            'golongan_darah' => $physical->golongan_darah,
            'warna_rambut' => $physical->warna_rambut,
            'ukuran_baju' => $physical->ukuran_baju,
            'warna_mata' => $physical->warna_mata,
            'ukuran_celana' => $physical->ukuran_celana,
            'tinggi_badan' => $this->number($physical->tinggi_badan),
            'ukuran_sepatu' => $physical->ukuran_sepatu,
            'berat_badan' => $this->number($physical->berat_badan),
        ];
    }

    /**
     * Trim unnecessary decimal zeroes for the form.
     */
    private function number(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return rtrim(rtrim(number_format((float) $value, 2, '.', ''), '0'), '.');
    }
}
