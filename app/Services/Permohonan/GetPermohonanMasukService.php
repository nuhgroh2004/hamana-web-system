<?php

namespace App\Services\Permohonan;

use App\Models\PermohonanRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class GetPermohonanMasukService
{
    public function __construct(private FormatPermohonanService $format) {}

    public function __invoke(User $user, Request $request): Collection
    {
        $query = PermohonanRequest::with(['user.employee', 'approver.employee', 'attachments'])
            ->where('approver_id', $user->id)
            ->where('status', '!=', PermohonanRequest::STATUS_DRAFT);

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->whereHas('user', function ($uq) use ($q) {
                $uq->where('name', 'like', "%{$q}%")
                    ->orWhereHas('employee', fn ($eq) => $eq->where('nama', 'like', "%{$q}%"));
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('tanggal_pengajuan', $request->input('date'));
        }

        if ($request->filled('month')) {
            $query->whereMonth('tanggal_pengajuan', (int) $request->input('month') + 1);
        }

        if ($request->filled('year')) {
            $query->whereYear('tanggal_pengajuan', (int) $request->input('year'));
        }

        return $query->latest()->get()->map($this->format);
    }
}
