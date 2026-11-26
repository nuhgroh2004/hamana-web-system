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
        align-items:center;gap:.5rem;
    ">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11v.5"/></svg>
        <span>Koneksi terputus&hellip; menyambung kembali</span>
    </div>

    <script>
        (function () {
            var banner = document.getElementById('lw-offline');
            if (!banner) return;

            var HEALTH_CHECK_MS = 5000;
            var healthTimer = null;

            function setCsrfToken(token) {
                if (!token) return;
                var meta = document.querySelector('meta[name="csrf-token"]');
                if (meta) meta.setAttribute('content', token);
                if (window.axios) window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
            }

            // Ping ringan ke server. Dipakai untuk memastikan koneksi benar-benar
            // pulih sebelum banner disembunyikan — event `online` dari browser
            // saja tidak cukup (jaringan bisa tersambung tapi server tak terjangkau).
            function pingServer() {
                return fetch('/csrf-token', {
                    credentials: 'same-origin',
                    cache: 'no-store',
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                }).then(function (r) {
                    if (!r.ok || r.redirected) throw new Error('unreachable');
                    return r.json();
                }).then(function (data) {
                    if (!data || !data.token) throw new Error('invalid token');
                    setCsrfToken(data.token);
                    hideBanner();
                    return true;
                });
            }

            function startHealthCheck() {
                if (healthTimer !== null) return;
                healthTimer = setInterval(function () {
                    pingServer().catch(function () { /* masih terputus, coba lagi */ });
                }, HEALTH_CHECK_MS);
            }

            function stopHealthCheck() {
                if (healthTimer === null) return;
                clearInterval(healthTimer);
                healthTimer = null;
            }

            function showBanner() {
                banner.style.display = 'flex';
                startHealthCheck();
            }

            function hideBanner() {
                banner.style.display = 'none';
                stopHealthCheck();
            }

            // ── Indikator koneksi browser ─────────────────────────────────────
            if (navigator.onLine === false) showBanner();
            window.addEventListener('offline', showBanner);
            window.addEventListener('online', function () {
                // Verifikasi ke server dulu; banner baru hilang jika ping sukses.
                pingServer().catch(function () {});
            });

            // ── Tangkap sesi habis & kegagalan koneksi dari Livewire XHR ──────
            // Livewire 3 mengirim XHR ke /livewire/update. Jika sesi expired,
            // server redirect (302) ke /login dan Livewire mendapat HTML bukan
            // JSON → component beku. Hook ini mendeteksi kondisi tersebut dan
            // mengarahkan pengguna ke halaman login.
            document.addEventListener('livewire:init', function () {
                if (typeof Livewire === 'undefined') return;

                Livewire.hook('request', function ({ fail, succeed }) {
                    fail(function ({ status, content, preventDefault }) {
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
                            return;
                        }

                        // fetch gagal total (internet putus / server tak terjangkau)
                        // dilaporkan Livewire sebagai 503 dengan content null.
                        if (status === 0 || (status === 503 && content == null)) {
                            showBanner();
                        }
                    });

                    // Request berhasil → koneksi pasti pulih, sembunyikan banner.
                    succeed(function () {
                        hideBanner();
                    });
                });
            });

            // ── Refresh CSRF + clear cache setiap Livewire navigasi ──────────
            document.addEventListener('livewire:navigated', function () {
                pingServer().catch(function () { /* interceptor menangani 419 */ });

                // Bersihkan cache PermohonanAPI agar data user tidak basi.
                if (window.PermohonanAPI && typeof window.PermohonanAPI.clearCache === 'function') {
                    window.PermohonanAPI.clearCache();
                }
            });

            // ── Keep-alive: ping /csrf-token setiap 10 menit ─────────────────
            // Ini menjaga sesi tetap aktif selama tab terbuka, sehingga sesi
            // tidak kedaluwarsa meski pengguna meninggalkan halaman tanpa interaksi.
            var KEEP_ALIVE_MS = 10 * 60 * 1000; // 10 menit
            setInterval(function () {
                pingServer().catch(function () {});
            }, KEEP_ALIVE_MS);
        })();
    </script>
</body>
</html>
