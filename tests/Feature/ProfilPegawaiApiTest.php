<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\User;
use App\Services\Pegawai\DeletePegawaiService;
use App\Services\Pegawai\GetDaftarPegawaiService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfilPegawaiApiTest extends TestCase
{
    use DatabaseTransactions;

    private function makeUser(array $attributes = []): User
    {
        return User::factory()->create($attributes);
    }

    public function test_karyawan_can_manage_own_profile(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $user = $this->makeUser([
            'nik' => 'TEST.00.00.01',
            'name' => 'Karyawan Profil',
            'position' => 'Staff Test',
        ]);

        $this->actingAs($user)
            ->getJson('/api/profil/data-pribadi')
            ->assertOk()
            ->assertJsonPath('nik', 'TEST.00.00.01')
            ->assertJsonPath('nama', 'Karyawan Profil');

        $this->actingAs($user)
            ->putJson('/api/profil/data-pribadi', [
                'nik' => 'TEST.00.00.01',
                'nama' => 'Karyawan Profil Baru',
                'gender' => 'Laki-Laki',
                'tempat_lahir' => 'Tegal',
                'tgl_lahir' => '1995-01-10',
                'agama' => 'Islam',
                'status_nikah' => 'Menikah',
                'jml_anak' => 1,
                'jabatan' => 'Officer',
                'status_pegawai' => 'Aktif',
                'departemen' => 'HRD',
                'posisi' => 'Officer HRD',
                'tgl_gabung' => '2020-01-01',
                'email' => 'profil@example.test',
                'hp1' => '08123456789',
                'alamat_ktp' => 'Jl. Contoh',
                'ktp' => '1234567890123456',
                'faskes_terpilih' => false,
                'code_pajak' => 'a1',
            ])
            ->assertOk()
            ->assertJsonPath('nama', 'Karyawan Profil Baru')
            ->assertJsonPath('code_pajak', 'A1');

        $this->assertDatabaseHas('employees', [
            'user_id' => $user->id,
            'nik' => 'TEST.00.00.01',
            'nama' => 'Karyawan Profil Baru',
        ]);
        $this->assertDatabaseHas('employee_profiles', [
            'departemen' => 'HRD',
            'code_grup_pajak' => 'A1',
        ]);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Karyawan Profil Baru',
            'email' => 'profil@example.test',
            'position' => 'Officer HRD',
        ]);

        $this->actingAs($user)
            ->putJson('/api/profil/pendidikan', [
                'items' => [[
                    'jenjang' => 'SARJANA',
                    'nama_sekolah' => 'Universitas Contoh',
                    'jurusan' => 'Teknik Informatika',
                    'tahun' => '2018',
                    'aktif' => true,
                ]],
            ])
            ->assertOk()
            ->assertJsonCount(1, 'items');

        $this->actingAs($user)
            ->putJson('/api/profil/keluarga', [
                'items' => [[
                    'hubungan' => 'AYAH',
                    'urutan' => 1,
                    'nama' => 'Bapak Contoh',
                    'usia' => 60,
                    'pekerjaan' => 'Wiraswasta',
                    'aktif' => true,
                ]],
            ])
            ->assertOk()
            ->assertJsonCount(1, 'items');

        $this->actingAs($user)
            ->putJson('/api/profil/ciri-fisik', [
                'warna_kulit' => 'Sawo Matang',
                'golongan_darah' => 'o',
                'tinggi_badan' => 170.5,
            ])
            ->assertOk()
            ->assertJsonPath('golongan_darah', 'O');

        $employee = Employee::query()->where('user_id', $user->id)->firstOrFail();

        $this->actingAs($user)
            ->post('/api/profil/data-pribadi/photo', [
                'photo' => UploadedFile::fake()->image('profil.jpg'),
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonStructure(['photo_url']);

        $this->actingAs($user)
            ->get('/api/profil/foto/'.$employee->id)
            ->assertOk();
    }

    public function test_karyawan_can_upload_and_delete_document(): void
    {
        Storage::fake('local');

        $user = $this->makeUser(['nik' => 'TEST.00.00.02']);

        $this->actingAs($user)
            ->post('/api/profil/dokumen', [
                'kategori' => 'KTP',
                'nomor' => '1234567890123456',
                'file' => UploadedFile::fake()->create('ktp.pdf', 100, 'application/pdf'),
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('dokumen.cat', 'KTP');

        $this->assertDatabaseHas('employee_document_numbers', [
            'kategori' => 'KTP',
            'nomor' => '1234567890123456',
        ]);

        $document = EmployeeDocument::query()->firstOrFail();

        $this->actingAs($user)
            ->getJson('/api/profil/dokumen')
            ->assertOk()
            ->assertJsonPath('nomor.KTP', '1234567890123456')
            ->assertJsonCount(1, 'dokumen');

        $this->actingAs($user)
            ->get('/api/profil/dokumen/'.$document->id.'/lihat')
            ->assertOk();

        $this->actingAs($user)
            ->deleteJson('/api/profil/dokumen/'.$document->id)
            ->assertNoContent();

        $this->assertDatabaseMissing('employee_documents', ['id' => $document->id]);
    }

    public function test_admin_can_manage_employees(): void
    {
        $admin = $this->makeUser(['role' => 'admin', 'nik' => 'TEST.00.00.03']);

        $this->actingAs($admin)
            ->getJson('/api/data-pegawai')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'counts']);

        $this->actingAs($admin)
            ->postJson('/api/data-pegawai', [
                'nik' => 'TEST.00.00.40',
                'nama' => 'Pegawai Tanpa Data Akun',
            ])
            ->assertCreated()
            ->assertJsonPath('pegawai.email', null);

        $employeeWithoutEmail = Employee::query()
            ->where('nik', 'TEST.00.00.40')
            ->firstOrFail();
        $userWithoutEmail = User::query()->findOrFail($employeeWithoutEmail->user_id);
        $this->assertNull($userWithoutEmail->email);
        $this->assertSame('karyawan', $userWithoutEmail->role);

        $response = $this->actingAs($admin)
            ->postJson('/api/data-pegawai', [
                'nik' => 'TEST.00.00.04',
                'nama' => 'Pegawai Baru',
                'email' => 'pegawai.baru@example.test',
                'tanggal_lahir' => '1990-05-17',
                'jabatan' => 'Officer',
                'posisi' => 'Officer Produksi',
                'status' => 'Aktif',
            ])
            ->assertCreated()
            ->assertJsonPath('pegawai.nama', 'Pegawai Baru');

        $employee = Employee::query()->findOrFail($response->json('pegawai.id'));
        $employeeUser = User::query()->findOrFail($employee->user_id);
        $this->assertSame('karyawan', $employeeUser->role);
        $this->assertNull($employeeUser->permissions);
        $this->assertTrue(Hash::check('pegawai1705', $employeeUser->password));

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/'.$employee->id, [
                'nik' => 'TEST.00.00.04',
                'nama' => 'Pegawai Diubah',
                'email' => 'pegawai.diubah@example.test',
                'tanggal_lahir' => '1991-04-20',
                'password' => 'password-baru',
                'jabatan' => 'Supervisor',
                'posisi' => 'Supervisor Produksi',
                'status' => 'Tidak Aktif',
            ])
            ->assertOk()
            ->assertJsonPath('pegawai.nama', 'Pegawai Diubah')
            ->assertJsonPath('pegawai.aktif', false);

        $employeeUser->refresh();
        $this->assertSame('pegawai.diubah@example.test', $employeeUser->email);
        $this->assertSame('TEST.00.00.04', $employeeUser->nik);
        $this->assertSame('Supervisor Produksi', $employeeUser->position);
        $this->assertFalse($employeeUser->is_active);
        $this->assertTrue(Hash::check('password-baru', $employeeUser->password));

        $storedPassword = $employeeUser->password;
        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/'.$employee->id, [
                'nik' => 'TEST.00.00.04',
                'nama' => 'Pegawai Diubah Lagi',
            ])
            ->assertOk();
        $employeeUser->refresh();
        $this->assertSame($storedPassword, $employeeUser->password);

        $this->actingAs($admin)
            ->get('/api/data-pegawai/export')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $this->actingAs($admin)
            ->post('/api/data-pegawai/import', [
                'file' => UploadedFile::fake()->createWithContent(
                    'pegawai.csv',
                    "NIK,Nama,Email,Tanggal Lahir,Jabatan,Posisi,Status\nTEST.00.00.05,Pegawai Import,pegawai.import@example.test,1992-08-03,Officer,Staff,Aktif\n",
                ),
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('hasil.ditambah', 1)
            ->assertJsonPath('hasil.akun_dibuat', 1);

        $importedEmployee = Employee::query()->where('nik', 'TEST.00.00.05')->firstOrFail();
        $this->assertDatabaseHas('employees', [
            'nik' => 'TEST.00.00.05',
            'nama' => 'Pegawai Import',
        ]);
        $importedUser = User::query()->findOrFail($importedEmployee->user_id);
        $this->assertSame('karyawan', $importedUser->role);
        $this->assertTrue(Hash::check('pegawai0308', $importedUser->password));

        $this->actingAs($admin)
            ->deleteJson('/api/data-pegawai/'.$employee->id)
            ->assertNoContent();

        $this->assertDatabaseMissing('employees', ['id' => $employee->id]);
        $this->assertDatabaseMissing('users', ['id' => $employeeUser->id]);
    }

    public function test_karyawan_cannot_manage_employees(): void
    {
        $user = $this->makeUser(['nik' => 'TEST.00.00.06']);

        $this->actingAs($user)
            ->getJson('/api/data-pegawai')
            ->assertForbidden();
    }

    public function test_deleting_employee_does_not_delete_a_linked_admin_account(): void
    {
        $admin = $this->makeUser([
            'role' => 'admin',
            'nik' => 'TEST.00.00.60',
        ]);
        $employee = Employee::query()->create([
            'user_id' => $admin->id,
            'nik' => 'TEST.00.00.60',
            'nama' => $admin->name,
            'status_pegawai' => Employee::STATUS_AKTIF,
        ]);

        app(DeletePegawaiService::class)->handle($employee);

        $this->assertDatabaseMissing('employees', ['id' => $employee->id]);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_data_pegawai_counts_and_lists_exclude_employees_linked_to_admins(): void
    {
        $baseline = app(GetDaftarPegawaiService::class)->handle(['per_page' => 1])['counts'];

        $admin = $this->makeUser(['role' => 'admin', 'nik' => 'TEST.00.00.70']);
        Employee::query()->create([
            'user_id' => $admin->id,
            'nik' => 'TEST.00.00.70',
            'nama' => 'Admin Tersembunyi',
            'status_pegawai' => Employee::STATUS_AKTIF,
        ]);

        $worker = $this->makeUser(['role' => 'karyawan', 'nik' => 'TEST.00.00.71']);
        Employee::query()->create([
            'user_id' => $worker->id,
            'nik' => 'TEST.00.00.71',
            'nama' => 'Pegawai Terlihat',
            'status_pegawai' => Employee::STATUS_AKTIF,
        ]);
        Employee::query()->create([
            'nik' => 'TEST.00.00.72',
            'nama' => 'Pegawai Tanpa User',
            'status_pegawai' => Employee::STATUS_TIDAK_AKTIF,
        ]);

        $result = app(GetDaftarPegawaiService::class)->handle([
            'per_page' => 100,
            'search' => 'TEST.00.00.7',
        ]);

        $this->assertSame([
            'aktif' => $baseline['aktif'] + 1,
            'tidak_aktif' => $baseline['tidak_aktif'] + 1,
            'semua' => $baseline['semua'] + 2,
        ], $result['counts']);
        $this->assertEqualsCanonicalizing(
            ['TEST.00.00.71', 'TEST.00.00.72'],
            array_column($result['data'], 'nik'),
        );

        $inactive = app(GetDaftarPegawaiService::class)->handle([
            'per_page' => 100,
            'status' => '0',
            'search' => 'TEST.00.00.7',
        ]);
        $this->assertSame(['TEST.00.00.72'], array_column($inactive['data'], 'nik'));
    }

    public function test_profile_and_employee_pages_render(): void
    {
        $admin = $this->makeUser(['role' => 'admin', 'nik' => 'TEST.00.00.07']);

        foreach ([
            'profil-data-pribadi',
            'profil-riwayat-pendidikan',
            'profil-anggota-keluarga',
            'profil-ciri-fisik',
            'profil-kelola-file',
            'data-pegawai',
        ] as $module) {
            $this->actingAs($admin)
                ->get('/modul/'.$module)
                ->assertOk();
        }
    }
}
