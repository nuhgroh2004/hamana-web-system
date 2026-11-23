<?php

namespace App\Services\DataAdmin;

use App\Models\FaskesBpjs;
use Illuminate\Database\Eloquent\Builder;

class ExportFaskesService
{
    /**
     * Build a CSV export of health facilities using the active filters.
     */
    public function handle(array $filters): string
    {
        $query = FaskesBpjs::query();

        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $query->where(function (Builder $query) use ($search) {
                $query->where('nama_ppk', 'like', '%'.$search.'%')
                    ->orWhere('kode_ppk', 'like', '%'.$search.'%')
                    ->orWhere('alamat_ppk', 'like', '%'.$search.'%');
            });
        }

        $provinsi = trim((string) ($filters['provinsi'] ?? ''));

        if ($provinsi !== '') {
            $query->where('nama_provinsi', $provinsi);
        }

        $kabupaten = trim((string) ($filters['kabupaten'] ?? ''));

        if ($kabupaten !== '') {
            $query->where('kabupaten_kota', $kabupaten);
        }

        if (! empty($filters['tanpa_kode'])) {
            $query->where(fn (Builder $query) => $query->whereNull('kode_ppk')->orWhere('kode_ppk', ''));
        }

        $stream = fopen('php://temp', 'r+');
        fwrite($stream, "\xEF\xBB\xBF");
        fputcsv($stream, [
            'No',
            'Nama Provinsi',
            'Kantor Regional',
            'Kantor Cabang',
            'Kabupaten/Kota',
            'Kode PPK',
            'Nama PPK',
            'Alamat PPK',
            'Telp PPK',
        ]);

        $number = 1;

        foreach ($query->orderBy('nama_provinsi')->orderBy('kabupaten_kota')->orderBy('nama_ppk')->cursor() as $faskes) {
            fputcsv($stream, [
                $number++,
                $faskes->nama_provinsi,
                $faskes->kantor_regional,
                $faskes->kantor_cabang,
                $faskes->kabupaten_kota,
                $faskes->kode_ppk,
                $faskes->nama_ppk,
                $faskes->alamat_ppk,
                $faskes->telp_ppk,
            ]);
        }

        rewind($stream);
        $csv = (string) stream_get_contents($stream);
        fclose($stream);

        return $csv;
    }
}
