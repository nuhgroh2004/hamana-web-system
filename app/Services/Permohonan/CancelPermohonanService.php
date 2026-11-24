<?php

namespace App\Services\Permohonan;

use App\Models\PermohonanRequest;

class CancelPermohonanService
{
    public function __invoke(PermohonanRequest $permohonan): PermohonanRequest
    {
        $permohonan->update(['status' => PermohonanRequest::STATUS_BATAL]);

        return $permohonan;
    }
}
