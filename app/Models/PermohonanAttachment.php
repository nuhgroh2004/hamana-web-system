<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PermohonanAttachment extends Model
{
    protected $fillable = [
        'permohonan_request_id',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
    ];

    protected $appends = ['url'];

    public function permohonanRequest(): BelongsTo
    {
        return $this->belongsTo(PermohonanRequest::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }
}

