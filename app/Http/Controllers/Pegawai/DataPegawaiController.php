<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Services\Pegawai\CreatePegawaiService;
use App\Services\Pegawai\DeletePegawaiService;
use App\Services\Pegawai\ExportPegawaiService;
use App\Services\Pegawai\GetDaftarPegawaiService;
use App\Services\Pegawai\ImportPegawaiService;
use App\Services\Pegawai\UpdatePegawaiService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DataPegawaiController extends Controller
{
    public function index(Request $request, GetDaftarPegawaiService $getDaftarPegawai)
    {
        return response()->json($getDaftarPegawai->handle([
            'search' => $request->query('search'),
            'status' => $request->query('status', 'all'),
            'page' => $request->query('page', 1),
            'per_page' => $request->query('per_page', 10),
        ]));
    }

    public function store(Request $request, CreatePegawaiService $createPegawai)
    {
        $data = $request->validate([
            'nik' => ['required', 'string', 'max:30', 'unique:employees,nik'],
            'nama' => ['required', 'string', 'max:255'],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'posisi' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:Aktif,Tidak Aktif'],
        ]);

        return response()->json([
            'pegawai' => $this->payload($createPegawai->handle($data)),
        ], 201);
    }

    public function update(
        Request $request,
        Employee $employee,
        UpdatePegawaiService $updatePegawai,
    ) {
        $data = $request->validate([
            'nik' => [
                'required',
                'string',
                'max:30',
                Rule::unique('employees', 'nik')->ignore($employee->id),
            ],
            'nama' => ['required', 'string', 'max:255'],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'posisi' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:Aktif,Tidak Aktif'],
        ]);

        return response()->json([
            'pegawai' => $this->payload($updatePegawai->handle($employee, $data)),
        ]);
    }

    public function destroy(Employee $employee, DeletePegawaiService $deletePegawai)
    {
        $deletePegawai->handle($employee);

        return response()->noContent();
    }

    public function import(Request $request, ImportPegawaiService $importPegawai)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        return response()->json([
            'hasil' => $importPegawai->handle($request->file('file')),
        ]);
    }

    public function export(Request $request, ExportPegawaiService $exportPegawai)
    {
        $csv = $exportPegawai->handle([
            'search' => $request->query('search'),
            'status' => $request->query('status', 'all'),
        ]);

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="data-pegawai-'.now()->format('Ymd-His').'.csv"',
        ]);
    }

    /**
     * Build the employee JSON payload.
     */
    private function payload(Employee $employee): array
    {
        return [
            'id' => $employee->id,
            'nik' => $employee->nik,
            'nama' => $employee->nama,
            'jabatan' => $employee->jabatan,
            'posisi' => $employee->posisi,
            'aktif' => $employee->isAktif(),
            'status' => $employee->status_pegawai,
        ];
    }
}
