<?php

namespace Tests\Feature;

use App\Livewire\Pengaturan;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Livewire\Livewire;
use Tests\TestCase;

class PengaturanUserTest extends TestCase
{
    use DatabaseTransactions;

    private function makeUser(array $attributes = []): User
    {
        return User::factory()->create($attributes);
    }

    private function makeAdmin(): User
    {
        return $this->makeUser([
            'nik' => '9000.00.00.01',
            'email' => 'admin-crud@hamana.co.id',
            'role' => 'admin',
        ]);
    }

    private function formData(array $overrides = []): array
    {
        return array_merge([
            'formNik' => '8000.00.00.01',
            'formName' => 'Pengguna Baru',
            'formEmail' => 'pengguna-baru@hamana.co.id',
            'formPassword' => 'password',
            'formRole' => 'karyawan',
            'formPosition' => 'Staff Test',
        ], $overrides);
    }

    public function test_admin_can_create_user(): void
    {
        $admin = $this->makeAdmin();

        Livewire::actingAs($admin)
            ->test(Pengaturan::class)
            ->call('openCreateForm')
            ->set($this->formData())
            ->call('saveUser')
            ->assertHasNoErrors()
            ->assertSet('showUserForm', false)
            ->assertSet('userStatus', 'Pengguna baru ditambahkan.');

        $user = User::where('email', 'pengguna-baru@hamana.co.id')->first();

        $this->assertNotNull($user);
        $this->assertSame('8000.00.00.01', $user->nik);
        $this->assertSame('Pengguna Baru', $user->name);
        $this->assertSame('karyawan', $user->role);
        $this->assertSame('Staff Test', $user->position);
        $this->assertNull($user->permissions);
        $this->assertTrue(Hash::check('password', $user->password));
    }

    public function test_invalid_nik_is_rejected(): void
    {
        $admin = $this->makeAdmin();

        Livewire::actingAs($admin)
            ->test(Pengaturan::class)
            ->call('openCreateForm')
            ->set($this->formData(['formNik' => '1232.31.23']))
            ->call('saveUser')
            ->assertHasErrors(['formNik' => 'regex']);

        $this->assertDatabaseMissing('users', ['email' => 'pengguna-baru@hamana.co.id']);
    }

    public function test_duplicate_nik_and_email_are_rejected(): void
    {
        $admin = $this->makeAdmin();

        Livewire::actingAs($admin)
            ->test(Pengaturan::class)
            ->call('openCreateForm')
            ->set($this->formData(['formNik' => $admin->nik]))
            ->call('saveUser')
            ->assertHasErrors(['formNik' => 'unique']);

        Livewire::actingAs($admin)
            ->test(Pengaturan::class)
            ->call('openCreateForm')
            ->set($this->formData(['formEmail' => $admin->email]))
            ->call('saveUser')
            ->assertHasErrors(['formEmail' => 'unique']);
    }

    public function test_admin_can_update_user_without_changing_password(): void
    {
        $admin = $this->makeAdmin();
        $user = $this->makeUser(['email' => 'ubah@hamana.co.id']);
        $originalPassword = $user->password;

        Livewire::actingAs($admin)
            ->test(Pengaturan::class)
            ->call('openEditForm', $user->id)
            ->assertSet('formNik', $user->nik)
            ->set('formName', 'Nama Setelah Ubah')
            ->set('formPosition', 'Staff Senior')
            ->set('formPassword', '')
            ->call('saveUser')
            ->assertHasNoErrors()
            ->assertSet('userStatus', 'Data pengguna diperbarui.');

        $user->refresh();

        $this->assertSame('Nama Setelah Ubah', $user->name);
        $this->assertSame('Staff Senior', $user->position);
        $this->assertSame($originalPassword, $user->password);
    }

    public function test_admin_can_delete_user(): void
    {
        $admin = $this->makeAdmin();
        $user = $this->makeUser(['email' => 'hapus@hamana.co.id']);

        Livewire::actingAs($admin)
            ->test(Pengaturan::class)
            ->call('deleteUser', $user->id)
            ->assertHasNoErrors()
            ->assertSet('userStatus', 'Pengguna dihapus.');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_cannot_demote_or_delete_self(): void
    {
        $admin = $this->makeAdmin();

        Livewire::actingAs($admin)
            ->test(Pengaturan::class)
            ->call('openEditForm', $admin->id)
            ->set('formRole', 'karyawan')
            ->call('saveUser')
            ->assertHasErrors(['formRole']);

        $this->assertSame('admin', $admin->refresh()->role);

        Livewire::actingAs($admin)
            ->test(Pengaturan::class)
            ->call('deleteUser', $admin->id)
            ->assertHasErrors(['user']);

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_karyawan_cannot_manage_users(): void
    {
        $karyawan = $this->makeUser(['email' => 'karyawan-crud@hamana.co.id']);

        $this->actingAs($karyawan)
            ->get('/pengaturan')
            ->assertOk()
            ->assertDontSee('Tambah Pengguna');

        Livewire::actingAs($karyawan)
            ->test(Pengaturan::class)
            ->call('openCreateForm')
            ->assertForbidden()
            ->assertSet('showUserForm', false);
    }
}
