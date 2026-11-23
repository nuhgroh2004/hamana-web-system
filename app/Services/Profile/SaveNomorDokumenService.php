<?php

namespace App\Services\Profile;

use App\Models\Employee;
use App\Models\EmployeeDocument;

class SaveNomorDokumenService
{
    /**
     * Save the document numbers for KK, KTP, and NPWP.
     */
    public function handle(Employee $employee, array $numbers): array
    {
        foreach ($numbers as $kategori => $nomor) {
            if (! in_array($kategori, EmployeeDocument::MAIN_CATEGORIES, true)) {
                continue;
            }

            $nomor = trim((string) $nomor);

            if ($nomor === '') {
                $employee->documentNumbers()->where('kategori', $kategori)->delete();

                continue;
            }

            $employee->documentNumbers()->updateOrCreate(
                ['kategori' => $kategori],
                ['nomor' => $nomor],
            );
        }

        return $employee->documentNumbers()
            ->get()
            ->pluck('nomor', 'kategori')
            ->all();
    }
}
