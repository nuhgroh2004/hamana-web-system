<?php

namespace App\Services\Permohonan;

use App\Models\PermohonanRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class GeneratePermohonanPdfService
{
    public function __construct(private FormatPermohonanService $format) {}

    public function __invoke(PermohonanRequest $permohonan): Response
    {
        $permohonan->load(['user.employee', 'approver.employee', 'attachments']);
        $data = ($this->format)($permohonan);

        $logoPath = public_path('assets/logo-hamana-forms.png');
        $logo = is_file($logoPath)
            ? 'data:image/png;base64,'.base64_encode((string) file_get_contents($logoPath))
            : null;

        $filename = Str::slug(($data['jenis'] ?? 'permohonan').'-'.($data['nama'] ?? $permohonan->id)).'.pdf';

        return Pdf::loadView('permohonan.pdf', [
            'r' => $data,
            'logo' => $logo,
        ])
            ->setPaper('a4', 'portrait')
            ->stream($filename);
    }
}
