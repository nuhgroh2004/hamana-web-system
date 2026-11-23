<?php

namespace App\Services\Profile;

use App\Models\Employee;

class GetDokumenService
{
    /**
     * Return document numbers and uploaded files for the employee.
     */
    public function handle(Employee $employee): array
    {
        $numbers = $employee->documentNumbers()
            ->get()
            ->pluck('nomor', 'kategori')
            ->all();

        $documents = $employee->documents()
            ->get()
            ->map(fn ($document) => [
                'id' => $document->id,
                'cat' => $document->kategori,
                'name' => $document->nama_file,
                'title' => $document->judul,
                'type' => $document->mime_type,
                'size' => $document->ukuran,
                'date' => ($document->diunggah_pada ?? $document->created_at)?->getTimestampMs(),
                'url' => route('api.profil.dokumen.lihat', $document->id),
            ])
            ->all();

        return [
            'nomor' => $numbers,
            'dokumen' => $documents,
        ];
    }
}
