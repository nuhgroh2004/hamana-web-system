<?php

namespace App\Services\Access;

use App\Models\User;
use App\Support\Modules;

class ToggleUserModuleAccessService
{
    public function handle(User $user, string $slug): void
    {
        if ($user->isAdmin() || ! Modules::find($slug)) {
            return;
        }

        $permissions = $user->permissionList();

        if (in_array($slug, $permissions, true)) {
            $permissions = array_diff($permissions, [$slug]);
        } else {
            $permissions[] = $slug;
        }

        $user->permissions = array_values(array_unique($permissions));
        $user->save();
    }
}
