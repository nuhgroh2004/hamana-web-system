<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use App\Services\Employee\AuthorizeEmployeeAccessService;
use App\Services\Employee\ResolveEmployeeService;
use App\Services\Pegawai\CreateUserFromEmployeeProfileService;
use App\Services\Profile\GetDataPribadiService;
use App\Services\Profile\GetFotoProfilService;
use App\Services\Profile\SaveDataPribadiService;
use App\Services\Profile\SaveFotoProfilService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DataPribadiController extends Controller
{
    public function show(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        GetDataPribadiService $getDataPribadi,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        return response()->json($getDataPribadi->handle($employee));
    }

    public function update(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        SaveDataPribadiService $saveDataPribadi,
        CreateUserFromEmployeeProfileService $syncUser,
        GetDataPribadiService $getDataPribadi,
    ) {
        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        $data = $request->validate([
            'nik' => ['required', 'string', 'max:30', Rule::unique('employees', 'nik')->ignore($employee->id)],
            'nama' => ['required', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'in:Laki-Laki,Perempuan'],
            'tempat_lahir' => ['required', 'string', 'max:255'],
            'tgl_lahir' => ['required', 'date'],
            'agama' => ['nullable', 'string', 'max:50'],
            'status_nikah' => ['required', 'string', 'max:30'],
            'jml_anak' => ['nullable', 'integer', 'min:0', 'max:50'],
            'jabatan' => ['required', 'string', 'max:255'],
            'status_pegawai' => ['required', 'string', 'in:Aktif,Tidak Aktif'],
            'departemen' => ['required', 'string', 'max:255'],
            'posisi' => ['required', 'string', 'max:255'],
            'tgl_gabung' => ['required', 'date'],
            'email' => ['required', 'email', 'max:255'],
            'hp1' => ['required', 'string', 'max:30'],
            'hp2' => ['nullable', 'string', 'max:30'],
            'alamat_ktp' => ['required', 'string', 'max:2000'],
            'alamat_dom' => ['nullable', 'string', 'max:2000'],
            'rumah' => ['nullable', 'string', 'max:50'],
            'ktp' => ['required', 'string', 'max:30'],
            'passport' => ['nullable', 'string', 'max:30'],
            'npwp' => ['nullable', 'string', 'max:30'],
            'bpjs_tk' => ['nullable', 'string', 'max:30'],
            'bpjs_kes' => ['nullable', 'string', 'max:30'],
            'rek_mandiri' => ['nullable', 'string', 'max:50'],
            'faskes_terpilih' => ['boolean'],
            'faskes_provinsi' => ['nullable', 'string', 'max:255'],
            'faskes_kantor_regional' => ['nullable', 'string', 'max:255'],
            'faskes_kantor_cabang' => ['nullable', 'string', 'max:255'],
            'faskes_kabupaten_kota' => ['nullable', 'string', 'max:255'],
            'faskes_kode_ppk' => ['nullable', 'string', 'max:30'],
            'faskes_nama_ppk' => ['nullable', 'string', 'max:255'],
            'faskes_alamat_ppk' => ['nullable', 'string', 'max:255'],
            'faskes_telp_ppk' => ['nullable', 'string', 'max:30'],
            'code_pajak' => ['nullable', 'string', 'max:20'],
            'code_nikah' => ['nullable', 'string', 'max:20'],
            'code_status' => ['nullable', 'string', 'max:20'],
            'dr_nama1' => ['nullable', 'string', 'max:255'],
            'dr_telp1' => ['nullable', 'string', 'max:30'],
            'dr_hub1' => ['nullable', 'string', 'max:255'],
            'dr_nama2' => ['nullable', 'string', 'max:255'],
            'dr_telp2' => ['nullable', 'string', 'max:30'],
            'dr_hub2' => ['nullable', 'string', 'max:255'],
            'facebook' => ['nullable', 'string', 'max:255'],
            'instagram' => ['nullable', 'string', 'max:255'],
            'twitter' => ['nullable', 'string', 'max:255'],
        ]);

        $employee = DB::transaction(function () use ($employee, $data, $saveDataPribadi, $syncUser) {
            $employee = $saveDataPribadi->handle($employee, $data);

            if ($employee->user?->role === User::ROLE_KARYAWAN) {
                $status = $syncUser->handle($employee);

                if ($status !== CreateUserFromEmployeeProfileService::ALREADY_LINKED) {
                    throw ValidationException::withMessages([
                        'email' => 'Email/NIK pegawai sudah digunakan akun lain.',
                    ]);
                }
            }

            return $employee;
        });

        return response()->json($getDataPribadi->handle($employee));
    }

    public function uploadPhoto(
        Request $request,
        ResolveEmployeeService $resolveEmployee,
        SaveFotoProfilService $saveFotoProfil,
    ) {
        $request->validate([
            'photo' => ['required', 'image', 'max:5120'],
        ]);

        $employee = $resolveEmployee->handle($request->user(), $request->query('nik'));

        $saveFotoProfil->handle($employee, $request->file('photo'));

        return response()->json([
            'photo_url' => route('api.profil.foto', [
                'employee' => $employee->id,
                'v' => now()->timestamp,
            ]),
        ]);
    }

    public function showPhoto(
        Request $request,
        Employee $employee,
        AuthorizeEmployeeAccessService $authorizeEmployeeAccess,
        GetFotoProfilService $getFotoProfil,
    ) {
        $authorizeEmployeeAccess->handle($request->user(), $employee);

        return response()->file($getFotoProfil->handle($employee));
    }
}
