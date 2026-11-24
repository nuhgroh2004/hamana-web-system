<?php

namespace App\Http\Controllers\Permohonan;

use App\Http\Controllers\Controller;
use App\Services\Permohonan\GetSignatureService;
use App\Services\Permohonan\SaveSignatureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TandaTanganController extends Controller
{
    public function __construct(
        private GetSignatureService $getSignature,
        private SaveSignatureService $saveSignature,
    ) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'signature' => ($this->getSignature)($request->user()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'png' => ['required', 'string'],
        ]);

        $sig = ($this->saveSignature)($request->user(), $request->input('png'));

        return response()->json([
            'success' => true,
            'message' => 'Tanda tangan berhasil disimpan.',
            'signature' => [
                'png' => $sig->signature_data,
                'tgl' => $sig->updated_at->toISOString(),
            ],
        ]);
    }
}

