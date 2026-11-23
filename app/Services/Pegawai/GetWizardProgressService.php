<?php

namespace App\Services\Pegawai;

use App\Models\Employee;

class GetWizardProgressService
{
    /**
     * Determine which of the five wizard steps already contain data.
     *
     * @return array<string, bool>
     */
    public function handle(Employee $employee): array
    {
        $profile = $employee->profile;

        return [
            'data_pribadi' => $profile !== null
                && filled($profile->tanggal_lahir)
                && filled($profile->email)
                && filled($profile->no_hp_1)
                && filled($profile->alamat_ktp),
            'pendidikan' => $employee->educations()->exists(),
            'keluarga' => $employee->familyMembers()->exists(),
            'ciri_fisik' => $employee->physical()->exists(),
            'file' => $employee->documents()->exists()
                || $employee->documentNumbers()->exists(),
        ];
    }
}
