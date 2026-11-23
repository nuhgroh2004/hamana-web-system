<?php

namespace App\Services\DataAdmin;

use App\Models\EmployeeLevel;

class CreateTingkatService
{
    /**
     * Create a new employee level.
     */
    public function handle(array $data): EmployeeLevel
    {
        return EmployeeLevel::query()->create([
            'nama' => trim((string) $data['nama']),
        ]);
    }
}
