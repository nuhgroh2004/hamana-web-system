<?php

namespace App\Http\Controllers\DataAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\DataAdmin\CreateSatpamService;
use App\Services\DataAdmin\DeleteSatpamService;
use App\Services\DataAdmin\GetSatpamService;
use App\Services\DataAdmin\UpdateSatpamService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SatpamController extends Controller
{
    public function index(Request $request, GetSatpamService $getSatpam)
    {
        return response()->json($getSatpam->handle([
            'search' => $request->query('search'),
            'page' => $request->query('page', 1),
            'per_page' => $request->query('per_page', 10),
        ]));
    }

    public function store(Request $request, CreateSatpamService $createSatpam)
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'nama' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
            'aktif' => ['required', 'boolean'],
        ]);

        return response()->json([
            'data' => $this->payload($createSatpam->handle($data)),
        ], 201);
    }

    public function update(
        Request $request,
        User $user,
        UpdateSatpamService $updateSatpam,
    ) {
        abort_unless($user->role === User::ROLE_SATPAM, 404);

        $data = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'nama' => ['required', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:6'],
            'aktif' => ['required', 'boolean'],
        ]);

        return response()->json([
            'data' => $this->payload($updateSatpam->handle($user, $data)),
        ]);
    }

    public function destroy(User $user, DeleteSatpamService $deleteSatpam)
    {
        abort_unless($user->role === User::ROLE_SATPAM, 404);

        $deleteSatpam->handle($user);

        return response()->noContent();
    }

    /**
     * Build the JSON payload for one satpam account.
     */
    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'email' => $user->email,
            'nama' => $user->name,
            'aktif' => $user->isActive(),
        ];
    }
}
