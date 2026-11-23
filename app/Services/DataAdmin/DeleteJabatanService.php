<?php

namespace App\Services\DataAdmin;

use App\Models\EmployeeJabatan;

class DeleteJabatanService
{
    /**
     * Delete an employee job title.
     */
    public function handle(EmployeeJabatan $jabatan): void
    {
        $jabatan->delete();
    }
}
