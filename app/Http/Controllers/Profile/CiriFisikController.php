<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Services\Employee\ResolveEmployeeService;
use App\Services\Profile\GetCiriFisikService;
use App\Services\Profile\SaveCiriFisikService;
use Illuminate\Http\Request;

class CiriFisikController extends Controller
{
    public function show(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        GetCiriFisikService $getCiriFisik,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        return response()->json($getCiriFisik->handle($employee));
    }

    public function update(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        SaveCiriFisikService $saveCiriFisik,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        $data = $request->validate([
            'warna_kulit' => ['nullable', 'string', 'max:255'],
            'golongan_darah' => ['nullable', 'string', 'max:5'],
            'warna_rambut' => ['nullable', 'string', 'max:255'],
            'ukuran_baju' => ['nullable', 'string', 'max:20'],
            'warna_mata' => ['nullable', 'string', 'max:255'],
            'ukuran_celana' => ['nullable', 'string', 'max:20'],
            'tinggi_badan' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'ukuran_sepatu' => ['nullable', 'string', 'max:20'],
            'berat_badan' => ['nullable', 'numeric', 'min:0', 'max:500'],
        ]);

        return response()->json($saveCiriFisik->handle($employee, $data));
    }
}
