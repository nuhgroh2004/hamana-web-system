<?php

namespace App\Services\Permohonan;

use App\Models\User;
use Illuminate\Support\Collection;

class GetActiveEmployeesService
{
    public function __invoke(int $excludeUserId): Collection
    {
        return User::query()
            ->where('is_active', true)
            ->where('id', '!=', $excludeUserId)
            ->with('employee')
            ->get()
            ->map(function (User $u) {
                return [
                    'id' => $u->id,
                    'nama' => $u->employee?->nama ?: $u->name,
                    'jabatan' => $u->employee?->jabatan ?: ($u->position ?: 'Karyawan'),
                ];
            })
            ->sortBy('nama')
            ->values();
    }
}
