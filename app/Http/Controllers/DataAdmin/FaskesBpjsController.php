<?php

namespace App\Http\Controllers\DataAdmin;

use App\Http\Controllers\Controller;
use App\Models\FaskesBpjs;
use App\Services\DataAdmin\CreateFaskesService;
use App\Services\DataAdmin\DeleteFaskesService;
use App\Services\DataAdmin\ExportFaskesService;
use App\Services\DataAdmin\GetFaskesOptionsService;
use App\Services\DataAdmin\GetFaskesService;
use App\Services\DataAdmin\ImportFaskesService;
use App\Services\DataAdmin\UpdateFaskesService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FaskesBpjsController extends Controller
{
    public function index(
        Request $request,
        GetFaskesService $getFaskes,
        GetFaskesOptionsService $getOptions,
    ) {
        $filters = $this->filters($request);

        return response()->json($getFaskes->handle($filters) + [
            'options' => $getOptions->handle($filters['provinsi'] ?? null),
        ]);
    }

    public function store(Request $request, CreateFaskesService $createFaskes)
    {
        $data = $request->validate($this->rules());

        return response()->json([
            'data' => $this->payload($createFaskes->handle($data)),
        ], 201);
    }

    public function update(
        Request $request,
        FaskesBpjs $faskes,
        UpdateFaskesService $updateFaskes,
    ) {
        $data = $request->validate($this->rules($faskes));

        return response()->json([
            'data' => $this->payload($updateFaskes->handle($faskes, $data)),
        ]);
    }

    public function destroy(FaskesBpjs $faskes, DeleteFaskesService $deleteFaskes)
    {
        $deleteFaskes->handle($faskes);

        return response()->noContent();
    }

    public function import(Request $request, ImportFaskesService $importFaskes)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);

        return response()->json([
            'hasil' => $importFaskes->handle($request->file('file')),
        ]);
    }

    public function export(Request $request, ExportFaskesService $exportFaskes)
    {
        $csv = $exportFaskes->handle($this->filters($request));

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="data-faskes-bpjs-'.now()->format('Ymd-His').'.csv"',
        ]);
    }

    /**
     * Collect the list filters from the request.
     */
    private function filters(Request $request): array
    {
        return [
            'search' => $request->query('search'),
            'provinsi' => $request->query('provinsi'),
            'kabupaten' => $request->query('kabupaten'),
            'tanpa_kode' => $request->boolean('tanpa_kode'),
            'page' => $request->query('page', 1),
            'per_page' => $request->query('per_page', 10),
        ];
    }

    /**
     * Validation rules for creating or updating a facility.
     *
     * @return array<string, array<int, mixed>>
     */
    private function rules(?FaskesBpjs $faskes = null): array
    {
        return [
            'nama_provinsi' => ['required', 'string', 'max:255'],
            'kantor_regional' => ['nullable', 'string', 'max:255'],
            'kantor_cabang' => ['nullable', 'string', 'max:255'],
            'kabupaten_kota' => ['required', 'string', 'max:255'],
            'kode_ppk' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('faskes_bpjs', 'kode_ppk')->ignore($faskes?->id),
            ],
            'nama_ppk' => ['required', 'string', 'max:255'],
            'alamat_ppk' => ['nullable', 'string', 'max:255'],
            'telp_ppk' => ['nullable', 'string', 'max:30'],
        ];
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
