<?php

namespace App\Services\Profile;

use App\Models\Employee;
use Illuminate\Support\Facades\DB;

class SaveDataPribadiService
{
    /**
     * Persist the Data Pribadi form into the employee and profile tables.
     */
    public function handle(Employee $employee, array $data): Employee
    {
        return DB::transaction(function () use ($employee, $data) {
            $nik = trim((string) ($data['nik'] ?? ''));
            $nama = trim((string) ($data['nama'] ?? ''));

            $employee->update([
                'nik' => $nik !== '' ? $nik : $employee->nik,
                'nama' => $nama !== '' ? $nama : $employee->nama,
                'jabatan' => $data['jabatan'] ?? null,
                'posisi' => $data['posisi'] ?? null,
                'status_pegawai' => $data['status_pegawai'] ?? Employee::STATUS_AKTIF,
            ]);

            $employee->profile()->updateOrCreate(
                ['employee_id' => $employee->id],
                [
                    'jenis_kelamin' => $data['gender'] ?? null,
                    'tempat_lahir' => $data['tempat_lahir'] ?? null,
                    'tanggal_lahir' => $this->date($data['tgl_lahir'] ?? null),
                    'agama' => $data['agama'] ?? null,
                    'status_nikah' => $data['status_nikah'] ?? null,
                    'jumlah_anak' => $this->number($data['jml_anak'] ?? null),
                    'departemen' => $data['departemen'] ?? null,
                    'tanggal_gabung' => $this->date($data['tgl_gabung'] ?? null),
                    'email' => $data['email'] ?? null,
                    'no_hp_1' => $data['hp1'] ?? null,
                    'no_hp_2' => $data['hp2'] ?? null,
                    'alamat_ktp' => $data['alamat_ktp'] ?? null,
                    'alamat_domisili' => $data['alamat_dom'] ?? null,
                    'status_rumah' => $data['rumah'] ?? null,
                    'no_ktp' => $data['ktp'] ?? null,
                    'no_passport' => $data['passport'] ?? null,
                    'npwp' => $data['npwp'] ?? null,
                    'bpjs_ketenagakerjaan' => $data['bpjs_tk'] ?? null,
                    'bpjs_kesehatan' => $data['bpjs_kes'] ?? null,
                    'rekening_mandiri' => $data['rek_mandiri'] ?? null,
                    'faskes_terpilih' => (bool) ($data['faskes_terpilih'] ?? false),
                    'faskes_provinsi' => $data['faskes_provinsi'] ?? null,
                    'faskes_kantor_regional' => $data['faskes_kantor_regional'] ?? null,
                    'faskes_kantor_cabang' => $data['faskes_kantor_cabang'] ?? null,
                    'faskes_kabupaten_kota' => $data['faskes_kabupaten_kota'] ?? null,
                    'faskes_kode_ppk' => $data['faskes_kode_ppk'] ?? null,
                    'faskes_nama_ppk' => $data['faskes_nama_ppk'] ?? null,
                    'faskes_alamat_ppk' => $data['faskes_alamat_ppk'] ?? null,
                    'faskes_telp_ppk' => $data['faskes_telp_ppk'] ?? null,
                    'code_grup_pajak' => $this->upper($data['code_pajak'] ?? null),
                    'code_grup_status_nikah' => $this->upper($data['code_nikah'] ?? null),
                    'code_status_pajak' => $this->upper($data['code_status'] ?? null),
                    'darurat_nama_1' => $data['dr_nama1'] ?? null,
                    'darurat_telp_1' => $data['dr_telp1'] ?? null,
                    'darurat_hubungan_1' => $data['dr_hub1'] ?? null,
                    'darurat_nama_2' => $data['dr_nama2'] ?? null,
                    'darurat_telp_2' => $data['dr_telp2'] ?? null,
                    'darurat_hubungan_2' => $data['dr_hub2'] ?? null,
                    'facebook' => $data['facebook'] ?? null,
                    'instagram' => $data['instagram'] ?? null,
                    'twitter' => $data['twitter'] ?? null,
                ],
            );

            return $employee->fresh();
        });
    }

    /**
     * Normalize an optional date value.
     */
    private function date(?string $value): ?string
    {
        return $value !== null && $value !== '' ? $value : null;
    }

    /**
     * Normalize an optional numeric value.
     */
    private function number(mixed $value): ?int
    {
        return $value !== null && $value !== '' ? (int) $value : null;
    }

    /**
     * Normalize a code value to uppercase.
     */
    private function upper(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : mb_strtoupper($value);
    }
}
