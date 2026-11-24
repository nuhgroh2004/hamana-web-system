<?php

namespace App\Services\Permohonan;

use App\Models\PermohonanRequest;
use Illuminate\Support\Facades\Storage;

class DeleteDraftService
{
    public function __invoke(PermohonanRequest $permohonan): void
    {
        foreach ($permohonan->attachments as $att) {
            Storage::disk('public')->delete($att->file_path);
        }

        $permohonan->delete();
    }
}
