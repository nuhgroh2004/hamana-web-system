<?php

namespace App\Services\Profile;

use App\Models\Employee;
use Illuminate\Support\Facades\Storage;

class GetFotoProfilService
{
    /**
     * Return the stored profile photo path for an employee.
     */
    public function handle(Employee $employee): string
    {
        $path = $employee->profile?->foto_path;

        abort_unless($path, 404);

        $disk = Storage::disk('public');

        abort_unless($disk->exists($path), 404);

        return $disk->path($path);
    }
}
