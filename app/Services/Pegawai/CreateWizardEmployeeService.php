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
            $nik = trim((string) ($data['nik'] ?? ''));
            $nama = trim((string) ($data['nama'] ?? ''));

            $employee = Employee::query()->create([
                'nik' => $nik !== '' ? $nik : $this->placeholderNik(),
                'nama' => $nama !== '' ? $nama : 'Karyawan Baru',
                'jabatan' => $data['jabatan'] ?? null,
                'posisi' => $data['posisi'] ?? null,
                'status_pegawai' => $data['status_pegawai'] ?? Employee::STATUS_AKTIF,
            ]);

            return $this->saveDataPribadi->handle($employee, $data);
        });
    }

    /**
     * Build a unique placeholder NIK so the wizard can be saved while the
     * required fields are still optional during development.
     */
    private function placeholderNik(): string
    {
        do {
            $nik = 'DEV-'.now()->format('ymdHis').'-'.str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (Employee::query()->where('nik', $nik)->exists());

        return $nik;
    }
}
