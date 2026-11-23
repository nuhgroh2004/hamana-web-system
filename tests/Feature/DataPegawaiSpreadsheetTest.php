<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use App\Services\Pegawai\ExportPegawaiService;
use App\Support\PegawaiSheet;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Reader\XLSX\Reader;
use OpenSpout\Writer\XLSX\Writer;
use Tests\TestCase;

class DataPegawaiSpreadsheetTest extends TestCase
{
    use DatabaseTransactions;

    public function test_new_import_rows_without_email_or_birth_date_still_get_user_accounts(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'nik' => 'TEST.XLSX.INVALID']);

        $this->actingAs($admin)
            ->post('/api/data-pegawai/import', [
                'file' => UploadedFile::fake()->createWithContent(
                    'pegawai.csv',
                    "NIK,Nama,Email,Tanggal Lahir\nTEST.XLSX.INVALID.01,Pegawai Baru,,\n",
                ),
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('hasil.ditambah', 1)
            ->assertJsonPath('hasil.akun_dibuat', 1);

        $employee = Employee::query()
            ->where('nik', 'TEST.XLSX.INVALID.01')
            ->firstOrFail();
        $user = User::query()->findOrFail($employee->user_id);
        $this->assertSame('karyawan', $user->role);
        $this->assertNull($user->email);
        $this->assertNull($employee->profile?->tanggal_lahir);
    }

    public function test_admin_can_import_full_xlsx_and_export_it_again(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'nik' => 'TEST.XLSX.ADMIN']);

        $headers = PegawaiSheet::headers();

        $values = [
            'No' => 1,
            'Ref ID' => 'REF-XLSX-01',
            'NIK' => 'TEST.XLSX.01',
            'No. KTP' => '1234567890123456',
            'Nama Lengkap' => 'Pegawai Excel',
            'Jenis Kelamin' => 'L',
            'Tempat Lahir' => 'Tegal',
            'Tanggal Lahir' => '1990-05-17',
            'Agama' => 'Islam',
            'Status Nikah' => 'Menikah',
            'Jumlah Anak' => 2,
            'Email' => 'excel@example.test',
            'No. HP 1' => '081234567890',
            'No. HP 2' => '089876543210',
            'Rumah yang Ditinggali' => 'Milik Sendiri',
            'Alamat KTP' => 'Jl. KTP No. 1',
            'Alamat Domisili' => 'Jl. Domisili No. 2',
            'Propinsi' => 'JAWA TENGAH',
            'No. Passport' => 'A1234567',
            'NPWP' => '09.876.543.2-001.000',
            'BPJS Ketenagakerjaan' => '12345678901',
            'BPJS Kesehatan' => '0001234567890',
            'Rekening Mandiri' => '1300012345678',
            'Faskes Tingkat I' => 'KLINIK SEHAT',
            'Tingkat' => 'III/A',
            'Golongan' => 'Staff',
            'Jabatan' => 'Officer',
            'Departemen' => 'HRD',
            'Posisi' => 'Officer HRD',
            'Tanggal Bergabung' => '2021-02-01',
            'Status Pegawai' => null,
            'Nama Darurat 1' => 'Bapak Darurat',
            'No. Telp Darurat 1' => '081111111111',
            'Hubungan Darurat 1' => 'Ayah',
            'Nama Darurat 2' => 'Ibu Darurat',
            'No. Telp Darurat 2' => '082222222222',
            'Hubungan Darurat 2' => 'Ibu',
            'Instagram' => '@pegawai',
            'Facebook' => 'pegawai.excel',
            'Twitter' => '@pegawaix',
            'Code Grup Pajak' => 'a1',
            'Code Grup Status Pernikahan' => 'k2',
            'Code Status Pajak' => 'tk0',
            'Pendidikan SD - Nama Sekolah' => 'SDN 1 Tegal',
            'Pendidikan SD - Jurusan' => 'Umum',
            'Pendidikan SD - Tahun' => '2002 - 2008',
            'Pendidikan SMA/SMK - Nama Sekolah' => 'SMK Negeri 1',
            'Pendidikan SMA/SMK - Jurusan' => 'TKJ',
            'Pendidikan SMA/SMK - Tahun' => '2011',
            'Keluarga Ayah - Nama' => 'Bapak Kandung',
            'Keluarga Ayah - Usia' => 60,
            'Keluarga Ayah - Pekerjaan' => 'Petani',
            'Keluarga Ibu - Nama' => 'Ibu Kandung',
            'Keluarga Ibu - Usia' => 58,
            'Keluarga Ibu - Pekerjaan' => 'Ibu Rumah Tangga',
            'Keluarga Saudara 1 - Nama' => 'Kakak Kandung',
            'Keluarga Saudara 1 - Usia' => 35,
            'Keluarga Saudara 1 - Pekerjaan' => 'Karyawan',
            'Keluarga Suami - Nama' => 'Suami Tercinta',
            'Keluarga Suami - Usia' => 34,
            'Keluarga Suami - Pekerjaan' => 'Wiraswasta',
            'Keluarga Anak 1 - Nama' => 'Anak Pertama',
            'Keluarga Anak 1 - Usia' => 5,
            'Keluarga Anak 1 - Pekerjaan' => 'Belum Bekerja',
            'Warna Kulit' => 'Sawo Matang',
            'Golongan Darah' => 'o',
            'Warna Rambut' => 'Hitam',
            'Ukuran Baju' => 'L',
            'Warna Mata' => 'Coklat',
            'Ukuran Celana' => '32',
            'Tinggi Badan' => 172,
            'Berat Badan' => 68.5,
            'Ukuran Sepatu' => '42',
        ];

        $row = array_map(fn (string $header) => $values[$header] ?? null, $headers);

        $this->actingAs($admin)
            ->post('/api/data-pegawai/import', [
                'file' => $this->xlsx([$headers, $row]),
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('hasil.ditambah', 1)
            ->assertJsonPath('hasil.akun_dibuat', 1);

        $employee = Employee::query()->where('nik', 'TEST.XLSX.01')->firstOrFail();
        $user = User::query()->findOrFail($employee->user_id);
        $this->assertSame('karyawan', $user->role);
        $this->assertNull($user->permissions);
        $this->assertTrue(Hash::check('pegawai1705', $user->password));

        $this->assertSame('REF-XLSX-01', $employee->ref_id);
        $this->assertSame('III/A', $employee->tingkat);
        $this->assertSame('Staff', $employee->golongan);
        $this->assertSame('Officer', $employee->jabatan);
        $this->assertSame('Officer HRD', $employee->posisi);
        $this->assertSame('Aktif', $employee->status_pegawai);
        $this->assertTrue($user->is_active);

        $profile = $employee->profile()->firstOrFail();

        $this->assertSame('Laki-Laki', $profile->jenis_kelamin);
        $this->assertSame('1990-05-17', $profile->tanggal_lahir->format('Y-m-d'));
        $this->assertSame('2021-02-01', $profile->tanggal_gabung->format('Y-m-d'));
        $this->assertSame('JAWA TENGAH', $profile->propinsi);
        $this->assertSame('1234567890123456', $profile->no_ktp);
        $this->assertSame('KLINIK SEHAT', $profile->faskes_nama_ppk);
        $this->assertTrue((bool) $profile->faskes_terpilih);
        $this->assertSame('A1', $profile->code_grup_pajak);
        $this->assertSame('K2', $profile->code_grup_status_nikah);
        $this->assertSame('TK0', $profile->code_status_pajak);

        $this->assertDatabaseHas('employee_educations', [
            'employee_id' => $employee->id,
            'jenjang' => 'SD',
            'nama_sekolah' => 'SDN 1 Tegal',
            'tahun' => '2002 - 2008',
        ]);
        $this->assertDatabaseHas('employee_educations', [
            'employee_id' => $employee->id,
            'jenjang' => 'SMA/SMK',
            'nama_sekolah' => 'SMK Negeri 1',
            'jurusan' => 'TKJ',
        ]);
        $this->assertDatabaseHas('employee_family_members', [
            'employee_id' => $employee->id,
            'hubungan' => 'AYAH',
            'urutan' => 1,
            'nama' => 'Bapak Kandung',
            'usia' => 60,
        ]);
        $this->assertDatabaseHas('employee_family_members', [
            'employee_id' => $employee->id,
            'hubungan' => 'SUAMI',
            'urutan' => 1,
            'nama' => 'Suami Tercinta',
        ]);
        $this->assertDatabaseHas('employee_physicals', [
            'employee_id' => $employee->id,
            'warna_kulit' => 'Sawo Matang',
            'golongan_darah' => 'O',
            'ukuran_sepatu' => '42',
        ]);

        $path = app(ExportPegawaiService::class)->handle(['search' => 'TEST.XLSX.01']);

        try {
            [$exportedHeaders, $exportedRow] = $this->firstDataRow($path);

            $this->assertSame($headers, $exportedHeaders);

            $exported = array_combine($exportedHeaders, $exportedRow);

            $this->assertSame('TEST.XLSX.01', $exported['NIK']);
            $this->assertSame('REF-XLSX-01', $exported['Ref ID']);
            $this->assertSame('Pegawai Excel', $exported['Nama Lengkap']);
            $this->assertSame('III/A', $exported['Tingkat']);
            $this->assertSame('Staff', $exported['Golongan']);
            $this->assertSame('JAWA TENGAH', $exported['Propinsi']);
            $this->assertSame('KLINIK SEHAT', $exported['Faskes Tingkat I']);
            $this->assertSame('SDN 1 Tegal', $exported['Pendidikan SD - Nama Sekolah']);
            $this->assertSame('2002 - 2008', $exported['Pendidikan SD - Tahun']);
            $this->assertSame('SMK Negeri 1', $exported['Pendidikan SMA/SMK - Nama Sekolah']);
            $this->assertSame('Bapak Kandung', $exported['Keluarga Ayah - Nama']);
            $this->assertSame('Suami Tercinta', $exported['Keluarga Suami - Nama']);
            $this->assertSame('Sawo Matang', $exported['Warna Kulit']);
            $this->assertSame('O', $exported['Golongan Darah']);
            $this->assertEquals(172, $exported['Tinggi Badan']);
            $this->assertEquals(68.5, $exported['Berat Badan']);
        } finally {
            @unlink($path);
        }

        $this->actingAs($admin)
            ->get('/api/data-pegawai/template')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    /**
     * Build an XLSX upload from spreadsheet rows.
     *
     * @param  list<list<mixed>>  $rows
     */
    private function xlsx(array $rows): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'pegawai-test-');

        if ($path === false) {
            $this->fail('Tidak dapat membuat berkas uji.');
        }

        @unlink($path);
        $path .= '.xlsx';

        $writer = new Writer;
        $writer->openToFile($path);

        foreach ($rows as $row) {
            $writer->addRow(Row::fromValues($row));
        }

        $writer->close();

        $file = UploadedFile::fake()->createWithContent(
            'data-pegawai.xlsx',
            (string) file_get_contents($path),
        );

        @unlink($path);

        return $file;
    }

    /**
     * Read the first data row from an XLSX file.
     *
     * @return array{0: list<mixed>, 1: list<mixed>}
     */
    private function firstDataRow(string $path): array
    {
        $reader = new Reader;
        $reader->open($path);

        $header = [];
        $row = [];

        foreach ($reader->getSheetIterator() as $sheet) {
            $first = true;

            foreach ($sheet->getRowIterator() as $current) {
                if ($first) {
                    $header = $current->toArray();
                    $first = false;

                    continue;
                }

                $row = $current->toArray();
                break;
            }

            break;
        }

        $reader->close();

        return [$header, $row];
    }
}
