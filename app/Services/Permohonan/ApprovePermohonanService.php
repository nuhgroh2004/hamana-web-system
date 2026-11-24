<?php

namespace App\Services\Permohonan;

use App\Models\PermohonanRequest;
use App\Models\User;

class ApprovePermohonanService
{
    public function __invoke(PermohonanRequest $permohonan, User $approver): PermohonanRequest
    {
        $permohonan->update([
            'status' => PermohonanRequest::STATUS_DISETUJUI,
            'approved_at' => now(),
            'signature_approver' => $approver->signature?->signature_data,
        ]);

        return $permohonan;
    }
}
