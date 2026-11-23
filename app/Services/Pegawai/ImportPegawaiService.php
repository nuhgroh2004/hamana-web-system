<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ImportPegawaiService
{
    /**
     * Import employees from a CSV file, updating rows by NIK.
     */
    public function handle(UploadedFile $file): array
    {
        [$header, $rows] = $this->readCsv($file);

        $map = [];
        foreach ($header as $index => $label) {
            $map[$this->normalizeHeader((string) $label)] = $index;
        }

        if (! isset($map['nik'], $map['nama'])) {
            throw ValidationException::withMessages([
                'file' => 'Kolom NIK dan Nama wajib ada di baris pertama.',
            ]);
        }

        $added = 0;
        $updated = 0;
        $skipped = 0;

        DB::transaction(function () use ($rows, $map, &$added, &$updated, &$skipped) {
            foreach ($rows as $row) {
                $value = fn (string $key) => isset($map[$key], $row[$map[$key]])
                    ? trim((string) $row[$map[$key]])
                    : '';

                $nik = $value('nik');
                $nama = $value('nama');

                if ($nik === '' || $nama === '') {
                    $skipped++;

                    continue;
                }

                $status = $value('status');
                $status = $status === ''
                    ? null
                    : (preg_match('/tidak|non|^0$|false/i', $status)
                        ? Employee::STATUS_TIDAK_AKTIF
                        : Employee::STATUS_AKTIF);

                $employee = Employee::query()->where('nik', $nik)->first();

                if ($employee) {
                    $employee->nama = $nama;

                    if ($value('jabatan') !== '') {
                        $employee->jabatan = $value('jabatan');
                    }

                    if ($value('posisi') !== '') {
                        $employee->posisi = $value('posisi');
                    }

                    if ($status !== null) {
                        $employee->status_pegawai = $status;
                    }

                    $employee->save();
                    $updated++;

                    continue;
                }

                Employee::query()->create([
                    'nik' => $nik,
                    'nama' => $nama,
                    'jabatan' => $value('jabatan') ?: null,
                    'posisi' => $value('posisi') ?: null,
                    'status_pegawai' => $status ?? Employee::STATUS_AKTIF,
                ]);
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
     * Normalize a CSV header label.
     */
    private function normalizeHeader(string $header): string
    {
        return preg_replace('/[^a-z0-9]/', '', mb_strtolower(trim($header))) ?? '';
    }
}
