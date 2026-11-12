<?php

namespace Tests\Feature;

use App\Livewire\Auth\Login;
use App\Models\User;
use Livewire\Livewire;
use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_logout_redirects_to_login(): void
    {
        $user = User::factory()->make();

        $this->actingAs($user)
            ->post('/logout')
            ->assertRedirect(route('login'));

        $this->assertGuest();
    }

    public function test_remember_me_is_checked_by_default(): void
    {
        Livewire::test(Login::class)
            ->assertSet('remember', true);
    }
}
