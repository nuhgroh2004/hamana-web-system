<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Builder;

class GetDaftarPegawaiService
{
    /**
     * Return a paginated employee list with summary counts.
     */
    public function handle(array $filters): array
    {
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 10)));
        $page = max(1, (int) ($filters['page'] ?? 1));

        $counts = [
            'aktif' => Employee::query()->forDataPegawai()->where('status_pegawai', Employee::STATUS_AKTIF)->count(),
            'tidak_aktif' => Employee::query()
                ->forDataPegawai()
                ->where(fn (Builder $query) => $query
                    ->where('status_pegawai', '!=', Employee::STATUS_AKTIF)
                    ->orWhereNull('status_pegawai'))
                ->count(),
            'semua' => Employee::query()->forDataPegawai()->count(),
        ];

        $paginator = $this->query($filters)
            ->orderBy('nama')
            ->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => collect($paginator->items())
                ->map(fn (Employee $employee) => [
                    'id' => $employee->id,
                    'nik' => $employee->nik,
                    'nama' => $employee->nama,
                    'jabatan' => $employee->jabatan,
                    'posisi' => $employee->posisi,
                    'email' => $employee->profile?->email,
                    'tanggal_lahir' => $employee->profile?->tanggal_lahir?->format('Y-m-d'),
                    'aktif' => $employee->isAktif(),
                    'status' => $employee->status_pegawai,
                ])
                ->all(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'counts' => $counts,
        ];
    }

    /**
     * Apply the search and status filters.
     */
    private function query(array $filters): Builder
    {
        $query = Employee::query()->forDataPegawai()->with('profile');

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
}
