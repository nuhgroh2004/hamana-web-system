<?php

namespace App\Services\DataAdmin;

use App\Models\FaskesBpjs;

class UpdateFaskesService
{
    /**
     * Update an existing BPJS health facility.
     */
    public function handle(FaskesBpjs $faskes, array $data): FaskesBpjs
    {
        $faskes->fill($this->normalize($data))->save();

        return $faskes;
    }

    /**
     * Normalize the incoming facility attributes.
     */
    private function normalize(array $data): array
    {
        $upper = fn (?string $value) => $this->value($value) === null
            ? null
            : mb_strtoupper($this->value($value));

        return [
            'nama_provinsi' => $upper($data['nama_provinsi'] ?? null),
            'kantor_regional' => $upper($data['kantor_regional'] ?? null),
            'kantor_cabang' => $upper($data['kantor_cabang'] ?? null),
            'kabupaten_kota' => $upper($data['kabupaten_kota'] ?? null),
            'kode_ppk' => $upper($data['kode_ppk'] ?? null),
            'nama_ppk' => $upper($data['nama_ppk'] ?? null),
            'alamat_ppk' => $this->value($data['alamat_ppk'] ?? null),
            'telp_ppk' => $this->value($data['telp_ppk'] ?? null),
        ];
    }

    /**
     * Trim an optional value and convert blanks to null.
     */
    private function value(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
