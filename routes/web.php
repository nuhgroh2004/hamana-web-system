<?php

use App\Http\Controllers\Auth\LogoutController;
use App\Livewire\Auth\Login;
use App\Livewire\Dashboard;
use App\Livewire\ModulePage;
use App\Livewire\Pengaturan;
use Illuminate\Support\Facades\Route;

Route::get('/login', Login::class)->middleware('guest')->name('login');

Route::middleware('auth')->group(function () {
    Route::redirect('/', '/dashboard');

    Route::get('/dashboard', Dashboard::class)->name('dashboard');

    Route::redirect('/pengaturan', '/pengaturan/bahasa')->name('pengaturan');

    Route::get('/pengaturan/{panel}', Pengaturan::class)
        ->whereIn('panel', ['bahasa', 'hak-akses-admin', 'absensi-by-foto', 'daftar-hitam-presensi', 'ubah-password'])
        ->middleware('module.access:pengaturan')
        ->name('pengaturan.panel');

    Route::redirect('/modul/ubah-password', '/pengaturan/ubah-password');

    Route::get('/modul/{module}', ModulePage::class)
        ->middleware('module.access')
        ->name('module');

    Route::post('/logout', LogoutController::class)->name('logout');
});
