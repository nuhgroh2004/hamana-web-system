<?php

namespace App\Livewire\Auth;

use Livewire\Component;

class Login extends Component
{
    public function render()
    {
        return view('auth.index')->layout('components.layouts.auth', [
            'title' => 'Masuk · Hamana Works Indonesia',
        ]);
    }
}
