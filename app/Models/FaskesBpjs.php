<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaskesBpjs extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'nama_provinsi',
        'kantor_regional',
        'kantor_cabang',
        'kabupaten_kota',
        'kode_ppk',
        'nama_ppk',
        'alamat_ppk',
        'telp_ppk',
    ];
}
