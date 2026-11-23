<?php

namespace App\Services\Access;

use App\Models\User;
use App\Support\Modules;

class ToggleUserModuleAccessService
{
    public function __construct(
        private readonly SaveUserAccessPermissionsService $savePermissions,
    ) {}

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

        $this->savePermissions->handle($user, $permissions);
    }
}
