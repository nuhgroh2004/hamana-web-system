<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Models\EmployeeDocument;
use App\Services\Employee\AuthorizeEmployeeAccessService;
use App\Services\Employee\ResolveEmployeeService;
use App\Services\Profile\DeleteDokumenService;
use App\Services\Profile\GetDokumenFileService;
use App\Services\Profile\GetDokumenService;
use App\Services\Profile\SaveNomorDokumenService;
use App\Services\Profile\UploadDokumenService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class KelolaFileController extends Controller
{
    public function index(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        GetDokumenService $getDokumen,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        return response()->json($getDokumen->handle($employee));
    }

    public function store(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        UploadDokumenService $uploadDokumen,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        $data = $request->validate([
            'kategori' => ['required', 'string', 'in:KK,KTP,NPWP,LAIN'],
            'judul' => ['nullable', 'string', 'max:120'],
            'nomor' => ['nullable', 'string', 'max:50'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ]);

        $this->validateNomor($data['kategori'], $data['nomor'] ?? null);

        $document = $uploadDokumen->handle(
            $employee,
            $request->file('file'),
            $data['kategori'],
            $data['judul'] ?? null,
            $data['nomor'] ?? null,
        );

        return response()->json(['dokumen' => $document], 201);
    }

    public function destroy(
        Request $request,
        EmployeeDocument $document,
        ResolveEmployeeService $resolveEmployee,
        DeleteDokumenService $deleteDokumen,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        $deleteDokumen->handle($employee, $document);

        return response()->noContent();
    }

    public function saveNumbers(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        SaveNomorDokumenService $saveNomorDokumen,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        $data = $request->validate([
            'nomor' => ['required', 'array'],
            'nomor.KK' => ['nullable', 'string', 'max:50'],
            'nomor.KTP' => ['nullable', 'string', 'max:50'],
            'nomor.NPWP' => ['nullable', 'string', 'max:50'],
        ]);

        foreach ($data['nomor'] as $kategori => $nomor) {
            $this->validateNomor($kategori, $nomor);
        }

        return response()->json([
            'nomor' => $saveNomorDokumen->handle($employee, $data['nomor']),
        ]);
    }

    public function show(
        Request $request,
        EmployeeDocument $document,
        AuthorizeEmployeeAccessService $authorizeEmployeeAccess,
        GetDokumenFileService $getDokumenFile,
    ) {
        $authorizeEmployeeAccess->handle($request->user(), $document->employee);

        $file = $getDokumenFile->handle($document->employee, $document);

        return response()->file($file['path'], ['Content-Type' => $file['mime']]);
    }

    /**
     * Validate the document number format for a category.
     */
    private function validateNomor(string $kategori, ?string $nomor): void
    {
        if ($nomor === null || trim($nomor) === '' || $kategori === 'LAIN') {
            return;
        }

        $digits = preg_replace('/\D/', '', $nomor) ?? '';

        if (in_array($kategori, ['KK', 'KTP'], true) && strlen($digits) !== 16) {
            throw ValidationException::withMessages([
                'nomor.'.$kategori => 'Nomor '.$kategori.' harus 16 digit angka.',
            ]);
        }

        if ($kategori === 'NPWP' && ! in_array(strlen($digits), [15, 16], true)) {
            throw ValidationException::withMessages([
                'nomor.NPWP' => 'Nomor NPWP harus 15 atau 16 digit angka.',
            ]);
        }
    }
}
