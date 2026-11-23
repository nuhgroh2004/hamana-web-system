<?php

namespace App\Services\DataAdmin;

use App\Models\EmployeeJabatan;

class GetJabatanService
{
    /**
     * Return a paginated list of employee job titles.
     */
    public function handle(array $filters): array
    {
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 10)));
        $page = max(1, (int) ($filters['page'] ?? 1));

        $query = EmployeeJabatan::query();

        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $query->where('nama', 'like', '%'.$search.'%');
        }

        $paginator = $query->orderBy('nama')->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => collect($paginator->items())
                ->map(fn (EmployeeJabatan $jabatan) => [
                    'id' => $jabatan->id,
                    'nama' => $jabatan->nama,
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
        ];
    }
}
