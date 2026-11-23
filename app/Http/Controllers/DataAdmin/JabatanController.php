<?php

namespace App\Http\Controllers\DataAdmin;

use App\Http\Controllers\Controller;
use App\Models\EmployeeJabatan;
use App\Services\DataAdmin\CreateJabatanService;
use App\Services\DataAdmin\DeleteJabatanService;
use App\Services\DataAdmin\GetJabatanService;
use App\Services\DataAdmin\UpdateJabatanService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JabatanController extends Controller
{
    public function index(Request $request, GetJabatanService $getJabatan)
    {
        return response()->json($getJabatan->handle([
            'search' => $request->query('search'),
            'page' => $request->query('page', 1),
            'per_page' => $request->query('per_page', 10),
        ]));
    }

    public function store(Request $request, CreateJabatanService $createJabatan)
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:100', Rule::unique('employee_jabatans', 'nama')],
        ]);

        return response()->json([
            'data' => $this->payload($createJabatan->handle($data)),
        ], 201);
    }

    public function update(
        Request $request,
        EmployeeJabatan $jabatan,
        UpdateJabatanService $updateJabatan,
    ) {
        $data = $request->validate([
            'nama' => [
                'required',
                'string',
                'max:100',
                Rule::unique('employee_jabatans', 'nama')->ignore($jabatan->id),
            ],
        ]);

        return response()->json([
            'data' => $this->payload($updateJabatan->handle($jabatan, $data)),
        ]);
    }

    public function destroy(EmployeeJabatan $jabatan, DeleteJabatanService $deleteJabatan)
    {
        $deleteJabatan->handle($jabatan);

        return response()->noContent();
    }

    /**
     * Build the JSON payload for one job title.
     */
    private function payload(EmployeeJabatan $jabatan): array
    {
        return [
            'id' => $jabatan->id,
            'nama' => $jabatan->nama,
        ];
    }
}
