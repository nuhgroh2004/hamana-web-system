<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Support\Modules;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Default page access for a karyawan account.
     *
     * @var list<string>
     */
    public const DEFAULT_PERMISSIONS = [
        'dashboard',
        'permohonan-masuk',
        'permohonan-saya',
        'izin-cuti-atau-sakit',
        'izin-keluar-kantor',
        'izin-dinas-dalam-kota',
        'izin-dinas-luar-kota',
        'form-absensi',
        'slip-gaji',
        'buku-hamana',
        'profil-data-pribadi',
        'profil-riwayat-pendidikan',
        'profil-anggota-keluarga',
        'profil-ciri-fisik',
        'profil-kelola-file',
        'saran',
        'tanda-tangan',
        'ubah-password',
        'pengaturan',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nik',
        'name',
        'email',
        'password',
        'role',
        'position',
        'permissions',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'permissions' => 'array',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * All page slugs the user is allowed to open.
     *
     * @return list<string>
     */
    public function permissionList(): array
    {
        $all = array_keys(Modules::all());

        if ($this->isAdmin()) {
            return $all;
        }

        $permissions = is_array($this->permissions)
            ? $this->permissions
            : static::DEFAULT_PERMISSIONS;

        return array_values(array_intersect($permissions, $all));
    }

    public function canAccess(?string $slug): bool
    {
        if (! $slug) {
            return false;
        }

        return in_array($slug, $this->permissionList(), true);
    }
}
