<?php

namespace App\Services\Access;

use App\Models\User;

class SetUserCustomAccessService
{
    public function handle(User $user): void
    {
        if ($user->isAdmin() || $user->permissions !== null) {
            return;
        }

        $user->permissions = $user->permissionList();
        $user->save();
    }
}
