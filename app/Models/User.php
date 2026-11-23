<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Support\Modules;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';

    public const ROLE_KARYAWAN = 'karyawan';

    public const ROLE_SATPAM = 'satpam';

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
        'bahasa',
        'ubah-password',
    ];

    /**
     * Default page access for a satpam account.
     *
     * @var list<string>
     */
    public const SATPAM_PERMISSIONS = [
        'dashboard',
        'form-absensi',
        'saran',
        'ubah-password',
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
        'is_active',
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
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isActive(): bool
    {
        return $this->is_active !== false;
    }

    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
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

        $defaults = $this->role === self::ROLE_SATPAM
            ? static::SATPAM_PERMISSIONS
            : static::DEFAULT_PERMISSIONS;

        $permissions = is_array($this->permissions)
            ? $this->permissions
            : $defaults;

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
