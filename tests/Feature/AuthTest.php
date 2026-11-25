<?php

namespace Tests\Feature;

use App\Models\User;
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
        $this->get(route('login'))
            ->assertOk()
            ->assertSee('id="remember"', false)
            ->assertSee('checked', false);
    }

    public function test_csrf_token_endpoint_returns_current_session_token(): void
    {
        $user = User::factory()->make();

        $response = $this->actingAs($user)->getJson('/csrf-token');

        $response->assertOk()
            ->assertJsonStructure(['token']);

        $this->assertSame(session()->token(), $response->json('token'));
    }
}
