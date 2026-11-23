<?php

use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Pegawai\DataPegawaiController;
use App\Http\Controllers\Profile\AnggotaKeluargaController;
use App\Http\Controllers\Profile\CiriFisikController;
use App\Http\Controllers\Profile\DataPribadiController;
use App\Http\Controllers\Profile\KelolaFileController;
use App\Http\Controllers\Profile\RiwayatPendidikanController;
use App\Livewire\Auth\Login;
use App\Livewire\Dashboard;
use App\Livewire\ModulePage;
use App\Livewire\Pengaturan;
use Illuminate\Support\Facades\Route;

Route::get('/login', Login::class)->middleware('guest')->name('login');

Route::middleware('auth')->group(function () {
    Route::redirect('/', '/dashboard');

    Route::get('/dashboard', Dashboard::class)->name('dashboard');

    Route::get('/pengaturan', Pengaturan::class)->name('pengaturan');

    Route::get('/pengaturan/{panel}', Pengaturan::class)
        ->whereIn('panel', ['bahasa', 'hak-akses', 'absensi-by-foto', 'daftar-hitam-presensi', 'ubah-password'])
        ->middleware('module.access')
        ->name('pengaturan.panel');

    Route::redirect('/modul/ubah-password', '/pengaturan/ubah-password');

    Route::get('/modul/{module}', ModulePage::class)
        ->middleware('module.access')
        ->name('module');

    Route::prefix('api')->name('api.')->group(function () {
        Route::prefix('profil')->name('profil.')->group(function () {
            Route::get('data-pribadi', [DataPribadiController::class, 'show'])->name('data-pribadi.show');
            Route::put('data-pribadi', [DataPribadiController::class, 'update'])->name('data-pribadi.update');
            Route::post('data-pribadi/photo', [DataPribadiController::class, 'uploadPhoto'])->name('data-pribadi.photo');
            Route::get('foto/{employee}', [DataPribadiController::class, 'showPhoto'])->name('foto');

            Route::get('pendidikan', [RiwayatPendidikanController::class, 'show'])->name('pendidikan.show');
            Route::put('pendidikan', [RiwayatPendidikanController::class, 'update'])->name('pendidikan.update');

            Route::get('keluarga', [AnggotaKeluargaController::class, 'show'])->name('keluarga.show');
            Route::put('keluarga', [AnggotaKeluargaController::class, 'update'])->name('keluarga.update');

            Route::get('ciri-fisik', [CiriFisikController::class, 'show'])->name('ciri-fisik.show');
            Route::put('ciri-fisik', [CiriFisikController::class, 'update'])->name('ciri-fisik.update');

            Route::get('dokumen', [KelolaFileController::class, 'index'])->name('dokumen.index');
            Route::post('dokumen', [KelolaFileController::class, 'store'])->name('dokumen.store');
            Route::delete('dokumen/{document}', [KelolaFileController::class, 'destroy'])->name('dokumen.destroy');
            Route::put('dokumen-nomor', [KelolaFileController::class, 'saveNumbers'])->name('dokumen.nomor');
            Route::get('dokumen/{document}/lihat', [KelolaFileController::class, 'show'])->name('dokumen.lihat');
        });

        Route::middleware('module.access:data-pegawai')->group(function () {
            Route::get('data-pegawai', [DataPegawaiController::class, 'index'])->name('data-pegawai.index');
            Route::post('data-pegawai', [DataPegawaiController::class, 'store'])->name('data-pegawai.store');
            Route::post('data-pegawai/import', [DataPegawaiController::class, 'import'])->name('data-pegawai.import');
            Route::get('data-pegawai/export', [DataPegawaiController::class, 'export'])->name('data-pegawai.export');
            Route::put('data-pegawai/{employee}', [DataPegawaiController::class, 'update'])->name('data-pegawai.update');
            Route::delete('data-pegawai/{employee}', [DataPegawaiController::class, 'destroy'])->name('data-pegawai.destroy');
        });
    });

    Route::post('/logout', LogoutController::class)->name('logout');
});
