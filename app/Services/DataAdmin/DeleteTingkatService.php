<?php

namespace App\Services\DataAdmin;

use App\Models\EmployeeLevel;

class DeleteTingkatService
{
    /**
     * Delete an employee level.
     */
    public function handle(EmployeeLevel $level): void
    {
        $level->delete();
    }
}
