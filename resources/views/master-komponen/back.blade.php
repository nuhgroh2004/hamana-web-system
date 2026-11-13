@props(['from' => null])

@php
    $from = $from ?: (string) request()->query('from', '');
    $module = $from !== '' ? \App\Support\Modules::find($from) : null;
    $current = (string) request()->route('module', '');
@endphp

@if ($module && $from !== $current && auth()->user()?->canAccess($from))
    <a class="back" href="{{ route('module', $from) }}" wire:navigate>
        <x-master-komponen::icon name="back" />
        Kembali ke {{ $module['label'] }}
    </a>
@endif
