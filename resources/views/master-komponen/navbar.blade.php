@props(['title' => 'Hamana'])

<header>
    <button class="ib" id="menu" aria-label="Buka/tutup sidebar" aria-expanded="true">
        <svg class="i" viewBox="0 0 16 16"><path d="M2 4h12M2 8h12M2 12h12"/></svg>
    </button>
    <img class="logo" src="{{ asset('assets/logo-hamana-works.svg') }}" alt="Hamana Works">
    <h1>{{ $title }}</h1>
    <div class="sp"></div>
    <button class="ib dot" id="bell" aria-label="Notifikasi">
        <svg class="i" viewBox="0 0 16 16"><path d="M3 11V7a5 5 0 0110 0v4l1 2H2zM6.5 14.5h3"/></svg>
    </button>
    <svg class="avatar" id="av1" width="40" height="40" viewBox="0 0 5 5" aria-hidden="true"></svg>
</header>
