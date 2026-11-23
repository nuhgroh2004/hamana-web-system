<?php

namespace App\Services\Profile;

use App\Models\Employee;
use Illuminate\Support\Facades\DB;

class SaveRiwayatPendidikanService
{
    /**
     * Replace the employee's education history with the submitted rows.
     */
    public function handle(Employee $employee, array $items): array
    {
        return DB::transaction(function () use ($employee, $items) {
            $employee->educations()->delete();

            foreach ($items as $item) {
                $employee->educations()->create([
                    'jenjang' => $item['jenjang'],
                    'nama_sekolah' => $this->value($item['nama_sekolah'] ?? null),
                    'jurusan' => $this->value($item['jurusan'] ?? null),
                    'tahun' => $this->value($item['tahun'] ?? null),
                    'aktif' => (bool) ($item['aktif'] ?? true),
                ]);
            }

            return $employee->educations()->get()
                ->map(fn ($education) => [
                    'id' => $education->id,
                    'jenjang' => $education->jenjang,
                    'nama_sekolah' => $education->nama_sekolah,
                    'jurusan' => $education->jurusan,
                    'tahun' => $education->tahun,
                    'aktif' => (bool) $education->aktif,
                ])
                ->all();
        });
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
