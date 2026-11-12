<?php

namespace App\Livewire\Auth;

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Validate;
use Livewire\Component;

class Login extends Component
{
    #[Validate('required|email')]
    public string $email = '';

    #[Validate('required|string|min:6')]
    public string $password = '';

    public bool $remember = false;

    public function login()
    {
        $this->validate();

        if (! Auth::attempt([
            'email' => $this->email,
            'password' => $this->password,
        ], $this->remember)) {
            $this->reset('password');
            $this->addError('email', 'Email atau password salah.');

            return;
        }

        session()->regenerate();

        return $this->redirectIntended(route('dashboard'), navigate: true);
    }

    /**
     * Validation messages in Indonesian.
     *
     * @return array<string, string>
     */
    protected function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
        ];
    }

    public function render()
    {
        return view('auth.index')->layout('components.layouts.auth', [
            'title' => 'Masuk · Hamana Works Indonesia',
        ]);
    }
}
