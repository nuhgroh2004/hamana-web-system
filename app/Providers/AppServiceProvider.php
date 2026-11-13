<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::anonymousComponentPath(resource_path('views/master-komponen'), 'master-komponen');

        // Navigasi SPA Livewire (wire:navigate) menyalin ulang seluruh elemen
        // <head> yang bukan stylesheet/script, termasuk <link rel="preload">
        // dari Vite. Setelah halaman pertama, preload tersebut ditambahkan
        // saat aset sudah terpakai sehingga Chrome memunculkan peringatan
        // "preloaded using link preload but not used". Preload di sini
        // redundan karena tag stylesheet/script sudah dimuat langsung,
        // jadi matikan agar konsol tetap bersih.
        Vite::usePreloadTagAttributes(false);
    }
}
