<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDocumentNumber extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'kategori',
        'nomor',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
