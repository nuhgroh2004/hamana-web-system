<?php

namespace App\Http\Controllers\DataAdmin;

use App\Http\Controllers\Controller;
use App\Models\EmployeeLevel;
use App\Services\DataAdmin\CreateTingkatService;
use App\Services\DataAdmin\DeleteTingkatService;
use App\Services\DataAdmin\GetTingkatService;
use App\Services\DataAdmin\UpdateTingkatService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TingkatController extends Controller
{
    public function index(Request $request, GetTingkatService $getTingkat)
    {
        return response()->json($getTingkat->handle([
            'search' => $request->query('search'),
            'page' => $request->query('page', 1),
            'per_page' => $request->query('per_page', 10),
        ]));
    }

    public function store(Request $request, CreateTingkatService $createTingkat)
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:100', Rule::unique('employee_levels', 'nama')],
        ]);

        return response()->json([
            'data' => $this->payload($createTingkat->handle($data)),
        ], 201);
    }

    public function update(
        Request $request,
        EmployeeLevel $level,
        UpdateTingkatService $updateTingkat,
    ) {
        $data = $request->validate([
            'nama' => [
                'required',
                'string',
                'max:100',
                Rule::unique('employee_levels', 'nama')->ignore($level->id),
            ],
        ]);

        return response()->json([
            'data' => $this->payload($updateTingkat->handle($level, $data)),
        ]);
    }

    public function destroy(EmployeeLevel $level, DeleteTingkatService $deleteTingkat)
    {
        $deleteTingkat->handle($level);

        return response()->noContent();
    }

    /**
     * Build the JSON payload for one level.
     */
    private function payload(EmployeeLevel $level): array
    {
        return [
            'id' => $level->id,
            'nama' => $level->nama,
        ];
    }
}
