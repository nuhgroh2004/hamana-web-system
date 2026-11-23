<?php

namespace App\Services\DataAdmin;

use App\Models\User;
use Illuminate\Validation\ValidationException;

class DeleteAdminService
{
    /**
     * Delete an admin account.
     */
    public function handle(User $user, User $actor): void
    {
        if ($user->id === $actor->id) {
            throw ValidationException::withMessages([
                'user' => 'Tidak dapat menghapus akun sendiri.',
            ]);
        }

        $isLastAdmin = User::query()
            ->where('role', User::ROLE_ADMIN)
            ->whereKeyNot($user->id)
            ->doesntExist();

        if ($isLastAdmin) {
            throw ValidationException::withMessages([
                'user' => 'Minimal harus ada satu admin.',
            ]);
        }

        $user->delete();
    }
}
