<?php

namespace App\Services\DataAdmin;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class GetSatpamService
{
    /**
     * Return a paginated list of satpam accounts.
     */
    public function handle(array $filters): array
    {
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 10)));
        $page = max(1, (int) ($filters['page'] ?? 1));

        $query = User::query()->where('role', User::ROLE_SATPAM);

        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $query->where(function (Builder $query) use ($search) {
                $query->where('email', 'like', '%'.$search.'%')
                    ->orWhere('name', 'like', '%'.$search.'%');
            });
        }

        $paginator = $query->orderBy('name')->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => collect($paginator->items())
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'nama' => $user->name,
                    'aktif' => $user->isActive(),
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
