@props(['title' => 'Hamana', 'main' => '', 'active' => null])

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title }}</title>

    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
    <script src="{{ mix('js/app.js') }}" defer></script>
    @livewireStyles
</head>
<body>
    <x-master-komponen::navbar :title="$title" />

    <div class="shell">
        <div class="bd" id="bd"></div>
        <x-master-komponen::sidebar :active="$active" />

        <main id="main" class="{{ $main }}">
            {{ $slot }}
        </main>
    </div>

    @livewireScripts

    {{-- Offline / disconnected indicator --}}
    <div id="lw-offline" aria-live="assertive" style="
        display:none;position:fixed;bottom:1rem;right:1rem;z-index:99999;
        background:#1e1e2e;color:#fff;padding:.6rem 1.1rem;border-radius:.5rem;
        font-size:.85rem;box-shadow:0 4px 16px rgba(0,0,0,.35);
        display:flex;align-items:center;gap:.5rem;
    ">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11v.5"/></svg>
        <span>Koneksi terputus&hellip; menyambung kembali</span>
    </div>

    <script>
        (function () {
            var banner = document.getElementById('lw-offline');

            // ── Livewire 3 koneksi/disconnect indicator ───────────────────────
            document.addEventListener('livewire:connection-failed', function () {
                if (banner) banner.style.display = 'flex';
            });
            document.addEventListener('livewire:reconnected', function () {
                if (banner) banner.style.display = 'none';
            });

            // ── Tangkap sesi habis dari Livewire XHR ─────────────────────────
            // Livewire 3 mengirim XHR ke /livewire/update. Jika sesi expired,
            // server redirect (302) ke /login dan Livewire mendapat HTML bukan
            // JSON → component beku. Hook ini mendeteksi kondisi tersebut dan
            // mengarahkan pengguna ke halaman login.
            document.addEventListener('livewire:init', function () {
                if (typeof Livewire === 'undefined') return;

                Livewire.hook('request', function ({ fail }) {
                    fail(function ({ status, preventDefault }) {
                        // 401 = Unauthenticated (sesi habis di Laravel)
                        if (status === 401) {
                            preventDefault();
                            window.location.href = '/login';
                            return;
                        }

                        // 419 = CSRF mismatch — cegah popup "This page has expired",
                        // refresh otomatis halaman agar sesi & token kembali sinkron.
                        if (status === 419) {
                            preventDefault();
                            window.location.reload();
                        }
                    });
                });
            });

            // ── Refresh CSRF + clear cache setiap Livewire navigasi ──────────
            document.addEventListener('livewire:navigated', function () {
                fetch('/csrf-token', {
                    credentials: 'same-origin',
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                }).then(function (r) {
                    // Jika server redirect ke /login (sesi habis), reload halaman
                    // agar user diarahkan ke login secara bersih.
                    if (r.redirected || !r.ok) {
                        window.location.href = '/login';
                        return null;
                    }
                    return r.json();
                }).then(function (data) {
                    if (!data || !data.token) return;
                    var meta = document.querySelector('meta[name="csrf-token"]');
                    if (meta) meta.setAttribute('content', data.token);
                    if (window.axios) window.axios.defaults.headers.common['X-CSRF-TOKEN'] = data.token;
                }).catch(function () { /* silent – interceptor handles 419 */ });

                // Bersihkan cache PermohonanAPI agar data user tidak basi.
                if (window.PermohonanAPI && typeof window.PermohonanAPI.clearCache === 'function') {
                    window.PermohonanAPI.clearCache();
                }
            });

            // ── Keep-alive: ping /csrf-token setiap 10 menit ─────────────────
            // Ini menjaga sesi tetap aktif selama tab terbuka, sehingga sesi
            // tidak kedaluwarsa meski pengguna meninggalkan halaman tanpa interaksi.
            var KEEP_ALIVE_MS = 10 * 60 * 1000; // 10 menit
            function keepAlive() {
                fetch('/csrf-token', {
                    credentials: 'same-origin',
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                }).then(function (r) {
                    return r.ok && !r.redirected ? r.json() : null;
                }).then(function (data) {
                    if (!data || !data.token) return;
                    var meta = document.querySelector('meta[name="csrf-token"]');
                    if (meta) meta.setAttribute('content', data.token);
                    if (window.axios) window.axios.defaults.headers.common['X-CSRF-TOKEN'] = data.token;
                }).catch(function () {});
            }
            setInterval(keepAlive, KEEP_ALIVE_MS);
        })();
    </script>
</body>
</html>
