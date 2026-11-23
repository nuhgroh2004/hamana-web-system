<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use App\Services\Profile\SaveDataPribadiService;
use Illuminate\Support\Facades\DB;

class CreateWizardEmployeeService
{
    public function __construct(private readonly SaveDataPribadiService $saveDataPribadi) {}

    /**
     * Create an employee together with the first wizard step (data pribadi).
     */
    public function handle(array $data): Employee
    {
        return DB::transaction(function () use ($data) {
            $employee = Employee::query()->create([
                'nik' => trim((string) $data['nik']),
                'nama' => trim((string) $data['nama']),
                'jabatan' => $data['jabatan'] ?? null,
                'posisi' => $data['posisi'] ?? null,
                'status_pegawai' => $data['status_pegawai'] ?? Employee::STATUS_AKTIF,
            ]);

            return $this->saveDataPribadi->handle($employee, $data);
        });
    }
}
