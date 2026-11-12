<?php

namespace App\Livewire;

use App\Models\User;
use App\Support\Modules;
use Livewire\Component;

class Pengaturan extends Component
{
    /**
     * Turn one page permission on or off for a user.
     */
    public function toggleAccess(int $userId, string $slug): void
    {
        abort_unless(auth()->user()?->isAdmin(), 403);

        $user = User::findOrFail($userId);

        if ($user->isAdmin() || ! Modules::find($slug)) {
            return;
        }

        $allowed = $user->permissionList();

        if (in_array($slug, $allowed, true)) {
            $allowed = array_values(array_diff($allowed, [$slug]));
        } else {
            $allowed[] = $slug;
        }

        $user->permissions = array_values(array_unique($allowed));
        $user->save();
    }

    /**
     * Restore the default karyawan permissions.
     */
    public function resetAccess(int $userId): void
    {
        abort_unless(auth()->user()?->isAdmin(), 403);

        $user = User::findOrFail($userId);

        if ($user->isAdmin()) {
            return;
        }

        $user->permissions = null;
        $user->save();
    }

    public function render()
    {
        return view('pengaturan.index', [
            'users' => User::query()
                ->orderByRaw("case when role = 'admin' then 0 else 1 end")
                ->orderBy('name')
                ->get(),
            'moduleGroups' => Modules::menu(),
        ])->layout('components.layouts.app', [
            'title' => 'Pengaturan',
            'active' => 'Pengaturan',
            'main' => 'set-page',
        ]);
    }
}
