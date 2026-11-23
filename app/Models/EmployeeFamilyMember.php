<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeFamilyMember extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'hubungan',
        'urutan',
        'nama',
        'usia',
        'pekerjaan',
        'aktif',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
            'usia' => 'integer',
            'aktif' => 'boolean',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
