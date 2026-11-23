<?php

namespace App\Services\DataAdmin;

use App\Models\EmployeeJabatan;

class UpdateJabatanService
{
    /**
     * Update an existing employee job title.
     */
    public function handle(EmployeeJabatan $jabatan, array $data): EmployeeJabatan
    {
        $jabatan->nama = trim((string) $data['nama']);
        $jabatan->save();

        return $jabatan;
    }
}
