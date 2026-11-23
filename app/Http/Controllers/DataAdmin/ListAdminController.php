<?php

namespace App\Http\Controllers\DataAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\DataAdmin\CreateAdminService;
use App\Services\DataAdmin\DeleteAdminService;
use App\Services\DataAdmin\GetAdminService;
use App\Services\DataAdmin\UpdateAdminService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ListAdminController extends Controller
{
    public function index(Request $request, GetAdminService $getAdmin)
    {
        return response()->json($getAdmin->handle([
            'search' => $request->query('search'),
            'page' => $request->query('page', 1),
            'per_page' => $request->query('per_page', 10),
        ]));
    }

    public function store(Request $request, CreateAdminService $createAdmin)
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'nik' => [
                'required',
                'string',
                'regex:/^\d{4}\.\d{2}\.\d{2}\.\d{2}$/',
                Rule::unique('users', 'nik'),
            ],
            'nama' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
            'aktif' => ['required', 'boolean'],
            'karyawan_aktif' => ['required', 'boolean'],
        ]);

        return response()->json([
            'data' => $this->payload($createAdmin->handle($data)),
        ], 201);
    }

    public function update(
        Request $request,
        User $user,
        UpdateAdminService $updateAdmin,
    ) {
        abort_unless($user->isAdmin(), 404);

        $data = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'nik' => [
                'required',
                'string',
                'regex:/^\d{4}\.\d{2}\.\d{2}\.\d{2}$/',
                Rule::unique('users', 'nik')->ignore($user->id),
            ],
            'nama' => ['required', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:6'],
            'aktif' => ['required', 'boolean'],
            'karyawan_aktif' => ['required', 'boolean'],
        ]);

        return response()->json([
            'data' => $this->payload($updateAdmin->handle($user, $data)),
        ]);
    }

    public function destroy(Request $request, User $user, DeleteAdminService $deleteAdmin)
    {
        abort_unless($user->isAdmin(), 404);

        $deleteAdmin->handle($user, $request->user());

        return response()->noContent();
    }

    /**
     * Build the JSON payload for one admin account.
     */
    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'email' => $user->email,
            'nik' => $user->nik,
            'nama' => $user->name,
            'aktif' => $user->isActive(),
            'karyawan_aktif' => $user->employee?->isAktif() ?? false,
        ];
    }
}
