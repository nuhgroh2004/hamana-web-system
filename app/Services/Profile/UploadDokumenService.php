<?php

namespace App\Services\Profile;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadDokumenService
{
    /**
     * Store an uploaded employee document.
     */
    public function handle(
        Employee $employee,
        UploadedFile $file,
        string $kategori,
        ?string $judul = null,
        ?string $nomor = null,
    ): array {
        if ($this->isMainCategory($kategori)) {
            $this->removeExisting($employee, $kategori);
        }

        $extension = $file->getClientOriginalExtension() ?: $file->extension() ?: 'bin';
        $filename = Str::uuid()->toString().'.'.mb_strtolower($extension);
        $path = $file->storeAs('employee-documents/'.$employee->id, $filename, 'local');

        $document = $employee->documents()->create([
            'kategori' => $kategori,
            'judul' => $this->value($judul),
            'nama_file' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'ukuran' => $file->getSize(),
            'diunggah_pada' => now(),
        ]);

        if ($this->isMainCategory($kategori) && $this->value($nomor) !== null) {
            $employee->documentNumbers()->updateOrCreate(
                ['kategori' => $kategori],
                ['nomor' => $this->value($nomor)],
            );
        }

        return [
            'id' => $document->id,
            'cat' => $document->kategori,
            'name' => $document->nama_file,
            'title' => $document->judul,
            'type' => $document->mime_type,
            'size' => $document->ukuran,
            'date' => $document->diunggah_pada?->getTimestampMs(),
            'url' => route('api.profil.dokumen.lihat', $document->id),
        ];
    }

    /**
     * Remove an existing document for a single-file category.
     */
    private function removeExisting(Employee $employee, string $kategori): void
    {
        $employee->documents()
            ->where('kategori', $kategori)
            ->get()
            ->each(function (EmployeeDocument $document) {
                Storage::disk('local')->delete($document->path);
                $document->delete();
            });
    }

    /**
     * Whether the category only allows one document.
     */
    private function isMainCategory(string $kategori): bool
    {
        return in_array($kategori, EmployeeDocument::MAIN_CATEGORIES, true);
    }

    /**
     * Normalize an optional text value.
     */
    private function value(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
