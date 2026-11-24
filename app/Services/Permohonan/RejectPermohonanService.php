<?php

namespace App\Services\Permohonan;

use App\Models\PermohonanRequest;

class RejectPermohonanService
{
    public function __invoke(PermohonanRequest $permohonan, string $alasan): PermohonanRequest
    {
        $permohonan->update([
            'status' => PermohonanRequest::STATUS_DITOLAK,
            'rejected_at' => now(),
            'rejection_reason' => $alasan,
        ]);

        return $permohonan;
    }
}
