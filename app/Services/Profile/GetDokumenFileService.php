<?php

namespace App\Services\Profile;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Support\Facades\Storage;

class GetDokumenFileService
{
    /**
     * Return the stored file information for an employee document.
     */
    public function handle(Employee $employee, EmployeeDocument $document): array
    {
        abort_unless($document->employee_id === $employee->id, 404);

        $disk = Storage::disk('local');

        abort_unless($disk->exists($document->path), 404);

        return [
            'path' => $disk->path($document->path),
            'name' => $document->nama_file,
            'mime' => $document->mime_type,
        ];
    }
}
