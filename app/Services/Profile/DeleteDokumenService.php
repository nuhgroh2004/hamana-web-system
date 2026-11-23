<?php

namespace App\Services\Profile;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Support\Facades\Storage;

class DeleteDokumenService
{
    /**
     * Delete an employee document and its stored file.
     */
    public function handle(Employee $employee, EmployeeDocument $document): void
    {
        abort_unless($document->employee_id === $employee->id, 404);

        Storage::disk('local')->delete($document->path);
        $document->delete();
    }
}
