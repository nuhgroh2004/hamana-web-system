<?php

namespace App\Livewire;

use Livewire\Component;

class Pengaturan extends Component
{
    public function render()
    {
        return view('pengaturan.index')->layout('components.layouts.app', [
            'title' => 'Pengaturan',
            'active' => 'Pengaturan',
            'main' => 'set-page',
        ]);
    }
}
