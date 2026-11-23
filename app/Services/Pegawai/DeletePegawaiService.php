<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use Illuminate\Support\Facades\Storage;

class DeletePegawaiService
{
    /**
     * Delete an employee together with all stored files.
     */
    public function handle(Employee $employee): void
    {
        $employee->documents()->get()->each(function ($document) {
            Storage::disk('local')->delete($document->path);
        });

        if ($employee->profile?->foto_path) {
            Storage::disk('public')->delete($employee->profile->foto_path);
        }

        $employee->delete();
    }
}
