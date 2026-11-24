<?php

namespace App\Services\Permohonan;

use App\Models\PermohonanRequest;
use App\Models\User;
use Illuminate\Support\Collection;

class GetPermohonanSayaService
{
    public function __construct(private FormatPermohonanService $format) {}

    public function __invoke(User $user): Collection
    {
        return PermohonanRequest::with(['approver.employee', 'user.employee', 'attachments'])
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map($this->format);
    }
}
