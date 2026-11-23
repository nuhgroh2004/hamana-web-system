<?php

namespace App\Services\DataAdmin;

use App\Models\FaskesBpjs;
use Illuminate\Database\Eloquent\Builder;

class GetFaskesService
{
    /**
     * Return a paginated list of BPJS health facilities.
     */
    public function handle(array $filters): array
    {
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 10)));
        $page = max(1, (int) ($filters['page'] ?? 1));

        $paginator = $this->query($filters)
            ->orderBy('nama_provinsi')
            ->orderBy('kabupaten_kota')
            ->orderBy('nama_ppk')
            ->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => collect($paginator->items())
                ->map(fn (FaskesBpjs $faskes) => $this->payload($faskes))
                ->all(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'counts' => [
                'total' => FaskesBpjs::query()->count(),
                'tanpa_kode' => FaskesBpjs::query()
                    ->where(fn (Builder $query) => $query->whereNull('kode_ppk')->orWhere('kode_ppk', ''))
                    ->count(),
            ],
        ];
    }

    /**
     * Apply the search and filter options.
     */
    private function query(array $filters): Builder
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

        return $query;
    }

    /**
     * Build the JSON payload for one facility.
     */
    private function payload(FaskesBpjs $faskes): array
    {
        return [
            'id' => $faskes->id,
            'nama_provinsi' => $faskes->nama_provinsi,
            'kantor_regional' => $faskes->kantor_regional,
            'kantor_cabang' => $faskes->kantor_cabang,
            'kabupaten_kota' => $faskes->kabupaten_kota,
            'kode_ppk' => $faskes->kode_ppk,
            'nama_ppk' => $faskes->nama_ppk,
            'alamat_ppk' => $faskes->alamat_ppk,
            'telp_ppk' => $faskes->telp_ppk,
        ];
    }
}
