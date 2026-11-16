<?php

namespace Tests\Feature;

use App\Livewire\Pengaturan;
use App\Models\User;
use App\Support\Modules;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Livewire\Livewire;
use Tests\TestCase;

class SettingsAccessTest extends TestCase
{
    use DatabaseTransactions;

    private const SETTINGS = ['bahasa', 'hak-akses', 'absensi-by-foto', 'daftar-hitam-presensi', 'ubah-password'];

    private function makeUser(array $attributes = []): User
    {
        return User::factory()->create($attributes);
    }

    public function test_settings_slugs_replace_pengaturan_permission(): void
    {
        $all = Modules::all();

        foreach (self::SETTINGS as $slug) {
            $this->assertArrayHasKey($slug, $all);
        }

        $this->assertArrayNotHasKey('pengaturan', $all);
    }

    public function test_default_user_only_gets_bahasa_and_ubah_password(): void
    {
        $user = $this->makeUser([
            'email' => 'settings-default@hamana.co.id',
            'nik' => '9111.00.00.01',
            'permissions' => null,
        ]);

        $settings = array_values(array_intersect(self::SETTINGS, $user->permissionList()));

        $this->assertSame(['bahasa', 'ubah-password'], $settings);

        $this->actingAs($user)->get('/pengaturan')->assertOk();
        $this->actingAs($user)->get('/pengaturan/bahasa')->assertOk();
        $this->actingAs($user)->get('/pengaturan/ubah-password')->assertOk();
        $this->actingAs($user)->get('/pengaturan/hak-akses')->assertForbidden();
        $this->actingAs($user)->get('/pengaturan/absensi-by-foto')->assertForbidden();
        $this->actingAs($user)->get('/pengaturan/daftar-hitam-presensi')->assertForbidden();
    }

    public function test_custom_user_gets_only_the_granted_settings_pages(): void
    {
        $user = $this->makeUser([
            'email' => 'settings-custom@hamana.co.id',
            'nik' => '9111.00.00.02',
            'permissions' => ['dashboard', 'bahasa', 'hak-akses'],
        ]);

        $this->actingAs($user)->get('/pengaturan/hak-akses')->assertOk();
        $this->actingAs($user)->get('/pengaturan/bahasa')->assertOk();
        $this->actingAs($user)->get('/pengaturan/ubah-password')->assertForbidden();
        $this->actingAs($user)->get('/pengaturan/absensi-by-foto')->assertForbidden();

        Livewire::actingAs($user)
            ->test(Pengaturan::class)
            ->assertSet('panel', 'bahasa');

        $this->assertSame(
            ['bahasa', 'hak-akses'],
            array_values(array_intersect(self::SETTINGS, $user->permissionList())),
        );
    }

    public function test_user_without_settings_access_cannot_open_settings(): void
    {
        $user = $this->makeUser([
            'email' => 'settings-none@hamana.co.id',
            'nik' => '9111.00.00.03',
            'permissions' => ['dashboard'],
        ]);

        $this->actingAs($user)->get('/pengaturan')->assertForbidden();
        $this->actingAs($user)->get('/pengaturan/bahasa')->assertForbidden();

        $nav = collect(Modules::menuFor($user))->flatMap(fn ($g) => $g['items'] ?? []);
        $this->assertFalse($nav->contains(fn ($item) => ($item['slug'] ?? null) === 'pengaturan'));
    }

    public function test_admin_has_full_settings_access(): void
    {
        $admin = $this->makeUser([
            'email' => 'settings-admin@hamana.co.id',
            'nik' => '9111.00.00.04',
            'role' => 'admin',
        ]);

        foreach (self::SETTINGS as $slug) {
            $this->actingAs($admin)->get('/pengaturan/'.$slug)->assertOk();
        }

        $this->actingAs($admin)
            ->get('/pengaturan/hak-akses')
            ->assertOk()
            ->assertSee('Setting')
            ->assertDontSee('Lainnya')
            ->assertSee('Bahasa')
            ->assertSee('Daftar Hitam Presensi');
    }

    public function test_default_user_still_sees_the_settings_nav_entry(): void
    {
        $user = $this->makeUser([
            'email' => 'settings-nav@hamana.co.id',
            'nik' => '9111.00.00.05',
            'permissions' => null,
        ]);

        $groups = Modules::menuFor($user);
        $nav = collect($groups)->flatMap(fn ($g) => $g['items'] ?? []);

        $this->assertTrue($nav->contains(fn ($item) => ($item['slug'] ?? null) === 'pengaturan'));
        $this->assertFalse(collect($groups)->contains(fn ($g) => ($g['label'] ?? null) === 'Setting'));
    }

    public function test_settings_sidebar_only_lists_accessible_panels(): void
    {
        $user = $this->makeUser([
            'email' => 'settings-sidebar@hamana.co.id',
            'nik' => '9111.00.00.06',
            'permissions' => null,
        ]);

        $this->actingAs($user)
            ->get('/pengaturan')
            ->assertOk()
            ->assertSee('Bahasa')
            ->assertSee('Ubah Password')
            ->assertDontSee('Hak Akses')
            ->assertDontSee('Absensi by Foto')
            ->assertDontSee('Daftar Hitam Presensi');
    }

    public function test_hak_akses_page_is_read_only_for_non_admin(): void
    {
        $user = $this->makeUser([
            'email' => 'settings-readonly@hamana.co.id',
            'nik' => '9111.00.00.07',
            'permissions' => ['bahasa', 'hak-akses'],
        ]);

        Livewire::actingAs($user)
            ->test(Pengaturan::class, ['panel' => 'hak-akses'])
            ->assertSee('Hanya admin yang dapat mengubah')
            ->assertDontSee('Tambah Pengguna')
            ->assertDontSee('Nonaktifkan semua');
    }

    public function test_hak_akses_page_shows_setting_group_for_admin(): void
    {
        $admin = $this->makeUser([
            'email' => 'settings-group@hamana.co.id',
            'nik' => '9111.00.00.08',
            'role' => 'admin',
        ]);

        Livewire::actingAs($admin)
            ->test(Pengaturan::class, ['panel' => 'hak-akses'])
            ->assertSee('Setting')
            ->assertDontSee('Lainnya')
            ->assertSee('Tambah Pengguna')
            ->assertSee('Nonaktifkan semua')
            ->assertSee('Daftar Hitam Presensi');
    }
}
