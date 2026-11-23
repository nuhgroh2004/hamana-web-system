<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DeletePegawaiService
{
    /**
     * Delete an employee and its linked karyawan account.
     */
    public function handle(Employee $employee): void
    {
        $documentPaths = $employee->documents()->pluck('path');
        $photoPath = $employee->profile?->foto_path;
        $user = $employee->user;

        DB::transaction(function () use ($employee, $user) {
            $employee->delete();

            if ($user?->role === User::ROLE_KARYAWAN) {
                $user->delete();
            }
        });

        foreach ($documentPaths as $path) {
            Storage::disk('local')->delete($path);
        }

        if ($photoPath) {
            Storage::disk('public')->delete($photoPath);
        }
    }
}
