<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Services\Pegawai\CreateWizardEmployeeService;
use App\Services\Pegawai\GetWizardProgressService;
use App\Services\Pegawai\GetWizardStateService;
use App\Services\Profile\DeleteDokumenService;
use App\Services\Profile\SaveAnggotaKeluargaService;
use App\Services\Profile\SaveCiriFisikService;
use App\Services\Profile\SaveDataPribadiService;
use App\Services\Profile\SaveNomorDokumenService;
use App\Services\Profile\SaveRiwayatPendidikanService;
use App\Services\Profile\UploadDokumenService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class WizardPegawaiController extends Controller
{
    /**
     * Create a new employee from the first wizard step.
     */
    public function store(
        Request $request,
        CreateWizardEmployeeService $createEmployee,
        GetWizardProgressService $getProgress,
    ) {
        $data = $request->validate($this->dataPribadiRules());

        $employee = $createEmployee->handle($data);

        return response()->json([
            'employee' => $this->employeePayload($employee),
            'progress' => $getProgress->handle($employee),
        ], 201);
    }

    /**
     * Return every section of the wizard for an employee.
     */
    public function show(Employee $employee, GetWizardStateService $getState)
    {
        return response()->json($getState->handle($employee));
    }

    /**
     * Save the data pribadi step for an existing employee.
     */
    public function updateDataPribadi(
        Request $request,
        Employee $employee,
        SaveDataPribadiService $saveDataPribadi,
        GetWizardProgressService $getProgress,
    ) {
        $data = $request->validate($this->dataPribadiRules($employee));

        $employee = $saveDataPribadi->handle($employee, $data);

        return response()->json([
            'employee' => $this->employeePayload($employee),
            'progress' => $getProgress->handle($employee),
        ]);
    }

    /**
     * Save the education history step.
     */
    public function updatePendidikan(
        Request $request,
        Employee $employee,
        SaveRiwayatPendidikanService $savePendidikan,
        GetWizardProgressService $getProgress,
    ) {
        $data = $request->validate([
            'items' => ['present', 'array'],
            'items.*.jenjang' => ['required', 'string', 'max:30'],
            'items.*.nama_sekolah' => ['nullable', 'string', 'max:255'],
            'items.*.jurusan' => ['nullable', 'string', 'max:255'],
            'items.*.tahun' => ['nullable', 'string', 'max:10'],
            'items.*.aktif' => ['boolean'],
        ]);

        return response()->json([
            'items' => $savePendidikan->handle($employee, $data['items']),
            'progress' => $getProgress->handle($employee->fresh()),
        ]);
    }

    /**
     * Save the family members step.
     */
    public function updateKeluarga(
        Request $request,
        Employee $employee,
        SaveAnggotaKeluargaService $saveKeluarga,
        GetWizardProgressService $getProgress,
    ) {
        $data = $request->validate([
            'items' => ['present', 'array'],
            'items.*.hubungan' => ['required', 'string', 'in:AYAH,IBU,SAUDARA,SUAMI,ISTRI,ANAK'],
            'items.*.urutan' => ['nullable', 'integer', 'min:1', 'max:100'],
            'items.*.nama' => ['nullable', 'string', 'max:255'],
            'items.*.usia' => ['nullable', 'integer', 'min:0', 'max:150'],
            'items.*.pekerjaan' => ['nullable', 'string', 'max:255'],
            'items.*.aktif' => ['boolean'],
        ]);

        return response()->json([
            'items' => $saveKeluarga->handle($employee, $data['items']),
            'progress' => $getProgress->handle($employee->fresh()),
        ]);
    }

    /**
     * Save the physical traits step.
     */
    public function updateCiriFisik(
        Request $request,
        Employee $employee,
        SaveCiriFisikService $saveCiriFisik,
        GetWizardProgressService $getProgress,
    ) {
        $data = $request->validate([
            'warna_kulit' => ['nullable', 'string', 'max:255'],
            'golongan_darah' => ['nullable', 'string', 'max:5'],
            'warna_rambut' => ['nullable', 'string', 'max:255'],
            'ukuran_baju' => ['nullable', 'string', 'max:20'],
            'warna_mata' => ['nullable', 'string', 'max:255'],
            'ukuran_celana' => ['nullable', 'string', 'max:20'],
            'tinggi_badan' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'ukuran_sepatu' => ['nullable', 'string', 'max:20'],
            'berat_badan' => ['nullable', 'numeric', 'min:0', 'max:500'],
        ]);

        return response()->json([
            'data' => $saveCiriFisik->handle($employee, $data),
            'progress' => $getProgress->handle($employee->fresh()),
        ]);
    }

    /**
     * Save the KK, KTP, and NPWP numbers on the file step.
     */
    public function updateNomorDokumen(
        Request $request,
        Employee $employee,
        SaveNomorDokumenService $saveNomorDokumen,
        GetWizardProgressService $getProgress,
    ) {
        $data = $request->validate([
            'nomor' => ['required', 'array'],
            'nomor.KK' => ['nullable', 'string', 'max:50'],
            'nomor.KTP' => ['nullable', 'string', 'max:50'],
            'nomor.NPWP' => ['nullable', 'string', 'max:50'],
        ]);

        foreach ($data['nomor'] as $kategori => $nomor) {
            $this->validateNomor($kategori, $nomor);
        }

        return response()->json([
            'nomor' => $saveNomorDokumen->handle($employee, $data['nomor']),
            'progress' => $getProgress->handle($employee->fresh()),
        ]);
    }

    /**
     * Upload a document on the file step.
     */
    public function storeDokumen(
        Request $request,
        Employee $employee,
        UploadDokumenService $uploadDokumen,
        GetWizardProgressService $getProgress,
    ) {
        $data = $request->validate([
            'kategori' => ['required', 'string', 'in:KK,KTP,NPWP,LAIN'],
            'judul' => ['nullable', 'string', 'max:120'],
            'nomor' => ['nullable', 'string', 'max:50'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ]);

        $this->validateNomor($data['kategori'], $data['nomor'] ?? null);

        $document = $uploadDokumen->handle(
            $employee,
            $request->file('file'),
            $data['kategori'],
            $data['judul'] ?? null,
            $data['nomor'] ?? null,
        );

        return response()->json([
            'dokumen' => $document,
            'progress' => $getProgress->handle($employee->fresh()),
        ], 201);
    }

    /**
     * Delete an uploaded document on the file step.
     */
    public function destroyDokumen(
        Employee $employee,
        EmployeeDocument $document,
        DeleteDokumenService $deleteDokumen,
        GetWizardProgressService $getProgress,
    ) {
        $deleteDokumen->handle($employee, $document);

        return response()->json([
            'progress' => $getProgress->handle($employee->fresh()),
        ]);
    }

    /**
     * Validation rules for the data pribadi step.
     *
     * @return array<string, array<int, mixed>>
     */
    private function dataPribadiRules(?Employee $employee = null): array
    {
        return [
            'nik' => [
                'required',
                'string',
                'max:30',
                Rule::unique('employees', 'nik')->ignore($employee?->id),
            ],
            'nama' => ['required', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'in:Laki-Laki,Perempuan'],
            'tempat_lahir' => ['required', 'string', 'max:255'],
            'tgl_lahir' => ['required', 'date'],
            'agama' => ['nullable', 'string', 'max:50'],
            'status_nikah' => ['required', 'string', 'max:30'],
            'jml_anak' => ['nullable', 'integer', 'min:0', 'max:50'],
            'jabatan' => ['required', 'string', 'max:255'],
            'status_pegawai' => ['required', 'string', 'in:Aktif,Tidak Aktif'],
            'departemen' => ['required', 'string', 'max:255'],
            'posisi' => ['required', 'string', 'max:255'],
            'tgl_gabung' => ['required', 'date'],
            'email' => ['required', 'email', 'max:255'],
            'hp1' => ['required', 'string', 'max:30'],
            'hp2' => ['nullable', 'string', 'max:30'],
            'alamat_ktp' => ['required', 'string', 'max:2000'],
            'alamat_dom' => ['nullable', 'string', 'max:2000'],
            'rumah' => ['nullable', 'string', 'max:50'],
            'ktp' => ['required', 'string', 'max:30'],
            'passport' => ['nullable', 'string', 'max:30'],
            'npwp' => ['nullable', 'string', 'max:30'],
            'bpjs_tk' => ['nullable', 'string', 'max:30'],
            'bpjs_kes' => ['nullable', 'string', 'max:30'],
            'rek_mandiri' => ['nullable', 'string', 'max:50'],
            'faskes_terpilih' => ['boolean'],
            'faskes_provinsi' => ['nullable', 'string', 'max:255'],
            'faskes_kantor_regional' => ['nullable', 'string', 'max:255'],
            'faskes_kantor_cabang' => ['nullable', 'string', 'max:255'],
            'faskes_kabupaten_kota' => ['nullable', 'string', 'max:255'],
            'faskes_kode_ppk' => ['nullable', 'string', 'max:30'],
            'faskes_nama_ppk' => ['nullable', 'string', 'max:255'],
            'faskes_alamat_ppk' => ['nullable', 'string', 'max:255'],
            'faskes_telp_ppk' => ['nullable', 'string', 'max:30'],
            'code_pajak' => ['nullable', 'string', 'max:20'],
            'code_nikah' => ['nullable', 'string', 'max:20'],
            'code_status' => ['nullable', 'string', 'max:20'],
            'dr_nama1' => ['nullable', 'string', 'max:255'],
            'dr_telp1' => ['nullable', 'string', 'max:30'],
            'dr_hub1' => ['nullable', 'string', 'max:255'],
            'dr_nama2' => ['nullable', 'string', 'max:255'],
            'dr_telp2' => ['nullable', 'string', 'max:30'],
            'dr_hub2' => ['nullable', 'string', 'max:255'],
            'facebook' => ['nullable', 'string', 'max:255'],
            'instagram' => ['nullable', 'string', 'max:255'],
            'twitter' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Build the small employee payload used by the wizard.
     */
    private function employeePayload(Employee $employee): array
    {
        return [
            'id' => $employee->id,
            'nik' => $employee->nik,
            'nama' => $employee->nama,
        ];
    }

    /**
     * Validate the document number format for a category.
     */
    private function validateNomor(string $kategori, ?string $nomor): void
    {
        if ($nomor === null || trim($nomor) === '' || $kategori === 'LAIN') {
            return;
        }

        $digits = preg_replace('/\D/', '', $nomor) ?? '';

        if (in_array($kategori, ['KK', 'KTP'], true) && strlen($digits) !== 16) {
            throw ValidationException::withMessages([
                'nomor.'.$kategori => 'Nomor '.$kategori.' harus 16 digit angka.',
            ]);
        }

        if ($kategori === 'NPWP' && ! in_array(strlen($digits), [15, 16], true)) {
            throw ValidationException::withMessages([
                'nomor.NPWP' => 'Nomor NPWP harus 15 atau 16 digit angka.',
            ]);
        }
    }
}
