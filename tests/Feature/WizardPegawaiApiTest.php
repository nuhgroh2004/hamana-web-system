<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WizardPegawaiApiTest extends TestCase
{
    use DatabaseTransactions;

    private function makeAdmin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    /**
     * @return array<string, mixed>
     */
    private function dataPribadi(string $nik = 'WIZ.00.00.01'): array
    {
        return [
            'nik' => $nik,
            'nama' => 'Karyawan Wizard',
            'gender' => 'Laki-Laki',
            'tempat_lahir' => 'Tegal',
            'tgl_lahir' => '1994-02-11',
            'agama' => 'Islam',
            'status_nikah' => 'Menikah',
            'jml_anak' => 2,
            'jabatan' => 'Officer',
            'status_pegawai' => 'Aktif',
            'departemen' => 'HRD',
            'posisi' => 'Officer HRD',
            'tgl_gabung' => '2021-03-01',
            'email' => 'wizard@example.test',
            'hp1' => '081200000001',
            'hp2' => '',
            'alamat_ktp' => 'Jl. Contoh No. 1',
            'alamat_dom' => '',
            'rumah' => 'Milik Sendiri',
            'ktp' => '1234567890123456',
            'passport' => '',
            'npwp' => '',
            'bpjs_tk' => '',
            'bpjs_kes' => '',
            'rek_mandiri' => '',
            'faskes_terpilih' => false,
            'faskes_provinsi' => '',
            'faskes_kantor_regional' => '',
            'faskes_kantor_cabang' => '',
            'faskes_kabupaten_kota' => '',
            'faskes_kode_ppk' => '',
            'faskes_nama_ppk' => '',
            'faskes_alamat_ppk' => '',
            'faskes_telp_ppk' => '',
            'code_pajak' => 'a1',
            'code_nikah' => 'k1',
            'code_status' => 'tk0',
            'dr_nama1' => '',
            'dr_telp1' => '',
            'dr_hub1' => '',
            'dr_nama2' => '',
            'dr_telp2' => '',
            'dr_hub2' => '',
            'facebook' => '',
            'instagram' => '',
            'twitter' => '',
        ];
    }

    public function test_admin_can_create_employee_through_wizard(): void
    {
        $admin = $this->makeAdmin();

        $response = $this->actingAs($admin)
            ->postJson('/api/data-pegawai/wizard', $this->dataPribadi())
            ->assertCreated()
            ->assertJsonPath('employee.nik', 'WIZ.00.00.01')
            ->assertJsonPath('progress.data_pribadi', true)
            ->assertJsonPath('progress.pendidikan', false);

        $employeeId = $response->json('employee.id');

        $this->assertDatabaseHas('employees', [
            'id' => $employeeId,
            'nik' => 'WIZ.00.00.01',
            'nama' => 'Karyawan Wizard',
        ]);
        $this->assertDatabaseHas('employee_profiles', [
            'employee_id' => $employeeId,
            'departemen' => 'HRD',
            'code_grup_pajak' => 'A1',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/data-pegawai/wizard/'.$employeeId)
            ->assertOk()
            ->assertJsonPath('data_pribadi.nik', 'WIZ.00.00.01')
            ->assertJsonPath('data_pribadi.email', 'wizard@example.test')
            ->assertJsonPath('progress.data_pribadi', true)
            ->assertJsonStructure([
                'data_pribadi',
                'pendidikan',
                'keluarga',
                'ciri_fisik',
                'dokumen' => ['nomor', 'dokumen'],
                'progress',
            ]);
    }

    public function test_admin_can_fill_every_wizard_step(): void
    {
        Storage::fake('local');

        $admin = $this->makeAdmin();

        $employeeId = $this->actingAs($admin)
            ->postJson('/api/data-pegawai/wizard', $this->dataPribadi())
            ->assertCreated()
            ->json('employee.id');

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/wizard/'.$employeeId.'/pendidikan', [
                'items' => [[
                    'jenjang' => 'SARJANA',
                    'nama_sekolah' => 'Universitas Contoh',
                    'jurusan' => 'Teknik Informatika',
                    'tahun' => '2016',
                    'aktif' => true,
                ]],
            ])
            ->assertOk()
            ->assertJsonPath('items.0.nama_sekolah', 'Universitas Contoh')
            ->assertJsonPath('progress.pendidikan', true);

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/wizard/'.$employeeId.'/keluarga', [
                'items' => [[
                    'hubungan' => 'ISTRI',
                    'urutan' => 1,
                    'nama' => 'Pasangan Contoh',
                    'usia' => 30,
                    'pekerjaan' => 'Ibu Rumah Tangga',
                    'aktif' => true,
                ]],
            ])
            ->assertOk()
            ->assertJsonPath('items.0.nama', 'Pasangan Contoh')
            ->assertJsonPath('progress.keluarga', true);

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/wizard/'.$employeeId.'/ciri-fisik', [
                'warna_kulit' => 'Sawo Matang',
                'golongan_darah' => 'O',
                'warna_rambut' => 'Hitam',
                'ukuran_baju' => 'L',
                'warna_mata' => 'Cokelat',
                'ukuran_celana' => '32',
                'tinggi_badan' => 170,
                'ukuran_sepatu' => '42',
                'berat_badan' => 65,
            ])
            ->assertOk()
            ->assertJsonPath('data.golongan_darah', 'O')
            ->assertJsonPath('progress.ciri_fisik', true);

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/wizard/'.$employeeId.'/nomor-dokumen', [
                'nomor' => [
                    'KK' => '1234567890123456',
                    'KTP' => '1234567890123456',
                    'NPWP' => '123456789012345',
                ],
            ])
            ->assertOk()
            ->assertJsonPath('nomor.KTP', '1234567890123456')
            ->assertJsonPath('progress.file', true);

        $this->actingAs($admin)
            ->post('/api/data-pegawai/wizard/'.$employeeId.'/dokumen', [
                'kategori' => 'KK',
                'file' => UploadedFile::fake()->create('kk.pdf', 120, 'application/pdf'),
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('dokumen.cat', 'KK');

        $this->assertDatabaseHas('employee_documents', [
            'employee_id' => $employeeId,
            'kategori' => 'KK',
        ]);
    }

    public function test_wizard_rejects_duplicate_nik_and_invalid_document_number(): void
    {
        $admin = $this->makeAdmin();

        Employee::query()->create([
            'nik' => 'WIZ.00.00.99',
            'nama' => 'Pegawai Lama',
            'status_pegawai' => 'Aktif',
        ]);

        $this->actingAs($admin)
            ->postJson('/api/data-pegawai/wizard', $this->dataPribadi('WIZ.00.00.99'))
            ->assertStatus(422)
            ->assertJsonValidationErrors('nik');

        $employeeId = $this->actingAs($admin)
            ->postJson('/api/data-pegawai/wizard', $this->dataPribadi())
            ->assertCreated()
            ->json('employee.id');

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/wizard/'.$employeeId.'/nomor-dokumen', [
                'nomor' => ['KK' => '123'],
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('nomor.KK');
    }

    public function test_wizard_allows_empty_steps_during_development(): void
    {
        $admin = $this->makeAdmin();

        $response = $this->actingAs($admin)
            ->postJson('/api/data-pegawai/wizard', [])
            ->assertCreated();

        $employeeId = $response->json('employee.id');

        $employee = Employee::query()->findOrFail($employeeId);

        $this->assertStringStartsWith('DEV-', $employee->nik);
        $this->assertSame('Karyawan Baru', $employee->nama);

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/wizard/'.$employeeId.'/pendidikan', ['items' => []])
            ->assertOk();

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/wizard/'.$employeeId.'/pendidikan', ['items' => [['nama_sekolah' => 'Tanpa Jenjang']]])
            ->assertOk()
            ->assertJsonPath('items.0.jenjang', 'SMA/SMK');

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/wizard/'.$employeeId.'/keluarga', ['items' => []])
            ->assertOk();

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/wizard/'.$employeeId.'/keluarga', ['items' => [['nama' => 'Tanpa Hubungan']]])
            ->assertOk()
            ->assertJsonPath('items.0.hubungan', 'AYAH');

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/wizard/'.$employeeId.'/ciri-fisik', [])
            ->assertOk();

        $this->actingAs($admin)
            ->putJson('/api/data-pegawai/wizard/'.$employeeId.'/nomor-dokumen', [])
            ->assertOk();
    }

    public function test_admin_can_open_wizard_page(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)
            ->get('/modul/data-pegawai/tambah')
            ->assertOk()
            ->assertSee('Tambah Karyawan')
            ->assertSee('wz-bars', false)
            ->assertSee('Data Pribadi')
            ->assertSee('Ciri Fisik');
    }

    public function test_user_without_data_pegawai_access_cannot_open_wizard(): void
    {
        $user = User::factory()->create(['role' => 'karyawan']);

        $this->actingAs($user)
            ->get('/modul/data-pegawai/tambah')
            ->assertForbidden();

        $this->actingAs($user)
            ->postJson('/api/data-pegawai/wizard', $this->dataPribadi())
            ->assertForbidden();
    }
}
