<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeePhysical extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'warna_kulit',
        'golongan_darah',
        'warna_rambut',
        'ukuran_baju',
        'warna_mata',
        'ukuran_celana',
        'tinggi_badan',
        'ukuran_sepatu',
        'berat_badan',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tinggi_badan' => 'decimal:2',
            'berat_badan' => 'decimal:2',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
