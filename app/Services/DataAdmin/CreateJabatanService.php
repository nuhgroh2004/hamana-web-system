<?php

namespace App\Services\DataAdmin;

use App\Models\EmployeeJabatan;

class CreateJabatanService
{
    /**
     * Create a new employee job title.
     */
    public function handle(array $data): EmployeeJabatan
    {
        return EmployeeJabatan::query()->create([
            'nama' => trim((string) $data['nama']),
        ]);
    }
}
