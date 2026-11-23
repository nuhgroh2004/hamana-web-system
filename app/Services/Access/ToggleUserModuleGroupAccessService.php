<?php

namespace App\Services\Access;

use App\Models\User;

class ToggleUserModuleGroupAccessService
{
    public function __construct(
        private readonly SaveUserAccessPermissionsService $savePermissions,
    ) {}

    /**
     * @param  list<string>  $slugs
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

        $this->savePermissions->handle($user, $permissions);
    }
}
