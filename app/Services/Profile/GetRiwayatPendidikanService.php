<?php

namespace App\Services\Profile;

use App\Models\Employee;

class GetRiwayatPendidikanService
{
    /**
     * Return every education row for the employee.
     */
    public function handle(Employee $employee): array
    {
        return $employee->educations()
            ->get()
            ->map(fn ($education) => [
                'id' => $education->id,
                'jenjang' => $education->jenjang,
                'nama_sekolah' => $education->nama_sekolah,
                'jurusan' => $education->jurusan,
                'tahun' => $education->tahun,
                'aktif' => (bool) $education->aktif,
            ])
            ->all();
    }
}
