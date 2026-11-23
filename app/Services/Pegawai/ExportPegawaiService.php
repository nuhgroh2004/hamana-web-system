<?php

namespace App\Services\Pegawai;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Builder;

class ExportPegawaiService
{
    /**
     * Build a CSV export of employees using the active filters.
     */
    public function handle(array $filters): string
    {
        $query = Employee::query();

        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $query->where(function (Builder $query) use ($search) {
                $query->where('nama', 'like', '%'.$search.'%')
                    ->orWhere('nik', 'like', '%'.$search.'%');
            });
        }

        $status = (string) ($filters['status'] ?? 'all');

        if ($status === '1') {
            $query->where('status_pegawai', Employee::STATUS_AKTIF);
        } elseif ($status === '0') {
            $query->where('status_pegawai', Employee::STATUS_TIDAK_AKTIF);
        }

        $stream = fopen('php://temp', 'r+');
        fwrite($stream, "\xEF\xBB\xBF");
        fputcsv($stream, ['No', 'NIK', 'Nama', 'Jabatan', 'Posisi', 'Status']);

        $number = 1;

        foreach ($query->orderBy('nama')->cursor() as $employee) {
            fputcsv($stream, [
                $number++,
                $employee->nik,
                $employee->nama,
                $employee->jabatan,
                $employee->posisi,
                $employee->status_pegawai,
            ]);
        }

        rewind($stream);
        $csv = (string) stream_get_contents($stream);
        fclose($stream);

        return $csv;
    }
}
