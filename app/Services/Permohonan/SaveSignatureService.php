<?php

namespace App\Services\Permohonan;

use App\Models\User;
use App\Models\UserSignature;

class SaveSignatureService
{
    public function __invoke(User $user, string $png): UserSignature
    {
        return UserSignature::updateOrCreate(
            ['user_id' => $user->id],
            ['signature_data' => $png]
        );
    }
}
