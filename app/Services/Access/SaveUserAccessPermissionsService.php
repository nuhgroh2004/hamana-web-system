<?php

namespace App\Services\Access;

use App\Models\User;
use App\Support\Modules;

class SaveUserAccessPermissionsService
{
    /**
     * Save a custom permission set, using null when it matches the default.
     *
     * @param  list<string>  $permissions
     */
    public function handle(User $user, array $permissions): void
    {
        if ($user->isAdmin()) {
            return;
        }

        $allModules = array_keys(Modules::all());
        $permissions = array_values(array_unique(array_intersect($permissions, $allModules)));
        $defaults = array_values(array_intersect(User::DEFAULT_PERMISSIONS, $allModules));
        $comparablePermissions = $permissions;

        sort($comparablePermissions);
        sort($defaults);

        $user->permissions = $comparablePermissions === $defaults ? null : $permissions;
        $user->save();
    }
}
