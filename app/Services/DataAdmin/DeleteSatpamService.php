<?php

namespace App\Services\DataAdmin;

use App\Models\User;

class DeleteSatpamService
{
    /**
     * Delete a satpam account.
     */
    public function handle(User $user): void
    {
        $user->delete();
    }
}
