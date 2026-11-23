<?php

namespace App\Services\Profile;

use App\Models\Employee;
use App\Models\EmployeeProfile;

class GetDataPribadiService
{
    /**
     * Build the Data Pribadi payload for the profile form.
     */
    public function handle(Employee $employee): array
    {
        $profile = $employee->profile;
        $profile ??= new EmployeeProfile(['employee_id' => $employee->id]);

        return [
            'employee_id' => $employee->id,
            'nik' => $employee->nik,
            'nama' => $employee->nama,
            'gender' => $profile->jenis_kelamin,
            'tempat_lahir' => $profile->tempat_lahir,
            'tgl_lahir' => $this->date($profile->tanggal_lahir),
            'agama' => $profile->agama,
            'status_nikah' => $profile->status_nikah,
            'jml_anak' => $profile->jumlah_anak,
            'jabatan' => $employee->jabatan,
            'status_pegawai' => $employee->status_pegawai,
            'departemen' => $profile->departemen,
            'posisi' => $employee->posisi,
            'tgl_gabung' => $this->date($profile->tanggal_gabung),
            'email' => $profile->email,
            'hp1' => $profile->no_hp_1,
            'hp2' => $profile->no_hp_2,
            'alamat_ktp' => $profile->alamat_ktp,
            'alamat_dom' => $profile->alamat_domisili,
            'rumah' => $profile->status_rumah,
            'ktp' => $profile->no_ktp,
            'passport' => $profile->no_passport,
            'npwp' => $profile->npwp,
            'bpjs_tk' => $profile->bpjs_ketenagakerjaan,
            'bpjs_kes' => $profile->bpjs_kesehatan,
            'rek_mandiri' => $profile->rekening_mandiri,
            'faskes_terpilih' => (bool) $profile->faskes_terpilih,
            'faskes_provinsi' => $profile->faskes_provinsi,
            'faskes_kantor_regional' => $profile->faskes_kantor_regional,
            'faskes_kantor_cabang' => $profile->faskes_kantor_cabang,
            'faskes_kabupaten_kota' => $profile->faskes_kabupaten_kota,
            'faskes_kode_ppk' => $profile->faskes_kode_ppk,
            'faskes_nama_ppk' => $profile->faskes_nama_ppk,
            'faskes_alamat_ppk' => $profile->faskes_alamat_ppk,
            'faskes_telp_ppk' => $profile->faskes_telp_ppk,
            'code_pajak' => $profile->code_grup_pajak,
            'code_nikah' => $profile->code_grup_status_nikah,
            'code_status' => $profile->code_status_pajak,
            'dr_nama1' => $profile->darurat_nama_1,
            'dr_telp1' => $profile->darurat_telp_1,
            'dr_hub1' => $profile->darurat_hubungan_1,
            'dr_nama2' => $profile->darurat_nama_2,
            'dr_telp2' => $profile->darurat_telp_2,
            'dr_hub2' => $profile->darurat_hubungan_2,
            'facebook' => $profile->facebook,
            'instagram' => $profile->instagram,
            'twitter' => $profile->twitter,
            'photo_url' => $profile->foto_path
                ? route('api.profil.foto', ['employee' => $employee->id, 'v' => $profile->updated_at?->timestamp])
                : null,
        ];
    }

    /**
     * Format a nullable date for the form.
     */
    private function date(mixed $value): ?string
    {
        return $value ? $value->format('Y-m-d') : null;
    }
}
