<?php

namespace App\Livewire;

use App\Support\Modules;
use Livewire\Component;

class ModulePage extends Component
{
    public string $slug;

    public string $title;

    public string $active;

    public function mount(?string $module = null): void
    {
        $slug = $module ?: 'dashboard';
        $data = Modules::find($slug);

        abort_unless($data, 404);
        abort_unless(auth()->user()?->canAccess($slug), 403);

        $this->slug = $slug;
        $this->title = $data['label'];
        $this->active = $slug;

        // Halaman ini bisa dibuka dari modul lain (mis. daftar Data Pegawai).
        // Sidebar tetap menyorot modul asal agar pengguna tidak kehilangan konteks.
        $from = (string) request()->query('from', '');

        if ($from !== '' && $from !== $slug && Modules::find($from) && auth()->user()?->canAccess($from)) {
            $this->active = $from;
        }
    }

    public function render()
    {
        // Sebagian modul memakai folder view yang berbeda dari slug-nya.
        $data = Modules::find($this->slug);
        $view = 'hris.'.($data['view'] ?? $this->slug).'.index';

        return view(view()->exists($view) ? $view : 'livewire.module-page')->layout('components.layouts.app', [
            'title' => $this->title,
            'active' => $this->active,
        ]);
    }
}
