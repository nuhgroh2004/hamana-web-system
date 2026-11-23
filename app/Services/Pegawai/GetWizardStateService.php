<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use App\Services\Profile\GetAnggotaKeluargaService;
use App\Services\Profile\GetCiriFisikService;
use App\Services\Profile\GetDataPribadiService;
use App\Services\Profile\GetDokumenService;
use App\Services\Profile\GetRiwayatPendidikanService;

class GetWizardStateService
{
    public function __construct(
        private readonly GetDataPribadiService $getDataPribadi,
        private readonly GetRiwayatPendidikanService $getPendidikan,
        private readonly GetAnggotaKeluargaService $getKeluarga,
        private readonly GetCiriFisikService $getCiriFisik,
        private readonly GetDokumenService $getDokumen,
        private readonly GetWizardProgressService $getProgress,
    ) {}

    /**
     * Build the full wizard payload for one employee.
     */
    public function handle(Employee $employee): array
    {
        return [
            'employee' => [
                'id' => $employee->id,
                'nik' => $employee->nik,
                'nama' => $employee->nama,
            ],
            'data_pribadi' => $this->getDataPribadi->handle($employee),
            'pendidikan' => $this->getPendidikan->handle($employee),
            'keluarga' => $this->getKeluarga->handle($employee),
            'ciri_fisik' => $this->getCiriFisik->handle($employee),
            'dokumen' => $this->getDokumen->handle($employee),
            'progress' => $this->getProgress->handle($employee),
        ];
    }
}
