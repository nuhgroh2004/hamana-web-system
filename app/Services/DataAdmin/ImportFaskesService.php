<?php

namespace App\Services\DataAdmin;

use App\Models\FaskesBpjs;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ImportFaskesService
{
    /**
     * Import health facilities from a CSV file, updating rows by PPK code.
     */
    public function handle(UploadedFile $file): array
    {
        [$header, $rows] = $this->readCsv($file);

        $labels = [
            'namaprovinsi' => 'nama_provinsi',
            'kantorregional' => 'kantor_regional',
            'kantorcabang' => 'kantor_cabang',
            'kabupatenkota' => 'kabupaten_kota',
            'kodeppk' => 'kode_ppk',
            'namappk' => 'nama_ppk',
            'alamatppk' => 'alamat_ppk',
            'telpppk' => 'telp_ppk',
        ];

        $map = [];

        foreach ($header as $index => $label) {
            $key = $this->normalizeHeader((string) $label);

            if (isset($labels[$key])) {
                $map[$labels[$key]] = $index;
            }
        }

        if (! isset($map['nama_ppk'])) {
            throw ValidationException::withMessages([
                'file' => 'Kolom Nama PPK wajib ada di baris pertama.',
            ]);
        }

        $added = 0;
        $updated = 0;
        $skipped = 0;

        DB::transaction(function () use ($rows, $map, &$added, &$updated, &$skipped) {
            foreach ($rows as $row) {
                $value = function (string $key) use ($row, $map): string {
                    return isset($map[$key], $row[$map[$key]])
                        ? trim((string) $row[$map[$key]])
                        : '';
                };

                $namaPpk = $value('nama_ppk');

                if ($namaPpk === '') {
                    $skipped++;

                    continue;
                }

                $data = [
                    'nama_provinsi' => $this->upper($value('nama_provinsi')),
                    'kantor_regional' => $this->upper($value('kantor_regional')),
                    'kantor_cabang' => $this->upper($value('kantor_cabang')),
                    'kabupaten_kota' => $this->upper($value('kabupaten_kota')),
                    'kode_ppk' => $this->upper($value('kode_ppk')),
                    'nama_ppk' => $this->upper($namaPpk),
                    'alamat_ppk' => $this->optional($value('alamat_ppk')),
                    'telp_ppk' => $this->optional($value('telp_ppk')),
                ];

                $existing = $data['kode_ppk'] !== null
                    ? FaskesBpjs::query()->where('kode_ppk', $data['kode_ppk'])->first()
                    : null;

                if ($existing) {
                    foreach ($data as $key => $item) {
                        if ($item !== null) {
                            $existing->{$key} = $item;
                        }
                    }

                    $existing->save();
                    $updated++;

                    continue;
                }

                FaskesBpjs::query()->create($data);
                $added++;
            }
        });

        return [
            'ditambah' => $added,
            'diperbarui' => $updated,
            'dilewati' => $skipped,
        ];
    }

    /**
     * Read the uploaded CSV into a header and data rows.
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
            if (collect($row)->every(fn ($value) => trim((string) $value) === '')) {
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
     * Uppercase a value when it is filled.
     */
    private function upper(string $value): ?string
    {
        return $value === '' ? null : mb_strtoupper($value);
    }

    /**
     * Trim a value and convert blanks to null.
     */
    private function optional(string $value): ?string
    {
        return $value === '' ? null : $value;
    }

    /**
     * Normalize a CSV header label.
     */
    private function normalizeHeader(string $header): string
    {
        return preg_replace('/[^a-z0-9]/', '', mb_strtolower(trim($header))) ?? '';
    }
}
