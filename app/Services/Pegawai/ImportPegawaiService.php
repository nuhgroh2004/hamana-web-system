<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use App\Support\PegawaiSheet;
use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use OpenSpout\Reader\XLSX\Reader;
use Throwable;

class ImportPegawaiService
{
    /**
     * Import employees from an XLSX or CSV file, updating rows by NIK.
     *
     * @return array{ditambah: int, diperbarui: int, dilewati: int}
     */
    public function handle(UploadedFile $file): array
    {
        [$header, $rows] = $this->read($file);

        $map = [];

        foreach ($header as $index => $label) {
            $key = PegawaiSheet::normalize((string) $label);

            if ($key !== '') {
                $map[$key] = $index;
            }
        }

        if (! isset($map['nik']) || ! $this->hasAny($map, ['namalengkap', 'nama'])) {
            throw ValidationException::withMessages([
                'file' => 'Kolom NIK dan Nama Lengkap wajib ada di baris pertama.',
            ]);
        }

        $added = 0;
        $updated = 0;
        $skipped = 0;

        DB::transaction(function () use ($rows, $map, &$added, &$updated, &$skipped) {
            foreach ($rows as $row) {
                $result = $this->importRow($row, $map);

                if ($result === 'added') {
                    $added++;
                } elseif ($result === 'updated') {
                    $updated++;
                } else {
                    $skipped++;
                }
            }
        });

        return [
            'ditambah' => $added,
            'diperbarui' => $updated,
            'dilewati' => $skipped,
        ];
    }

    /**
     * Import a single spreadsheet row.
     *
     * @param  array<int, mixed>  $row
     * @param  array<string, int>  $map
     * @return 'added'|'updated'|null
     */
    private function importRow(array $row, array $map): ?string
    {
        $nik = $this->text($row, $map, 'nik');
        $nama = $this->text($row, $map, 'namalengkap', 'nama');

        if ($nik === null || $nama === null) {
            return null;
        }

        $employee = Employee::query()->where('nik', $nik)->first();
        $created = $employee === null;

        if ($created) {
            $employee = new Employee(['nik' => $nik]);
        }

        $employee->nik = $nik;
        $employee->nama = $nama;

        foreach (['jabatan', 'posisi', 'tingkat', 'golongan'] as $field) {
            if ($this->has($map, $field)) {
                $employee->{$field} = $this->text($row, $map, $field);
            }
        }

        // Ref ID bersifat read-only: hanya diisi bila belum pernah ada.
        if ($this->has($map, 'refid') && ! $employee->ref_id) {
            $employee->ref_id = $this->text($row, $map, 'refid');
        }

        if ($this->hasAny($map, ['statuspegawai', 'status'])) {
            $status = $this->status($this->text($row, $map, 'statuspegawai', 'status'));

            if ($status !== null) {
                $employee->status_pegawai = $status;
            }
        }

        $employee->save();

        $this->importProfile($employee, $row, $map);
        $this->importEducations($employee, $row, $map);
        $this->importFamily($employee, $row, $map);
        $this->importPhysical($employee, $row, $map);

        return $created ? 'added' : 'updated';
    }

    /**
     * Import the employee profile columns.
     *
     * @param  array<int, mixed>  $row
     * @param  array<string, int>  $map
     */
    private function importProfile(Employee $employee, array $row, array $map): void
    {
        $data = [];

        $textFields = [
            'noktp' => 'no_ktp',
            'tempatlahir' => 'tempat_lahir',
            'agama' => 'agama',
            'statusnikah' => 'status_nikah',
            'email' => 'email',
            'nohp1' => 'no_hp_1',
            'nohp2' => 'no_hp_2',
            'rumahyangditinggali' => 'status_rumah',
            'alamatktp' => 'alamat_ktp',
            'alamatdomisili' => 'alamat_domisili',
            'propinsi' => 'propinsi',
            'nopassport' => 'no_passport',
            'npwp' => 'npwp',
            'bpjsketenagakerjaan' => 'bpjs_ketenagakerjaan',
            'bpjskesehatan' => 'bpjs_kesehatan',
            'rekeningmandiri' => 'rekening_mandiri',
            'departemen' => 'departemen',
            'namadarurat1' => 'darurat_nama_1',
            'notelpdarurat1' => 'darurat_telp_1',
            'hubungandarurat1' => 'darurat_hubungan_1',
            'namadarurat2' => 'darurat_nama_2',
            'notelpdarurat2' => 'darurat_telp_2',
            'hubungandarurat2' => 'darurat_hubungan_2',
            'instagram' => 'instagram',
            'facebook' => 'facebook',
            'twitter' => 'twitter',
        ];

        foreach ($textFields as $key => $column) {
            if ($this->has($map, $key)) {
                $data[$column] = $this->text($row, $map, $key);
            }
        }

        if ($this->has($map, 'jeniskelamin')) {
            $data['jenis_kelamin'] = $this->gender($this->text($row, $map, 'jeniskelamin'));
        }

        if ($this->has($map, 'tanggallahir')) {
            $data['tanggal_lahir'] = $this->dateValue($this->raw($row, $map, 'tanggallahir'));
        }

        if ($this->has($map, 'jumlahanak')) {
            $data['jumlah_anak'] = $this->integerValue($this->raw($row, $map, 'jumlahanak'));
        }

        if ($this->has($map, 'tanggalbergabung')) {
            $data['tanggal_gabung'] = $this->dateValue($this->raw($row, $map, 'tanggalbergabung'));
        }

        foreach ([
            'codegruppajak' => 'code_grup_pajak',
            'codegrupstatuspernikahan' => 'code_grup_status_nikah',
            'codestatuspajak' => 'code_status_pajak',
        ] as $key => $column) {
            if ($this->has($map, $key)) {
                $data[$column] = $this->upper($this->text($row, $map, $key));
            }
        }

        if ($this->has($map, 'faskestingkati')) {
            $faskes = $this->text($row, $map, 'faskestingkati');

            $data['faskes_nama_ppk'] = $faskes;
            $data['faskes_terpilih'] = $faskes !== null;
        }

        if ($data !== []) {
            $employee->profile()->updateOrCreate(
                ['employee_id' => $employee->id],
                $data,
            );
        }
    }

    /**
     * Import the education columns.
     *
     * @param  array<int, mixed>  $row
     * @param  array<string, int>  $map
     */
    private function importEducations(Employee $employee, array $row, array $map): void
    {
        foreach (PegawaiSheet::EDUCATION_LEVELS as $label => $jenjang) {
            $base = PegawaiSheet::educationKey($label);
            $keys = [$base.'namasekolah', $base.'jurusan', $base.'tahun'];

            if (! $this->hasAny($map, $keys)) {
                continue;
            }

            $namaSekolah = $this->text($row, $map, $keys[0]);
            $jurusan = $this->text($row, $map, $keys[1]);
            $tahun = $this->text($row, $map, $keys[2]);

            if ($namaSekolah === null && $jurusan === null && $tahun === null) {
                continue;
            }

            $employee->educations()->updateOrCreate(
                ['jenjang' => $jenjang],
                [
                    'nama_sekolah' => $namaSekolah,
                    'jurusan' => $jurusan,
                    'tahun' => $tahun,
                    'aktif' => true,
                ],
            );
        }
    }

    /**
     * Import the family columns.
     *
     * @param  array<int, mixed>  $row
     * @param  array<string, int>  $map
     */
    private function importFamily(Employee $employee, array $row, array $map): void
    {
        $gender = $employee->profile()->value('jenis_kelamin');

        foreach (PegawaiSheet::FAMILY_SLOTS as $slot) {
            $base = PegawaiSheet::familyKey($slot);
            $keys = [$base.'nama', $base.'usia', $base.'pekerjaan'];

            if (! $this->hasAny($map, $keys)) {
                continue;
            }

            $nama = $this->text($row, $map, $keys[0]);
            $usia = $this->integerValue($this->raw($row, $map, $keys[1]));
            $pekerjaan = $this->text($row, $map, $keys[2]);

            if ($nama === null && $usia === null && $pekerjaan === null) {
                continue;
            }

            $hubungan = $slot['hubungan'];
            $urutan = $slot['urutan'];

            if ($slot['spouse'] ?? false) {
                if ($gender === 'Perempuan') {
                    $hubungan = 'ISTRI';
                }

                $employee->familyMembers()->whereIn('hubungan', ['SUAMI', 'ISTRI'])->delete();
            }

            $employee->familyMembers()->updateOrCreate(
                ['hubungan' => $hubungan, 'urutan' => $urutan],
                [
                    'nama' => $nama,
                    'usia' => $usia,
                    'pekerjaan' => $pekerjaan,
                    'aktif' => true,
                ],
            );
        }
    }

    /**
     * Import the physical trait columns.
     *
     * @param  array<int, mixed>  $row
     * @param  array<string, int>  $map
     */
    private function importPhysical(Employee $employee, array $row, array $map): void
    {
        $data = [];

        foreach ([
            'warnakulit' => 'warna_kulit',
            'warnarambut' => 'warna_rambut',
            'ukuranbaju' => 'ukuran_baju',
            'warnamata' => 'warna_mata',
            'ukurancelana' => 'ukuran_celana',
            'ukuransepatu' => 'ukuran_sepatu',
        ] as $key => $column) {
            if ($this->has($map, $key)) {
                $data[$column] = $this->text($row, $map, $key);
            }
        }

        if ($this->has($map, 'golongandarah')) {
            $data['golongan_darah'] = $this->upper($this->text($row, $map, 'golongandarah'));
        }

        if ($this->has($map, 'tinggibadan')) {
            $data['tinggi_badan'] = $this->decimalValue($this->raw($row, $map, 'tinggibadan'));
        }

        if ($this->has($map, 'beratbadan')) {
            $data['berat_badan'] = $this->decimalValue($this->raw($row, $map, 'beratbadan'));
        }

        if ($data !== []) {
            $employee->physical()->updateOrCreate(
                ['employee_id' => $employee->id],
                $data,
            );
        }
    }

    /**
     * Read the uploaded spreadsheet into a header and data rows.
     *
     * @return array{0: list<mixed>, 1: list<array<int, mixed>>}
     */
    private function read(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === '') {
            $signature = (string) file_get_contents($file->getRealPath(), false, null, 0, 2);
            $extension = $signature === 'PK' ? 'xlsx' : 'csv';
        }

        if (in_array($extension, ['csv', 'txt'], true)) {
            return $this->readCsv($file);
        }

        return $this->readXlsx($file);
    }

    /**
     * Read an XLSX worksheet.
     *
     * @return array{0: list<mixed>, 1: list<array<int, mixed>>}
     */
    private function readXlsx(UploadedFile $file): array
    {
        $reader = new Reader;

        try {
            $reader->open($file->getRealPath());
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'file' => 'Berkas Excel tidak dapat dibaca. Gunakan format .xlsx.',
            ]);
        }

        $header = [];
        $rows = [];

        try {
            foreach ($reader->getSheetIterator() as $sheet) {
                $first = true;

                foreach ($sheet->getRowIterator() as $row) {
                    $values = $row->toArray();

                    if ($first) {
                        $header = $values;
                        $first = false;

                        continue;
                    }

                    if ($this->isEmptyRow($values)) {
                        continue;
                    }

                    $rows[] = $values;
                }

                break;
            }
        } finally {
            $reader->close();
        }

        if ($header === [] || count($header) < 2) {
            throw ValidationException::withMessages([
                'file' => 'File kosong atau format XLSX tidak sesuai.',
            ]);
        }

        return [$header, $rows];
    }

    /**
     * Read the uploaded CSV into a header and data rows.
     *
     * @return array{0: list<mixed>, 1: list<array<int, mixed>>}
     */
    private function readCsv(UploadedFile $file): array
    {
        $content = (string) file_get_contents($file->getRealPath());
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content) ?? $content;

        $firstLine = strtok($content, "\r\n") ?: '';
        $candidates = [
            ',' => substr_count($firstLine, ','),
            ';' => substr_count($firstLine, ';'),
            "\t" => substr_count($firstLine, "\t"),
        ];
        arsort($candidates);
        $delimiter = array_key_first($candidates) ?: ',';

        $stream = fopen('php://temp', 'r+');
        fwrite($stream, $content);
        rewind($stream);

        $header = fgetcsv($stream, 0, $delimiter) ?: [];
        $rows = [];

        while (($row = fgetcsv($stream, 0, $delimiter)) !== false) {
            if ($this->isEmptyRow($row)) {
                continue;
            }

            $rows[] = $row;
        }

        fclose($stream);

        if ($header === [] || count($header) < 2) {
            throw ValidationException::withMessages([
                'file' => 'File kosong atau format CSV tidak sesuai.',
            ]);
        }

        return [$header, $rows];
    }

    /**
     * Check whether every cell in a row is empty.
     *
     * @param  array<int, mixed>  $row
     */
    private function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if ($value instanceof DateTimeInterface) {
                return false;
            }

            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }

    /**
     * Check whether any of the given header keys is present.
     *
     * @param  array<string, int>  $map
     * @param  list<string>  $keys
     */
    private function hasAny(array $map, array $keys): bool
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $map)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check whether a header key is present.
     *
     * @param  array<string, int>  $map
     */
    private function has(array $map, string $key): bool
    {
        return array_key_exists($key, $map);
    }

    /**
     * Read the raw cell value for a header key.
     *
     * @param  array<int, mixed>  $row
     * @param  array<string, int>  $map
     */
    private function raw(array $row, array $map, string $key): mixed
    {
        return array_key_exists($key, $map) ? ($row[$map[$key]] ?? null) : null;
    }

    /**
     * Read a text cell, trying the given header keys in order.
     *
     * @param  array<int, mixed>  $row
     * @param  array<string, int>  $map
     */
    private function text(array $row, array $map, string ...$keys): ?string
    {
        foreach ($keys as $key) {
            if (! array_key_exists($key, $map)) {
                continue;
            }

            $value = $row[$map[$key]] ?? null;

            if ($value instanceof DateTimeInterface) {
                return $value->format('Y-m-d');
            }

            $value = trim((string) $value);

            if ($value !== '') {
                return $value;
            }
        }

        return null;
    }

    /**
     * Normalize a date value from XLSX or CSV.
     */
    private function dateValue(mixed $value): ?string
    {
        if ($value instanceof DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        if ($value === null) {
            return null;
        }

        $text = trim((string) $value);

        if ($text === '') {
            return null;
        }

        if (is_numeric($text)) {
            $serial = (float) $text;

            if ($serial > 20000 && $serial < 80000) {
                $timestamp = (int) round(($serial - 25569) * 86400);

                return gmdate('Y-m-d', $timestamp);
            }
        }

        foreach (['Y-m-d', 'd/m/Y', 'd-m-Y', 'Y/m/d', 'd.m.Y'] as $format) {
            $date = \DateTimeImmutable::createFromFormat('!'.$format, $text);

            if ($date !== false && $date->format($format) === $text) {
                return $date->format('Y-m-d');
            }
        }

        try {
            return Carbon::parse($text)->format('Y-m-d');
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * Normalize a nullable integer value.
     */
    private function integerValue(mixed $value): ?int
    {
        if ($value === null) {
            return null;
        }

        if (is_int($value) || is_float($value)) {
            return (int) $value;
        }

        $text = preg_replace('/[^0-9-]/', '', trim((string) $value));

        return $text === '' || $text === null ? null : (int) $text;
    }

    /**
     * Normalize a nullable decimal value.
     */
    private function decimalValue(mixed $value): ?float
    {
        if ($value === null) {
            return null;
        }

        if (is_int($value) || is_float($value)) {
            return (float) $value;
        }

        $text = str_replace(',', '.', trim((string) $value));
        $text = preg_replace('/[^0-9.-]/', '', $text);

        return $text === '' || $text === null ? null : (float) $text;
    }

    /**
     * Normalize a gender value.
     */
    private function gender(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = mb_strtolower(trim($value));

        if (in_array($normalized, ['l', 'lk', 'laki-laki', 'laki laki', 'pria', 'male', 'm'], true)) {
            return 'Laki-Laki';
        }

        if (in_array($normalized, ['p', 'pr', 'perempuan', 'wanita', 'female', 'f'], true)) {
            return 'Perempuan';
        }

        return trim($value);
    }

    /**
     * Normalize the employment status.
     */
    private function status(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return preg_match('/tidak|non|^0$|false|inactive/i', $value)
            ? Employee::STATUS_TIDAK_AKTIF
            : Employee::STATUS_AKTIF;
    }

    /**
     * Normalize an optional code value to uppercase.
     */
    private function upper(?string $value): ?string
    {
        return $value === null ? null : mb_strtoupper($value);
    }
}
