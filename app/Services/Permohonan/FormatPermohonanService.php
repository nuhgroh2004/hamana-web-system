<?php

namespace App\Services\Permohonan;

use App\Models\PermohonanRequest;

class FormatPermohonanService
{
    public function __invoke(PermohonanRequest $r): array
    {
        $applicant = $r->user;
        $emp = $applicant?->employee;
        $applicantName = $emp?->nama ?: ($applicant?->name ?: '-');
        $applicantJabatan = $emp?->jabatan ?: ($applicant?->position ?: '-');
        $applicantNik = $emp?->nik ?: ($applicant?->nik ?: '-');

        $approver = $r->approver;
        $approverEmp = $approver?->employee;
        $approverName = $approverEmp?->nama ?: ($approver?->name ?: '-');
        $approverJabatan = $approverEmp?->jabatan ?: ($approver?->position ?: 'Atasan Langsung');

        $formData = $r->form_data ?: [];

        $keperluan = $formData['keperluan']
            ?? $formData['alasan']
            ?? $formData['tujuan']
            ?? $formData['keterangan_lain']
            ?? '-';

        $files = $r->attachments->map(function ($att) {
            return [
                'id' => $att->id,
                'name' => $att->file_name,
                'size' => $att->file_size,
                'url' => $att->url,
                'type' => $att->mime_type,
            ];
        })->values()->toArray();

        $jam = [
            $formData['jam_keluar'] ?? $formData['waktu_mulai'] ?? $formData['jam'] ?? '',
            $formData['jam_masuk'] ?? $formData['waktu_sampai'] ?? '',
        ];

        return [
            'id' => (string) $r->id,
            'form_type' => $r->form_type,
            'jenis' => PermohonanRequest::getFormTitle($r->form_type),
            'nama' => $applicantName,
            'jabatan' => $applicantJabatan,
            'nik' => $applicantNik,
            'tgl' => $r->tanggal_pengajuan ? $r->tanggal_pengajuan->format('Y-m-d') : $r->created_at->format('Y-m-d'),
            'dibuat' => $r->created_at->toISOString(),
            'st' => $r->status,
            'status' => $r->status,
            'kep' => $keperluan,
            'ket' => $keperluan,
            'jam' => $jam,
            'files' => $files,
            'surat' => $formData['surat'] ?? null,
            'alasan' => $r->rejection_reason,
            'ap' => [
                'id' => $approver?->id,
                'n' => $approverName,
                'r' => $approverJabatan,
            ],
            'form_data' => $formData,
            'signature_applicant' => $r->signature_applicant,
            'signature_approver' => $r->signature_approver,
            'approved_at' => $r->approved_at?->toISOString(),
            'rejected_at' => $r->rejected_at?->toISOString(),
        ];
    }
}
