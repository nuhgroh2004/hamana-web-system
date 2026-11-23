<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use App\Services\Profile\SaveDataPribadiService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateWizardEmployeeService
{
    public function __construct(
        private readonly SaveDataPribadiService $saveDataPribadi,
        private readonly CreateUserFromEmployeeProfileService $createUser,
    ) {}

    /**
     * Create an employee together with the first wizard step (data pribadi).
     */
    public function handle(array $data): Employee
    {
        return DB::transaction(function () use ($data) {
            $nik = trim((string) ($data['nik'] ?? ''));
            $nama = trim((string) ($data['nama'] ?? ''));

            if ($nik === '' || $nama === '') {
                throw ValidationException::withMessages([
                    'nik' => 'NIK dan nama wajib diisi untuk membuat akun pegawai.',
                    'nama' => 'NIK dan nama wajib diisi untuk membuat akun pegawai.',
                ]);
            }

            $employee = Employee::query()->create([
                'nik' => $nik,
                'nama' => $nama,
                'jabatan' => $data['jabatan'] ?? null,
                'posisi' => $data['posisi'] ?? null,
                'status_pegawai' => $data['status_pegawai'] ?? Employee::STATUS_AKTIF,
            ]);

            $employee = $this->saveDataPribadi->handle($employee, $data);
            $status = $this->createUser->handle($employee);

            if (! in_array($status, [
                CreateUserFromEmployeeProfileService::CREATED,
                CreateUserFromEmployeeProfileService::LINKED,
            ], true)) {
                throw ValidationException::withMessages([
                    'email' => 'Akun pengguna tidak dapat dibuat. Periksa email, NIK, dan tanggal lahir pegawai.',
                ]);
            }

            return $employee;
        });
    }
}
