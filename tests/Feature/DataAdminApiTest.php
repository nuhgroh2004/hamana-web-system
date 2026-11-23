<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class DataAdminApiTest extends TestCase
{
    use DatabaseTransactions;

    private function makeAdmin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function makeKaryawan(): User
    {
        return User::factory()->create(['role' => 'karyawan']);
    }

    public function test_admin_can_manage_tingkat(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)
            ->getJson('/api/data-admin/tingkat')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);

        $created = $this->actingAs($admin)
            ->postJson('/api/data-admin/tingkat', ['nama' => 'Tingkat Test'])
            ->assertCreated()
            ->assertJsonPath('data.nama', 'Tingkat Test')
            ->json('data');

        $this->actingAs($admin)
            ->postJson('/api/data-admin/tingkat', ['nama' => 'Tingkat Test'])
            ->assertStatus(422);

        $this->actingAs($admin)
            ->putJson('/api/data-admin/tingkat/'.$created['id'], ['nama' => 'Tingkat Ubah'])
            ->assertOk()
            ->assertJsonPath('data.nama', 'Tingkat Ubah');

        $this->actingAs($admin)
            ->deleteJson('/api/data-admin/tingkat/'.$created['id'])
            ->assertNoContent();

        $this->assertDatabaseMissing('employee_levels', ['id' => $created['id']]);
    }

    public function test_admin_can_manage_jabatan(): void
    {
        $admin = $this->makeAdmin();

        $created = $this->actingAs($admin)
            ->postJson('/api/data-admin/jabatan', ['nama' => 'Jabatan Test'])
            ->assertCreated()
            ->assertJsonPath('data.nama', 'Jabatan Test')
            ->json('data');

        $this->actingAs($admin)
            ->putJson('/api/data-admin/jabatan/'.$created['id'], ['nama' => 'Jabatan Ubah'])
            ->assertOk()
            ->assertJsonPath('data.nama', 'Jabatan Ubah');

        $this->actingAs($admin)
            ->deleteJson('/api/data-admin/jabatan/'.$created['id'])
            ->assertNoContent();

        $this->assertDatabaseMissing('employee_jabatans', ['id' => $created['id']]);
    }

    public function test_admin_can_manage_faskes(): void
    {
        $admin = $this->makeAdmin();

        $payload = [
            'nama_provinsi' => 'jawa tengah',
            'kantor_regional' => 'regional vi',
            'kantor_cabang' => 'semarang',
            'kabupaten_kota' => 'kota semarang',
            'kode_ppk' => '1234u001',
            'nama_ppk' => 'klinik contoh',
            'alamat_ppk' => 'Jl. Contoh 1',
            'telp_ppk' => '08123456789',
        ];

        $created = $this->actingAs($admin)
            ->postJson('/api/data-admin/faskes', $payload)
            ->assertCreated()
            ->assertJsonPath('data.nama_ppk', 'KLINIK CONTOH')
            ->assertJsonPath('data.kode_ppk', '1234U001')
            ->json('data');

        $this->actingAs($admin)
            ->getJson('/api/data-admin/faskes')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'counts', 'options'])
            ->assertJsonPath('counts.total', 1);

        $this->actingAs($admin)
            ->putJson('/api/data-admin/faskes/'.$created['id'], array_merge($payload, [
                'nama_ppk' => 'klinik baru',
            ]))
            ->assertOk()
            ->assertJsonPath('data.nama_ppk', 'KLINIK BARU');

        $this->actingAs($admin)
            ->get('/api/data-admin/faskes/export')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $this->actingAs($admin)
            ->post('/api/data-admin/faskes/import', [
                'file' => UploadedFile::fake()->createWithContent(
                    'faskes.csv',
                    "Nama Provinsi,Kabupaten/Kota,Kode PPK,Nama PPK\nJAWA BARAT,KOTA BANDUNG,9999U001,KLINIK IMPORT\n",
                ),
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('hasil.ditambah', 1);

        $this->assertDatabaseHas('faskes_bpjs', ['kode_ppk' => '9999U001']);

        $this->actingAs($admin)
            ->deleteJson('/api/data-admin/faskes/'.$created['id'])
            ->assertNoContent();

        $this->assertDatabaseMissing('faskes_bpjs', ['id' => $created['id']]);
    }

    public function test_admin_can_manage_admin_accounts(): void
    {
        $admin = $this->makeAdmin();

        $created = $this->actingAs($admin)
            ->postJson('/api/data-admin/admin', [
                'email' => 'admin.baru@example.test',
                'nik' => '8888.00.00.01',
                'nama' => 'Admin Baru',
                'password' => 'rahasia123',
                'aktif' => true,
                'karyawan_aktif' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.nama', 'Admin Baru')
            ->assertJsonPath('data.karyawan_aktif', true)
            ->json('data');

        $this->assertDatabaseHas('users', [
            'email' => 'admin.baru@example.test',
            'role' => 'admin',
        ]);

        $this->assertDatabaseHas('employees', [
            'user_id' => $created['id'],
            'nama' => 'Admin Baru',
        ]);

        $this->actingAs($admin)
            ->putJson('/api/data-admin/admin/'.$created['id'], [
                'email' => 'admin.baru@example.test',
                'nik' => '8888.00.00.01',
                'nama' => 'Admin Diubah',
                'password' => '',
                'aktif' => false,
                'karyawan_aktif' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.nama', 'Admin Diubah')
            ->assertJsonPath('data.aktif', false)
            ->assertJsonPath('data.karyawan_aktif', false);

        $this->actingAs($admin)
            ->deleteJson('/api/data-admin/admin/'.$admin->id)
            ->assertStatus(422);

        $this->actingAs($admin)
            ->deleteJson('/api/data-admin/admin/'.$created['id'])
            ->assertNoContent();
    }

    public function test_admin_can_manage_satpam_accounts(): void
    {
        $admin = $this->makeAdmin();

        $created = $this->actingAs($admin)
            ->postJson('/api/list-satpam', [
                'email' => 'satpam.baru@example.test',
                'nama' => 'Satpam Baru',
                'password' => 'rahasia123',
                'aktif' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.nama', 'Satpam Baru')
            ->json('data');

        $this->assertDatabaseHas('users', [
            'email' => 'satpam.baru@example.test',
            'role' => 'satpam',
        ]);

        $this->actingAs($admin)
            ->putJson('/api/list-satpam/'.$created['id'], [
                'email' => 'satpam.baru@example.test',
                'nama' => 'Satpam Diubah',
                'password' => '',
                'aktif' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.nama', 'Satpam Diubah')
            ->assertJsonPath('data.aktif', false);

        $this->actingAs($admin)
            ->deleteJson('/api/list-satpam/'.$created['id'])
            ->assertNoContent();

        $this->assertDatabaseMissing('users', ['id' => $created['id']]);
    }

    public function test_karyawan_cannot_manage_data_admin(): void
    {
        $user = $this->makeKaryawan();

        foreach ([
            '/api/data-admin/tingkat',
            '/api/data-admin/jabatan',
            '/api/data-admin/faskes',
            '/api/data-admin/admin',
            '/api/list-satpam',
        ] as $url) {
            $this->actingAs($user)
                ->getJson($url)
                ->assertForbidden();
        }
    }

    public function test_dashboard_shows_logged_in_employee(): void
    {
        $user = User::factory()->create([
            'name' => 'Nama Dashboard',
            'position' => 'Posisi Dashboard',
            'role' => 'karyawan',
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertSee('Nama Dashboard')
            ->assertSee('Posisi Dashboard');

        $employee = Employee::query()->where('user_id', $user->id)->firstOrFail();

        $this->assertSame('Nama Dashboard', $employee->nama);
    }

    public function test_data_admin_pages_render(): void
    {
        $admin = $this->makeAdmin();

        foreach ([
            'data-admin-list-admin',
            'data-admin-tingkat',
            'data-admin-jabatan',
            'data-admin-faskes-bpjs',
            'list-satpam',
        ] as $module) {
            $this->actingAs($admin)
                ->get('/modul/'.$module)
                ->assertOk();
        }
    }
}
