<?php

namespace App\Services\Permohonan;

use App\Models\PermohonanRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class GetPermohonanMasukService
{
    public function __construct(private FormatPermohonanService $format) {}

    public function __invoke(User $user, Request $request): array
    {
        $base = PermohonanRequest::query()
            ->where('approver_id', $user->id)
            ->where('status', '!=', PermohonanRequest::STATUS_DRAFT);

        $search = trim((string) $request->input('q', ''));
        if ($search !== '') {
            $base->whereHas('user', function ($uq) use ($search) {
                $uq->where('name', 'like', "%{$search}%")
                    ->orWhereHas('employee', fn ($eq) => $eq->where('nama', 'like', "%{$search}%"));
            });
        }

        $dayPage = max(1, (int) $request->input('day_page', 1));
        $useDayPagination = ! $request->filled('date') && ! $request->filled('month') && ! $request->filled('year');

        if ($request->filled('date')) {
            $targetDate = Carbon::parse($request->input('date'))->startOfDay();
            $base->whereDate('tanggal_pengajuan', $targetDate->toDateString());
        } elseif ($useDayPagination) {
            $targetDate = Carbon::today()->subDays($dayPage - 1);
            $base->whereDate('tanggal_pengajuan', $targetDate->toDateString());
        } else {
            $targetDate = null;
            if ($request->filled('month')) {
                $base->whereMonth('tanggal_pengajuan', (int) $request->input('month') + 1);
            }
            if ($request->filled('year')) {
                $base->whereYear('tanggal_pengajuan', (int) $request->input('year'));
            }
        }

        $statusCounts = (clone $base)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $counts = [
            'all' => (int) $statusCounts->sum(),
            'menunggu' => (int) ($statusCounts[PermohonanRequest::STATUS_MENUNGGU] ?? 0),
            'disetujui' => (int) ($statusCounts[PermohonanRequest::STATUS_DISETUJUI] ?? 0),
            'ditolak' => (int) ($statusCounts[PermohonanRequest::STATUS_DITOLAK] ?? 0),
        ];

        $query = clone $base;
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $items = $query
            ->with(['user.employee', 'approver.employee', 'attachments'])
            ->latest()
            ->get()
            ->map($this->format)
            ->values();

        $totalPages = 1;
        if ($useDayPagination) {
            $oldest = PermohonanRequest::query()
                ->where('approver_id', $user->id)
                ->where('status', '!=', PermohonanRequest::STATUS_DRAFT)
                ->min('tanggal_pengajuan');

            $days = $oldest
                ? Carbon::parse($oldest)->startOfDay()->diffInDays(Carbon::today()) + 1
                : 1;
            $totalPages = max($dayPage, (int) $days, 4);
        }

        $label = $targetDate
            ? ($targetDate->isToday()
                ? 'Hari ini'
                : ($targetDate->isYesterday() ? 'Kemarin' : $targetDate->translatedFormat('d M Y')))
            : 'Filter';

        return [
            'items' => $items,
            'meta' => [
                'day_page' => $dayPage,
                'use_day_pagination' => $useDayPagination,
                'target_date' => $targetDate?->toDateString(),
                'target_label' => $label,
                'total_pages' => $totalPages,
                'counts' => $counts,
            ],
        ];
    }
}
