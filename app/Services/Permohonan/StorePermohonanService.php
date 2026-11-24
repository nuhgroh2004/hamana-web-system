<?php

namespace App\Services\Permohonan;

use App\Models\PermohonanRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class StorePermohonanService
{
    public function __invoke(User $user, Request $request): PermohonanRequest
    {
        $formData = $request->input('form_data');
        if (is_string($formData)) {
            $formData = json_decode($formData, true) ?: [];
        }

        $applicantSig = $request->input('signature_applicant');
        if (! $applicantSig && $user->signature) {
            $applicantSig = $user->signature->signature_data;
        }

        return DB::transaction(function () use ($request, $user, $formData, $applicantSig) {
            $permohonan = PermohonanRequest::create([
                'user_id' => $user->id,
                'approver_id' => $request->input('approver_id'),
                'form_type' => $request->input('form_type'),
                'nomor' => $request->input('nomor') ?: ($formData['nomor'] ?? null),
                'status' => $request->input('status', PermohonanRequest::STATUS_DRAFT),
                'tanggal_pengajuan' => $request->input('tanggal_pengajuan') ?: now()->toDateString(),
                'form_data' => $formData,
                'signature_applicant' => $applicantSig,
            ]);

            if ($request->hasFile('lampiran')) {
                foreach ($request->file('lampiran') as $file) {
                    $path = $file->store('permohonan-lampiran', 'public');
                    $permohonan->attachments()->create([
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getClientMimeType(),
                    ]);
                }
            }

            return $permohonan;
        });
    }
}
