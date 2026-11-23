<?php

namespace App\Services\DataAdmin;

use App\Models\EmployeeLevel;

class UpdateTingkatService
{
    /**
     * Update an existing employee level.
     */
    public function handle(EmployeeLevel $level, array $data): EmployeeLevel
    {
        $level->nama = trim((string) $data['nama']);
        $level->save();

        return $level;
    }
}
