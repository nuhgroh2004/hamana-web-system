<?php

namespace App\Services\Access;

use App\Models\User;

class SetUserDefaultAccessService
{
    public function handle(User $user): void
    {
        if ($user->isAdmin() || $user->permissions === null) {
            return;
        }

        $user->permissions = null;
        $user->save();
    }
}
