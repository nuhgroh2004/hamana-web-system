<?php

namespace App\Services\Profile;

use App\Models\Employee;
use Illuminate\Support\Facades\DB;

class SaveAnggotaKeluargaService
{
    /**
     * Replace the employee's family members with the submitted rows.
     */
    public function handle(Employee $employee, array $items): array
    {
        return DB::transaction(function () use ($employee, $items) {
            $employee->familyMembers()->delete();

            foreach ($items as $index => $item) {
                $employee->familyMembers()->create([
                    'hubungan' => ($item['hubungan'] ?? null) ?: 'AYAH',
                    'urutan' => (int) ($item['urutan'] ?? $index + 1),
                    'nama' => $this->value($item['nama'] ?? null),
                    'usia' => $this->age($item['usia'] ?? null),
                    'pekerjaan' => $this->value($item['pekerjaan'] ?? null),
                    'aktif' => (bool) ($item['aktif'] ?? true),
                ]);
            }

            return $employee->familyMembers()->get()
                ->map(fn ($member) => [
                    'id' => $member->id,
                    'hubungan' => $member->hubungan,
                    'urutan' => $member->urutan,
                    'nama' => $member->nama,
                    'usia' => $member->usia,
                    'pekerjaan' => $member->pekerjaan,
                    'aktif' => (bool) $member->aktif,
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

    /**
     * Normalize an optional age value.
     */
    private function age(mixed $value): ?int
    {
        return $value !== null && $value !== '' ? (int) $value : null;
    }
}
