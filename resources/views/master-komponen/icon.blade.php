@props(['name' => null])

@php
    $paths = [
        'dash' => '<rect x="2" y="2" width="5" height="6"/><rect x="9" y="2" width="5" height="3"/><rect x="2" y="10" width="5" height="4"/><rect x="9" y="7" width="5" height="7"/>',
        'req' => '<path d="M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3M5.5 8h5M5.5 11h5"/>',
        'clock' => '<circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/>',
        'edit' => '<path d="M2 14l1-3.5 8-8 2.5 2.5-8 8zM9.5 4l2.5 2.5"/>',
        'money' => '<rect x="1.5" y="4" width="13" height="8" rx="1"/><circle cx="8" cy="8" r="1.8"/>',
        'book' => '<path d="M2 2.5h4.5A1.5 1.5 0 018 4v10a1.5 1.5 0 00-1.5-1.5H2zM14 2.5H9.5A1.5 1.5 0 008 4v10a1.5 1.5 0 011.5-1.5H14z"/>',
        'user' => '<circle cx="8" cy="5" r="3"/><path d="M2.5 14c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5z"/>',
        'msg' => '<path d="M2 2h12v9H8l-3 3v-3H2zM8 4.5v3M8 9v.2"/>',
        'inbox' => '<path d="M2 9l2-6h8l2 6v4H2zM2 9h4l1 2h2l1-2h4"/>',
        'users' => '<circle cx="6" cy="5" r="2.5"/><path d="M1.5 14c0-3 2-4.5 4.5-4.5s4.5 1.5 4.5 4.5zM10.5 3a2.5 2.5 0 010 4.5M12 9.8c1.6.4 2.5 1.7 2.5 4.2"/>',
        'folder' => '<path d="M1.5 3.5h4l1.5 1.5h7.5v8h-13z"/>',
        'brief' => '<rect x="1.5" y="5" width="13" height="8.5" rx="1"/><path d="M5.5 5V3h5v2M1.5 9h13"/>',
        'shield' => '<path d="M8 1.5l5.5 2v4.5c0 3-2.5 5-5.5 6.5C5 13 2.5 11 2.5 8V3.5z"/><path d="M8 5v4"/>',
        'pen' => '<path d="M2 14.5h12M3 11l7.5-7.5 2 2L5 13H3z"/>',
        'lock' => '<rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 016 0v2"/>',
        'db' => '<ellipse cx="8" cy="4" rx="5.5" ry="2"/><path d="M2.5 4v8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2V4M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2"/>',
        'swap' => '<path d="M2 5h11l-3-3M14 11H3l3 3"/>',
        'calc' => '<rect x="3" y="1.5" width="10" height="13" rx="1.5"/><path d="M5.5 4.5h5M5.5 8h1M9.5 8h1M5.5 11h1M9.5 11h1"/>',
        'chart' => '<path d="M2 14V2M2 14h12M5 11V8M8.5 11V5M12 11V7"/>',
        'gear' => '<g transform="scale(.6667)" stroke-width="2.4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></g>',
        'down' => '<path d="M4 6l4 4 4-4"/>',
        'globe' => '<circle cx="8" cy="8" r="6.2"/><path d="M1.8 8h12.4M8 1.8c-2.4 2.6-2.4 9.8 0 12.4M8 1.8c2.4 2.6 2.4 9.8 0 12.4"/>',
        'camera' => '<path d="M2 5h2.5l1-1.5h5L11.5 5H14v8H2z"/><circle cx="8" cy="9" r="2.2"/>',
        'ban' => '<circle cx="8" cy="8" r="6"/><path d="M3.8 12.2l8.4-8.4"/>',
        'search' => '<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/>',
        'check' => '<path d="M3 8.5l3.5 3.5L13 4.5"/>',
        'info' => '<circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4M8 5v.1"/>',
    ];
@endphp

@if ($name && isset($paths[$name]))
    <svg {{ $attributes->merge(['class' => 'i']) }} viewBox="0 0 16 16" aria-hidden="true">{!! $paths[$name] !!}</svg>
@endif
