<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Employee extends Model
{
    use HasFactory;

    public const STATUS_AKTIF = 'Aktif';

    public const STATUS_TIDAK_AKTIF = 'Tidak Aktif';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'nik',
        'nama',
        'jabatan',
        'posisi',
        'status_pegawai',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(EmployeeProfile::class);
    }

    public function educations(): HasMany
    {
        return $this->hasMany(EmployeeEducation::class)->orderBy('jenjang')->orderBy('id');
    }

    public function familyMembers(): HasMany
    {
        return $this->hasMany(EmployeeFamilyMember::class)->orderBy('hubungan')->orderBy('urutan');
    }

    public function physical(): HasOne
    {
        return $this->hasOne(EmployeePhysical::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class)->latest('diunggah_pada');
    }

    public function documentNumbers(): HasMany
    {
        return $this->hasMany(EmployeeDocumentNumber::class);
    }

    public function isAktif(): bool
    {
        return $this->status_pegawai === self::STATUS_AKTIF;
    }
}
