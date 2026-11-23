<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeProfile extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'agama',
        'status_nikah',
        'jumlah_anak',
        'departemen',
        'tanggal_gabung',
        'email',
        'no_hp_1',
        'no_hp_2',
        'alamat_ktp',
        'alamat_domisili',
        'propinsi',
        'status_rumah',
        'no_ktp',
        'no_passport',
        'npwp',
        'bpjs_ketenagakerjaan',
        'bpjs_kesehatan',
        'rekening_mandiri',
        'faskes_terpilih',
        'faskes_provinsi',
        'faskes_kantor_regional',
        'faskes_kantor_cabang',
        'faskes_kabupaten_kota',
        'faskes_kode_ppk',
        'faskes_nama_ppk',
        'faskes_alamat_ppk',
        'faskes_telp_ppk',
        'code_grup_pajak',
        'code_grup_status_nikah',
        'code_status_pajak',
        'darurat_nama_1',
        'darurat_telp_1',
        'darurat_hubungan_1',
        'darurat_nama_2',
        'darurat_telp_2',
        'darurat_hubungan_2',
        'facebook',
        'instagram',
        'twitter',
        'foto_path',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'tanggal_gabung' => 'date',
            'jumlah_anak' => 'integer',
            'faskes_terpilih' => 'boolean',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
