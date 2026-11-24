<?php

namespace App\Services\Permohonan;

use App\Models\User;

class GetUserContextService
{
    public function __invoke(User $user): array
    {
        $emp = $user->employee;

        return [
            'id' => $user->id,
            'nama' => $emp?->nama ?: $user->name,
            'nik' => $emp?->nik ?: ($user->nik ?: '-'),
            'jabatan' => $emp?->jabatan ?: ($user->position ?: '-'),
            'bagian' => $emp?->posisi ?: ($user->position ?: '-'),
            'dept' => $emp?->posisi ?: ($user->position ?: '-'),
            'npk' => $emp?->nik ?: '-',
        ];
    }
}
