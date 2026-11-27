<?php

namespace Tests\Feature;

use App\Livewire\Pengaturan;
use App\Models\Employee;
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

    public function test_creating_user_creates_linked_employee(): void
    {
        $admin = $this->makeAdmin();

        Livewire::actingAs($admin)
            ->test(Pengaturan::class)
            ->call('openCreateForm')
            ->set($this->formData())
            ->call('saveUser')
            ->assertHasNoErrors();

        $user = User::where('email', 'pengguna-baru@hamana.co.id')->firstOrFail();

        $this->assertDatabaseHas('employees', [
            'user_id' => $user->id,
            'nik' => '8000.00.00.01',
            'nama' => 'Pengguna Baru',
            'jabatan' => 'Staff Test',
            'posisi' => 'Staff Test',
            'status_pegawai' => Employee::STATUS_AKTIF,
        ]);
    }

    public function test_updating_user_syncs_linked_employee(): void
    {
        $admin = $this->makeAdmin();
        $user = $this->makeUser(['email' => 'sinkron@hamana.co.id']);

        $employee = Employee::query()->create([
            'user_id' => $user->id,
            'nik' => $user->nik,
            'nama' => $user->name,
            'jabatan' => $user->position,
            'posisi' => $user->position,
            'status_pegawai' => Employee::STATUS_AKTIF,
        ]);

        Livewire::actingAs($admin)
            ->test(Pengaturan::class)
            ->call('openEditForm', $user->id)
            ->set('formName', 'Nama Tersinkron')
            ->set('formPosition', 'Supervisor Test')
            ->call('saveUser')
            ->assertHasNoErrors();

        $employee->refresh();

        $this->assertSame('Nama Tersinkron', $employee->nama);
        $this->assertSame('Supervisor Test', $employee->jabatan);
        $this->assertSame('Supervisor Test', $employee->posisi);
    }

    public function test_creating_user_links_existing_employee_by_nik(): void
    {
        $admin = $this->makeAdmin();

        $employee = Employee::query()->create([
            'nik' => '8000.00.00.09',
            'nama' => 'Pegawai Lama',
            'jabatan' => 'Operator',
            'posisi' => 'Operator Produksi',
            'status_pegawai' => Employee::STATUS_AKTIF,
        ]);

        Livewire::actingAs($admin)
            ->test(Pengaturan::class)
            ->call('openCreateForm')
            ->set($this->formData([
                'formNik' => '8000.00.00.09',
                'formEmail' => 'pegawai-lama@hamana.co.id',
            ]))
            ->call('saveUser')
            ->assertHasNoErrors();

        $user = User::where('email', 'pegawai-lama@hamana.co.id')->firstOrFail();

        $employee->refresh();

        $this->assertSame($user->id, $employee->user_id);
        $this->assertSame('Pengguna Baru', $employee->nama);
        $this->assertSame(1, Employee::query()->where('nik', '8000.00.00.09')->count());
    }

    public function test_user_can_change_own_password(): void
    {
        $user = $this->makeUser(['email' => 'ganti-password@hamana.co.id', 'password' => 'password']);

        Livewire::actingAs($user)
            ->test(Pengaturan::class)
            ->set('newPassword', 'rahasia123')
            ->call('updatePassword')
            ->assertHasNoErrors()
            ->assertSet('passwordStatus', 'Password berhasil diubah.');

        $this->assertTrue(Hash::check('rahasia123', $user->refresh()->password));
    }

    public function test_password_change_validates_new_password_minimum_length(): void
    {
        $user = $this->makeUser(['email' => 'password-pendek@hamana.co.id', 'password' => 'password']);

        Livewire::actingAs($user)
            ->test(Pengaturan::class)
            ->set('newPassword', '123')
            ->call('updatePassword')
            ->assertHasErrors(['newPassword' => 'min']);

        $this->assertTrue(Hash::check('password', $user->refresh()->password));
    }

    public function test_admin_can_change_selected_employee_password_via_nik_query(): void
    {
        $admin = $this->makeUser([
            'nik' => '9000.00.00.01',
            'email' => 'admin-ubah-pw@hamana.co.id',
            'password' => 'admin123',
            'role' => User::ROLE_ADMIN,
        ]);
        $target = $this->makeUser([
            'nik' => '9623.11.01.99',
            'name' => 'Pegawai Target',
            'email' => 'target-ubah-pw@hamana.co.id',
            'password' => 'lama1234',
        ]);
        Employee::query()->create([
            'user_id' => $target->id,
            'nik' => '9623.11.01.99',
            'nama' => 'Pegawai Target',
            'status_pegawai' => Employee::STATUS_AKTIF,
        ]);

        Livewire::withQueryParams(['nik' => '9623.11.01.99'])
            ->actingAs($admin)
            ->test(Pengaturan::class, ['panel' => 'ubah-password'])
            ->assertSee('Pegawai Target')
            ->set('newPassword', 'baru12345')
            ->call('updatePassword')
            ->assertHasNoErrors()
            ->assertSet('passwordStatus', 'Password berhasil diubah.');

        $this->assertTrue(Hash::check('baru12345', $target->refresh()->password));
        $this->assertTrue(Hash::check('admin123', $admin->refresh()->password));
    }

    public function test_regular_user_cannot_open_ubah_password_for_another_nik(): void
    {
        $user = $this->makeUser(['nik' => '1111.11.11.11', 'email' => 'biasa@hamana.co.id']);
        $other = $this->makeUser(['nik' => '2222.22.22.22', 'email' => 'lain@hamana.co.id']);

        $this->actingAs($user)
            ->get('/pengaturan/ubah-password?nik='.$other->nik)
            ->assertForbidden();
    }
}
