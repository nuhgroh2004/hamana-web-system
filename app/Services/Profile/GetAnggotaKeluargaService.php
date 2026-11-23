<?php

namespace App\Services\Profile;

use App\Models\Employee;

class GetAnggotaKeluargaService
{
    /**
     * Return every family member row for the employee.
     */
    public function handle(Employee $employee): array
    {
        return $employee->familyMembers()
            ->get()
            ->map(fn ($member) => [
                'id' => $member->id,
                'hubungan' => $member->hubungan,
                'urutan' => $member->urutan,
                'nama' => $member->nama,
                'usia' => $member->usia,
                'pekerjaan' => $member->pekerjaan,
                'aktif' => (bool) $member->aktif,
            ])
            ->all();
    }
}
