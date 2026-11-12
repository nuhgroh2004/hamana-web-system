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
        $this->active = $data['label'];
    }

    public function render()
    {
        return view('livewire.module-page')->layout('components.layouts.app', [
            'title' => $this->title,
            'active' => $this->active,
        ]);
    }
}
