<?php

namespace App\Services\Permohonan;

use App\Models\User;

class GetSignatureService
{
    public function __invoke(User $user): ?array
    {
        $sig = $user->signature;

        if (! $sig) {
            return null;
        }

        return [
            'png' => $sig->signature_data,
            'tgl' => $sig->updated_at->toISOString(),
        ];
    }
}
