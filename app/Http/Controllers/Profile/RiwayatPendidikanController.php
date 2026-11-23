<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Services\Employee\ResolveEmployeeService;
use App\Services\Profile\GetRiwayatPendidikanService;
use App\Services\Profile\SaveRiwayatPendidikanService;
use Illuminate\Http\Request;

class RiwayatPendidikanController extends Controller
{
    public function show(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        GetRiwayatPendidikanService $getRiwayatPendidikan,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        return response()->json([
            'items' => $getRiwayatPendidikan->handle($employee),
        ]);
    }

    public function update(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        SaveRiwayatPendidikanService $saveRiwayatPendidikan,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        $data = $request->validate([
            'items' => ['present', 'array'],
            'items.*.jenjang' => ['required', 'string', 'max:30'],
            'items.*.nama_sekolah' => ['nullable', 'string', 'max:255'],
            'items.*.jurusan' => ['nullable', 'string', 'max:255'],
            'items.*.tahun' => ['nullable', 'string', 'max:10'],
            'items.*.aktif' => ['boolean'],
        ]);

        return response()->json([
            'items' => $saveRiwayatPendidikan->handle($employee, $data['items']),
        ]);
    }
}
