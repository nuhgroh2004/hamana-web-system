<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'page-awal')->name('home');

Route::view('/pengaturan', 'pengaturan.index')->name('pengaturan');
