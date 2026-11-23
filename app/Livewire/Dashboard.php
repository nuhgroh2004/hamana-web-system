<?php

namespace App\Livewire;

use App\Services\Employee\ResolveEmployeeService;
use Livewire\Component;

class Dashboard extends Component
{
    public function render()
    {
        $user = auth()->user();
        $employee = app(ResolveEmployeeService::class)->handle($user);
        $profile = $employee->profile;

        $photoUrl = null;

        if ($profile?->foto_path) {
            $photoUrl = route('api.profil.foto', $employee)
                .'?v='.($profile->updated_at?->timestamp ?? time());
        }

        return view('hris.dashboard.index', [
            'user' => $user,
            'photoUrl' => $photoUrl,
            'position' => $employee->posisi ?: ($employee->jabatan ?: $user->position),
        ])->layout('components.layouts.app', [
            'title' => 'Dashboard',
            'active' => 'Dashboard',
            'main' => 'dash-on',
        ]);
    }
}
