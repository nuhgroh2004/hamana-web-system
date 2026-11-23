<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Services\Employee\ResolveEmployeeService;
use App\Services\Profile\GetAnggotaKeluargaService;
use App\Services\Profile\SaveAnggotaKeluargaService;
use Illuminate\Http\Request;

class AnggotaKeluargaController extends Controller
{
    public function show(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        GetAnggotaKeluargaService $getAnggotaKeluarga,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        return response()->json([
            'items' => $getAnggotaKeluarga->handle($employee),
        ]);
    }

    public function update(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        SaveAnggotaKeluargaService $saveAnggotaKeluarga,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        $data = $request->validate([
            'items' => ['present', 'array'],
            'items.*.hubungan' => ['required', 'string', 'in:AYAH,IBU,SAUDARA,SUAMI,ISTRI,ANAK'],
            'items.*.urutan' => ['nullable', 'integer', 'min:1', 'max:100'],
            'items.*.nama' => ['nullable', 'string', 'max:255'],
            'items.*.usia' => ['nullable', 'integer', 'min:0', 'max:150'],
            'items.*.pekerjaan' => ['nullable', 'string', 'max:255'],
            'items.*.aktif' => ['boolean'],
        ]);

        return response()->json([
            'items' => $saveAnggotaKeluarga->handle($employee, $data['items']),
        ]);
    }
}
