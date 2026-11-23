<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDocument extends Model
{
    /**
     * Categories that only allow one document per employee.
     *
     * @var list<string>
     */
    public const MAIN_CATEGORIES = ['KK', 'KTP', 'NPWP'];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'kategori',
        'judul',
        'nama_file',
        'path',
        'mime_type',
        'ukuran',
        'diunggah_pada',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ukuran' => 'integer',
            'diunggah_pada' => 'datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
