<div class="wrap">
    <header>
        <a class="brand" href="#" aria-label="HWI">
            <svg viewBox="0 0 20 20"><circle cx="10" cy="3.5" r="3"/><circle cx="3.5" cy="10" r="3"/><circle cx="16.5" cy="10" r="3"/><circle cx="10" cy="16.5" r="3"/></svg>
        </a>
        <nav class="pill" aria-label="Navigasi"><a href="#">Privasi dan ketentuan</a><a href="#">FAQ</a></nav>
    </header>

    <main class="grid">
        <section>
            <h1>Selamat datang di <span>Hamana Works Indonesia</span></h1>

            <form id="f" wire:submit="login" novalidate>
                <div class="row">
                    <label class="lbl" for="email">Email</label>
                    <input class="fld @error('email') bad @enderror"
                           id="email"
                           type="email"
                           autocomplete="email"
                           placeholder="email@gmail.com"
                           wire:model="email">
                </div>
                <div class="row">
                    <label class="lbl" for="pw">Password</label>
                    <div class="fld-wrap">
                        <input class="fld @error('password') bad @enderror"
                               id="pw"
                               type="password"
                               autocomplete="current-password"
                               placeholder="Masukkan password"
                               wire:model="password">
                        <button class="eye" id="toggle-pw" type="button" aria-label="Tampilkan password" aria-pressed="false">
                            <svg class="eye-show" viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg class="eye-hide" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                </div>
                <label class="rem" for="remember">
                    <input id="remember" type="checkbox" wire:model="remember" @checked($remember)>
                    <span>Ingat saya</span>
                </label>
                <div class="err" id="err" role="alert" aria-live="polite">@if ($errors->any()){{ $errors->first() }}@endif</div>
                <button class="go" id="go" type="submit" wire:loading.attr="disabled" wire:target="login">
                    <span wire:loading.remove wire:target="login">Login</span>
                    <span wire:loading wire:target="login">Memproses…</span>
                </button>
            </form>
        </section>

        <aside class="hero" aria-hidden="true">
            <div class="lap">
                <div class="bez">
                    <div class="scr">
                        <div class="sb"><p>Ruang kerja HWI</p><i></i><i></i><i></i><i></i><i></i><i></i><i style="margin-top:28px"></i><i></i><i></i></div>
                        <div class="ct">
                            <h3>Halo, Nuhgroh</h3>
                            <p>Ada yang bisa dibantu hari ini?</p>
                            <div class="cards">
                                <div class="cd c1">Ajukan cuti tahunan Anda<span class="av a1"></span></div>
                                <div class="cd c2">Lihat slip gaji bulan ini<div class="tile">SLIP GAJI<br>OKT 2026</div><small>Payroll · Slip Gaji</small></div>
                                <div class="cd c3">Rekap kehadiran bulan ini<span class="av a3"></span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="base"></div>
            </div>
        </aside>
    </main>
</div>
