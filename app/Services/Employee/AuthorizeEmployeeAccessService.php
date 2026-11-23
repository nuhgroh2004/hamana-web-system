<?php

namespace App\Services\Employee;

use App\Models\Employee;
use App\Models\User;

class AuthorizeEmployeeAccessService
{
    /**
     * Abort when the user is not allowed to read the employee's files.
     */
    public function handle(User $user, Employee $employee): void
    {
        if ($employee->user_id === $user->id) {
            return;
        }

        if ($user->isAdmin() || $user->canAccess('data-pegawai')) {
            return;
        }

        abort(403);
    }
}
