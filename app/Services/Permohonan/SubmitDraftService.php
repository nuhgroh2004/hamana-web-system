<?php

namespace App\Services\Permohonan;

use App\Models\PermohonanRequest;
use App\Models\User;
use Illuminate\Http\Request;

class SubmitDraftService
{
    public function __invoke(PermohonanRequest $permohonan, User $user, int $approverId): PermohonanRequest
    {
        $applicantSig = $permohonan->signature_applicant ?: $user->signature?->signature_data;

        $permohonan->update([
            'status' => PermohonanRequest::STATUS_MENUNGGU,
            'approver_id' => $approverId,
            'signature_applicant' => $applicantSig,
            'tanggal_pengajuan' => now()->toDateString(),
        ]);

        return $permohonan;
    }
}
