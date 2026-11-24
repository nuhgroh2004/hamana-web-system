<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PermohonanRequest extends Model
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_MENUNGGU = 'menunggu';
    public const STATUS_DISETUJUI = 'disetujui';
    public const STATUS_DITOLAK = 'ditolak';
    public const STATUS_BATAL = 'batal';

    public const TYPE_CUTI = 'izin-cuti-atau-sakit';
    public const TYPE_KELUAR = 'izin-keluar-kantor';
    public const TYPE_DINAS_DALAM = 'izin-dinas-dalam-kota';
    public const TYPE_DINAS_LUAR = 'izin-dinas-luar-kota';
    public const TYPE_ABSENSI = 'form-absensi';

    protected $fillable = [
        'user_id',
        'approver_id',
        'form_type',
        'nomor',
        'status',
        'tanggal_pengajuan',
        'form_data',
        'signature_applicant',
        'signature_approver',
        'rejection_reason',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'form_data' => 'array',
        'tanggal_pengajuan' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(PermohonanAttachment::class);
    }

    public static function getFormTitle(?string $formType = null): string
    {
        return match ($formType) {
            self::TYPE_CUTI => 'Izin Cuti atau Sakit',
            self::TYPE_KELUAR => 'Izin Keluar Kantor',
            self::TYPE_DINAS_DALAM => 'Izin Dinas Dalam Kota',
            self::TYPE_DINAS_LUAR => 'Izin Dinas Luar Kota',
            self::TYPE_ABSENSI => 'Form Pengajuan Absensi',
            default => 'Permohonan',
        };
    }
}
