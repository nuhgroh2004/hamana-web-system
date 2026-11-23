<?php

namespace App\Services\Access;

use App\Models\User;

class ToggleUserModuleGroupAccessService
{
    /**
     * @param list<string> $slugs
     */
    public function handle(User $user, array $slugs, bool $enabled): void
    {
        if ($user->isAdmin()) {
            return;
        }

        $permissions = $user->permissionList();
        $permissions = $enabled
            ? array_merge($permissions, $slugs)
            : array_diff($permissions, $slugs);

        $user->permissions = array_values(array_unique($permissions));
        $user->save();
    }
}
