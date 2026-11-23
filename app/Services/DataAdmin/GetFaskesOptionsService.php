<?php

namespace App\Services\DataAdmin;

use App\Models\FaskesBpjs;

class GetFaskesOptionsService
{
    /**
     * Return the province and city filter options.
     */
    public function handle(?string $provinsi = null): array
    {
        $kabupaten = FaskesBpjs::query()
            ->when(
                $provinsi !== null && trim($provinsi) !== '',
                fn ($query) => $query->where('nama_provinsi', trim($provinsi)),
            )
            ->whereNotNull('kabupaten_kota')
            ->distinct()
            ->orderBy('kabupaten_kota')
            ->pluck('kabupaten_kota')
            ->all();

        return [
            'provinsi' => FaskesBpjs::query()
                ->whereNotNull('nama_provinsi')
                ->distinct()
                ->orderBy('nama_provinsi')
                ->pluck('nama_provinsi')
                ->all(),
            'kabupaten' => $kabupaten,
        ];
    }
}
