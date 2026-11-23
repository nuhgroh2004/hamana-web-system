<?php

namespace App\Services\Profile;

use App\Models\Employee;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SaveFotoProfilService
{
    /**
     * Replace the employee profile photo and return the stored path.
     */
    public function handle(Employee $employee, UploadedFile $file): string
    {
        $profile = $employee->profile()->firstOrCreate(['employee_id' => $employee->id]);

        if ($profile->foto_path) {
            Storage::disk('public')->delete($profile->foto_path);
        }

        $path = $file->store('profile-photos/'.$employee->id, 'public');

        $profile->update(['foto_path' => $path]);

        return $path;
    }
}
