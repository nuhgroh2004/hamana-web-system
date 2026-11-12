@php
    $routes = [
        'Permohonan Masuk' => route('module', 'permohonan-masuk'),
        'Permohonan Saya' => route('module', 'permohonan-saya'),
        'Izin Cuti atau Sakit' => route('module', 'izin-cuti-atau-sakit'),
        'Izin Keluar Kantor' => route('module', 'izin-keluar-kantor'),
        'Izin Dinas Dalam Kota' => route('module', 'izin-dinas-dalam-kota'),
        'Izin Dinas Luar Kota' => route('module', 'izin-dinas-luar-kota'),
        'Form Absensi' => route('module', 'form-absensi'),
        'Anggota Keluarga' => route('module', 'profil-anggota-keluarga'),
        'Tanda Tangan' => route('module', 'tanda-tangan'),
        'Dashboard' => route('home'),
        'Pengaturan' => route('pengaturan'),
    ];
@endphp

<div id="dash" data-routes="{{ json_encode($routes) }}">
    <div class="dw">
        <section class="cd pf">
            <svg class="avatar" id="av3" width="72" height="72" viewBox="0 0 5 5"></svg>
            <div><small>Selamat datang di HWI</small><h2>Nuhgroh Ramadani</h2></div>
        </section>
        <div class="g2">
            <section class="cd pad">
                <div class="rw"><b>Kelengkapan data</b><b class="pc">72%</b></div>
                <div class="pbar"><i id="pfill"></i></div>
                <p class="mt">Lengkapi <a class="lk" data-go="Anggota Keluarga">Anggota Keluarga</a> dan <a class="lk" data-go="Tanda Tangan">Tanda Tangan</a> agar data Anda valid.</p>
            </section>
            <section class="cd pad rw">
                <div><small>Sisa cuti</small><div class="big">8 <span>hari</span></div></div>
                <svg class="cal" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 7h12M5 1.5v3M11 1.5v3"/></svg>
            </section>
        </div>
        <h3 class="dh">Akses Cepat</h3>
        <section class="cd"><div class="qa" id="qa"></div></section>
        <h3 class="dh">Permohonan Terakhir</h3>
        <section class="cd">
            <div class="hd rw"><span>Permohonan</span><a class="lk" data-go="Permohonan Saya">Lihat semua</a></div>
            <div class="tabs" id="tabs"></div>
            <div id="rl"></div>
        </section>
    </div>
</div>
