<?php

use App\Livewire\Dashboard;
use App\Livewire\ModulePage;
use App\Livewire\Pengaturan;
use Illuminate\Support\Facades\Route;

Route::get('/', Dashboard::class)->name('home');

Route::get('/pengaturan', Pengaturan::class)->name('pengaturan');

Route::get('/modul/{module}', ModulePage::class)->name('module');
