<?php

namespace App\Livewire;

use Livewire\Component;

class Dashboard extends Component
{
    public function render()
    {
        return view('hris.dashboard.index')->layout('components.layouts.app', [
            'title' => 'Dashboard',
            'active' => 'Dashboard',
            'main' => 'dash-on',
        ]);
    }
}
