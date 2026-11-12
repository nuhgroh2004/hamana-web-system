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

    Route::get('/pengaturan', Pengaturan::class)
        ->middleware('module.access:pengaturan')
        ->name('pengaturan');

    Route::get('/modul/{module}', ModulePage::class)
        ->middleware('module.access')
        ->name('module');

    Route::post('/logout', LogoutController::class)->name('logout');
});
