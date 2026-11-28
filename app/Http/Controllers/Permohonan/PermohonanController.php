<?php

namespace App\Http\Controllers\Permohonan;

use App\Http\Controllers\Controller;
use App\Models\PermohonanRequest;
use App\Services\Permohonan\ApprovePermohonanService;
use App\Services\Permohonan\CancelPermohonanService;
use App\Services\Permohonan\DeleteDraftService;
use App\Services\Permohonan\FormatPermohonanService;
use App\Services\Permohonan\GeneratePermohonanPdfService;
use App\Services\Permohonan\GetActiveEmployeesService;
use App\Services\Permohonan\GetPermohonanMasukService;
use App\Services\Permohonan\GetPermohonanSayaService;
use App\Services\Permohonan\GetUserContextService;
use App\Services\Permohonan\GetSignatureService;
use App\Services\Permohonan\RejectPermohonanService;
use App\Services\Permohonan\StorePermohonanService;
use App\Services\Permohonan\SubmitDraftService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermohonanController extends Controller
{
    public function __construct(
        private GetUserContextService $getUserContext,
        private GetSignatureService $getSignature,
        private GetActiveEmployeesService $getActiveEmployees,
        private FormatPermohonanService $format,
        private StorePermohonanService $storePermohonan,
        private SubmitDraftService $submitDraft,
        private CancelPermohonanService $cancelPermohonan,
        private DeleteDraftService $deleteDraft,
        private GetPermohonanSayaService $getPermohonanSaya,
        private GetPermohonanMasukService $getPermohonanMasuk,
        private ApprovePermohonanService $approvePermohonan,
        private RejectPermohonanService $rejectPermohonan,
    ) {}

    public function getUserContext(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user' => ($this->getUserContext)($request->user()),
            'signature' => ($this->getSignature)($request->user()),
        ]);
    }

    public function getActiveEmployees(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => ($this->getActiveEmployees)($request->user()->id),
        ]);
    }

    public function indexSaya(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => ($this->getPermohonanSaya)($request->user()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'form_type' => ['required', 'string'],
            'status' => ['required', 'in:draft,menunggu'],
            'approver_id' => ['nullable', 'exists:users,id'],
        ]);

        if ($request->input('status') === PermohonanRequest::STATUS_MENUNGGU && ! $request->input('approver_id')) {
            return response()->json(['success' => false, 'message' => 'Pilih atasan / approver.'], 422);
        }

        $permohonan = ($this->storePermohonan)($request->user(), $request);
        $permohonan->load(['approver.employee', 'user.employee', 'attachments']);

        return response()->json([
            'success' => true,
            'message' => $permohonan->status === PermohonanRequest::STATUS_DRAFT ? 'Draft disimpan.' : 'Permohonan dikirim.',
            'data' => ($this->format)($permohonan),
        ]);
    }

    public function submitDraft(Request $request, PermohonanRequest $permohonan): JsonResponse
    {
        if ($permohonan->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate(['approver_id' => ['required', 'exists:users,id']]);

        $permohonan = ($this->submitDraft)($permohonan, $request->user(), (int) $request->input('approver_id'));
        $permohonan->load(['approver.employee', 'user.employee', 'attachments']);

        return response()->json(['success' => true, 'message' => 'Permohonan dikirim.', 'data' => ($this->format)($permohonan)]);
    }

    public function cancel(Request $request, PermohonanRequest $permohonan): JsonResponse
    {
        if ($permohonan->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($permohonan->status !== PermohonanRequest::STATUS_MENUNGGU) {
            return response()->json(['success' => false, 'message' => 'Hanya status menunggu yang bisa dibatalkan.'], 422);
        }

        $permohonan = ($this->cancelPermohonan)($permohonan);
        $permohonan->load(['approver.employee', 'user.employee', 'attachments']);

        return response()->json(['success' => true, 'message' => 'Permohonan dibatalkan.', 'data' => ($this->format)($permohonan)]);
    }

    public function destroy(Request $request, PermohonanRequest $permohonan): JsonResponse
    {
        if ($permohonan->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($permohonan->status !== PermohonanRequest::STATUS_DRAFT) {
            return response()->json(['success' => false, 'message' => 'Hanya draft yang bisa dihapus.'], 422);
        }

        ($this->deleteDraft)($permohonan);

        return response()->json(['success' => true, 'message' => 'Draft dihapus.']);
    }

    public function indexMasuk(Request $request): JsonResponse
    {
        $result = ($this->getPermohonanMasuk)($request->user(), $request);

        return response()->json([
            'success' => true,
            'data' => $result['items'],
            'meta' => $result['meta'],
        ]);
    }

    public function pdf(
        Request $request,
        PermohonanRequest $permohonan,
        GeneratePermohonanPdfService $pdfService,
    ) {
        $user = $request->user();
        $allowed = $user->isAdmin()
            || $permohonan->user_id === $user->id
            || $permohonan->approver_id === $user->id;

        abort_unless($allowed, 403);

        return ($pdfService)($permohonan);
    }

    public function approve(Request $request, PermohonanRequest $permohonan): JsonResponse
    {
        if ($permohonan->approver_id !== $request->user()->id) {
            abort(403);
        }

        if ($permohonan->status !== PermohonanRequest::STATUS_MENUNGGU) {
            return response()->json(['success' => false, 'message' => 'Permohonan sudah diproses.'], 422);
        }

        $permohonan = ($this->approvePermohonan)($permohonan, $request->user());
        $permohonan->load(['user.employee', 'approver.employee', 'attachments']);

        return response()->json(['success' => true, 'message' => 'Disetujui.', 'data' => ($this->format)($permohonan)]);
    }

    public function reject(Request $request, PermohonanRequest $permohonan): JsonResponse
    {
        if ($permohonan->approver_id !== $request->user()->id) {
            abort(403);
        }

        if ($permohonan->status !== PermohonanRequest::STATUS_MENUNGGU) {
            return response()->json(['success' => false, 'message' => 'Permohonan sudah diproses.'], 422);
        }

        $request->validate(['alasan' => ['required', 'string', 'max:500']]);

        $permohonan = ($this->rejectPermohonan)($permohonan, $request->input('alasan'));
        $permohonan->load(['user.employee', 'approver.employee', 'attachments']);

        return response()->json(['success' => true, 'message' => 'Ditolak.', 'data' => ($this->format)($permohonan)]);
    }
}

