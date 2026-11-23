<?php

use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\DataAdmin\FaskesBpjsController;
use App\Http\Controllers\DataAdmin\JabatanController;
use App\Http\Controllers\DataAdmin\ListAdminController;
use App\Http\Controllers\DataAdmin\SatpamController;
use App\Http\Controllers\DataAdmin\TingkatController;
use App\Http\Controllers\Pegawai\DataPegawaiController;
use App\Http\Controllers\Pegawai\WizardPegawaiController;
use App\Http\Controllers\Profile\AnggotaKeluargaController;
use App\Http\Controllers\Profile\CiriFisikController;
use App\Http\Controllers\Profile\DataPribadiController;
use App\Http\Controllers\Profile\KelolaFileController;
use App\Http\Controllers\Profile\RiwayatPendidikanController;
use App\Livewire\Auth\Login;
use App\Livewire\Dashboard;
use App\Livewire\ModulePage;
use App\Livewire\Pengaturan;
use App\Livewire\TambahPegawai;
use Illuminate\Support\Facades\Route;

Route::get('/login', Login::class)->middleware('guest')->name('login');

Route::middleware('auth')->group(function () {
    Route::redirect('/', '/dashboard');

    Route::get('/csrf-token', fn () => response()->json(['token' => csrf_token()]))->name('csrf.token');

    Route::get('/dashboard', Dashboard::class)->name('dashboard');

    Route::get('/pengaturan', Pengaturan::class)->name('pengaturan');

    Route::get('/pengaturan/{panel}', Pengaturan::class)
        ->whereIn('panel', ['bahasa', 'hak-akses', 'absensi-by-foto', 'daftar-hitam-presensi', 'ubah-password'])
        ->middleware('module.access')
        ->name('pengaturan.panel');

    Route::redirect('/modul/ubah-password', '/pengaturan/ubah-password');

    Route::get('/modul/data-pegawai/tambah', TambahPegawai::class)
        ->middleware('module.access:data-pegawai')
        ->name('data-pegawai.tambah');

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

            Route::prefix('data-pegawai/wizard')->name('data-pegawai.wizard.')->group(function () {
                Route::post('/', [WizardPegawaiController::class, 'store'])->name('store');
                Route::get('{employee}', [WizardPegawaiController::class, 'show'])->name('show');
                Route::put('{employee}/data-pribadi', [WizardPegawaiController::class, 'updateDataPribadi'])->name('data-pribadi');
                Route::put('{employee}/pendidikan', [WizardPegawaiController::class, 'updatePendidikan'])->name('pendidikan');
                Route::put('{employee}/keluarga', [WizardPegawaiController::class, 'updateKeluarga'])->name('keluarga');
                Route::put('{employee}/ciri-fisik', [WizardPegawaiController::class, 'updateCiriFisik'])->name('ciri-fisik');
                Route::put('{employee}/nomor-dokumen', [WizardPegawaiController::class, 'updateNomorDokumen'])->name('nomor-dokumen');
                Route::post('{employee}/dokumen', [WizardPegawaiController::class, 'storeDokumen'])->name('dokumen.store');
                Route::delete('{employee}/dokumen/{document}', [WizardPegawaiController::class, 'destroyDokumen'])->name('dokumen.destroy');
            });

            Route::put('data-pegawai/{employee}', [DataPegawaiController::class, 'update'])->name('data-pegawai.update');
            Route::delete('data-pegawai/{employee}', [DataPegawaiController::class, 'destroy'])->name('data-pegawai.destroy');
        });

        Route::prefix('data-admin')->name('data-admin.')->group(function () {
            Route::middleware('module.access:data-admin-tingkat')->group(function () {
                Route::get('tingkat', [TingkatController::class, 'index'])->name('tingkat.index');
                Route::post('tingkat', [TingkatController::class, 'store'])->name('tingkat.store');
                Route::put('tingkat/{level}', [TingkatController::class, 'update'])->name('tingkat.update');
                Route::delete('tingkat/{level}', [TingkatController::class, 'destroy'])->name('tingkat.destroy');
            });

            Route::middleware('module.access:data-admin-jabatan')->group(function () {
                Route::get('jabatan', [JabatanController::class, 'index'])->name('jabatan.index');
                Route::post('jabatan', [JabatanController::class, 'store'])->name('jabatan.store');
                Route::put('jabatan/{jabatan}', [JabatanController::class, 'update'])->name('jabatan.update');
                Route::delete('jabatan/{jabatan}', [JabatanController::class, 'destroy'])->name('jabatan.destroy');
            });

            Route::middleware('module.access:data-admin-faskes-bpjs')->group(function () {
                Route::get('faskes', [FaskesBpjsController::class, 'index'])->name('faskes.index');
                Route::post('faskes', [FaskesBpjsController::class, 'store'])->name('faskes.store');
                Route::post('faskes/import', [FaskesBpjsController::class, 'import'])->name('faskes.import');
                Route::get('faskes/export', [FaskesBpjsController::class, 'export'])->name('faskes.export');
                Route::put('faskes/{faskes}', [FaskesBpjsController::class, 'update'])->name('faskes.update');
                Route::delete('faskes/{faskes}', [FaskesBpjsController::class, 'destroy'])->name('faskes.destroy');
            });

            Route::middleware('module.access:data-admin-list-admin')->group(function () {
                Route::get('admin', [ListAdminController::class, 'index'])->name('admin.index');
                Route::post('admin', [ListAdminController::class, 'store'])->name('admin.store');
                Route::put('admin/{user}', [ListAdminController::class, 'update'])->name('admin.update');
                Route::delete('admin/{user}', [ListAdminController::class, 'destroy'])->name('admin.destroy');
            });
        });

        Route::middleware('module.access:list-satpam')->group(function () {
            Route::get('list-satpam', [SatpamController::class, 'index'])->name('list-satpam.index');
            Route::post('list-satpam', [SatpamController::class, 'store'])->name('list-satpam.store');
            Route::put('list-satpam/{user}', [SatpamController::class, 'update'])->name('list-satpam.update');
            Route::delete('list-satpam/{user}', [SatpamController::class, 'destroy'])->name('list-satpam.destroy');
        });
    });

    Route::post('/logout', LogoutController::class)->name('logout');
});
