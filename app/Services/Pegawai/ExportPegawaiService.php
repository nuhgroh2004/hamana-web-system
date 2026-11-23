<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use App\Models\EmployeeFamilyMember;
use App\Support\PegawaiSheet;
use Illuminate\Database\Eloquent\Builder;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\CellAlignment;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Options;
use OpenSpout\Writer\XLSX\Writer;

class ExportPegawaiService
{
    /**
     * Build an XLSX export of employees using the active filters.
     *
     * @param  array{search?: string, status?: string, header_only?: bool}  $filters
     * @return string Path to the generated XLSX file.
     */
    public function handle(array $filters): string
    {
        $path = $this->temporaryPath();

        $options = new Options;
        $options->DEFAULT_ROW_HEIGHT = 18;

        $headers = PegawaiSheet::headers();

        foreach ($headers as $index => $header) {
            $options->setColumnWidth($this->columnWidth($header), $index + 1);
        }

        $writer = new Writer($options);
        $writer->openToFile($path);

        $headerStyle = (new Style)
            ->setFontBold()
            ->setFontColor('FFFFFF')
            ->setBackgroundColor('004098')
            ->setCellAlignment(CellAlignment::CENTER)
            ->setShouldWrapText();

        $writer->addRow(Row::fromValues($headers, $headerStyle));

        if (! ($filters['header_only'] ?? false)) {
            $number = 1;

            $this->query($filters)->orderBy('nama')->chunk(500, function ($employees) use ($writer, &$number) {
                foreach ($employees as $employee) {
                    $writer->addRow(Row::fromValues($this->row($employee, $number++)));
                }
            });
        }

        $writer->close();

        return $path;
    }

    /**
     * Build an empty template containing only the header row.
     */
    public function template(): string
    {
        return $this->handle(['header_only' => true]);
    }

    /**
     * Build the filtered employee query.
     *
     * @param  array{search?: string, status?: string}  $filters
     */
    private function query(array $filters): Builder
    {
        $query = Employee::query()
            ->forDataPegawai()
            ->with(['profile', 'educations', 'familyMembers', 'physical']);

        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $query->where(function (Builder $query) use ($search) {
                $query->where('nama', 'like', '%'.$search.'%')
                    ->orWhere('nik', 'like', '%'.$search.'%');
            });
        }

        $status = (string) ($filters['status'] ?? 'all');

        if ($status === '1') {
            $query->where('status_pegawai', Employee::STATUS_AKTIF);
        } elseif ($status === '0') {
            $query->where(fn (Builder $query) => $query
                ->where('status_pegawai', Employee::STATUS_TIDAK_AKTIF)
                ->orWhereNull('status_pegawai'));
        }

        return $query;
    }

    /**
     * Build one spreadsheet row for an employee.
     *
     * @return list<mixed>
     */
    private function row(Employee $employee, int $number): array
    {
        $profile = $employee->profile;
        $physical = $employee->physical;

        $educations = [];

        foreach ($employee->educations as $education) {
            $educations[$education->jenjang] ??= $education;
        }

        $family = [];

        foreach ($employee->familyMembers as $member) {
            $family[$member->hubungan.':'.$member->urutan] ??= $member;
        }

        $spouse = $family['SUAMI:1'] ?? $family['ISTRI:1'] ?? null;

        $row = [
            $number,
            $employee->ref_id ?: $employee->id,
            $employee->nik,
            $profile?->no_ktp,
            $employee->nama,
            $profile?->jenis_kelamin,
            $profile?->tempat_lahir,
            $profile?->tanggal_lahir?->format('Y-m-d'),
            $profile?->agama,
            $profile?->status_nikah,
            $profile?->jumlah_anak,
            $profile?->email,
            $profile?->no_hp_1,
            $profile?->no_hp_2,
            $profile?->status_rumah,
            $profile?->alamat_ktp,
            $profile?->alamat_domisili,
            $profile?->propinsi,
            $profile?->no_passport,
            $profile?->npwp,
            $profile?->bpjs_ketenagakerjaan,
            $profile?->bpjs_kesehatan,
            $profile?->rekening_mandiri,
            $profile?->faskes_nama_ppk,
            $employee->tingkat,
            $employee->golongan,
            $employee->jabatan,
            $profile?->departemen,
            $employee->posisi,
            $profile?->tanggal_gabung?->format('Y-m-d'),
            $employee->status_pegawai,
            $profile?->darurat_nama_1,
            $profile?->darurat_telp_1,
            $profile?->darurat_hubungan_1,
            $profile?->darurat_nama_2,
            $profile?->darurat_telp_2,
            $profile?->darurat_hubungan_2,
            $profile?->instagram,
            $profile?->facebook,
            $profile?->twitter,
            $profile?->code_grup_pajak,
            $profile?->code_grup_status_nikah,
            $profile?->code_status_pajak,
        ];

        foreach (PegawaiSheet::EDUCATION_LEVELS as $jenjang) {
            $education = $educations[$jenjang] ?? null;

            $row[] = $education?->nama_sekolah;
            $row[] = $education?->jurusan;
            $row[] = $education?->tahun;
        }

        foreach (PegawaiSheet::FAMILY_SLOTS as $slot) {
            /** @var EmployeeFamilyMember|null $member */
            $member = ($slot['spouse'] ?? false)
                ? $spouse
                : ($family[$slot['hubungan'].':'.$slot['urutan']] ?? null);

            $row[] = $member?->nama;
            $row[] = $member?->usia;
            $row[] = $member?->pekerjaan;
        }

        return array_merge($row, [
            $physical?->warna_kulit,
            $physical?->golongan_darah,
            $physical?->warna_rambut,
            $physical?->ukuran_baju,
            $physical?->warna_mata,
            $physical?->ukuran_celana,
            $this->decimal($physical?->tinggi_badan),
            $this->decimal($physical?->berat_badan),
            $physical?->ukuran_sepatu,
        ]);
    }

    /**
     * Choose a sensible width for a spreadsheet column.
     */
    private function columnWidth(string $header): float
    {
        return (float) max(12, min(32, mb_strlen($header) + 4));
    }

    /**
     * Normalize a nullable decimal for numeric spreadsheet cells.
     */
    private function decimal(mixed $value): ?float
    {
        return $value === null || $value === '' ? null : (float) $value;
    }

    /**
     * Create a writable temporary XLSX path.
     */
    private function temporaryPath(): string
    {
        $path = tempnam(sys_get_temp_dir(), 'pegawai-');

        if ($path === false) {
            throw new \RuntimeException('Tidak dapat membuat berkas sementara untuk ekspor.');
        }

        @unlink($path);

        return $path.'.xlsx';
    }
}
