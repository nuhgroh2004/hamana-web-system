@php
    $aksiRoutes = [
        'profil' => route('module', 'profil-data-pribadi'),
        'pendidikan' => route('module', 'profil-riwayat-pendidikan'),
        'keluarga' => route('module', 'profil-anggota-keluarga'),
        'fisik' => route('module', 'profil-ciri-fisik'),
        'file' => route('module', 'dokumen-pegawai'),
    ];
@endphp

<div id="data-pegawai" data-routes="{{ json_encode($aksiRoutes) }}">
    <div class="pg">
        <h1>Data Pegawai</h1>
        <p class="ds">Daftar pegawai beserta status kepegawaiannya.</p>

        <div class="sum" id="sum">
            <button type="button" class="sc" data-f="1"><small>Karyawan Aktif</small><b id="n1">0</b></button>
            <button type="button" class="sc" data-f="0"><small>Karyawan Tidak Aktif</small><b id="n0">0</b></button>
            <button type="button" class="sc" data-f="all"><small>Semua Karyawan</small><b id="nall">0</b></button>
        </div>

        <div class="tbar">
            <div class="tl">
                <label class="srch">
                    <svg class="i" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
                    <input class="fld" id="q" type="search" placeholder="Cari nama atau NIK" autocomplete="off" aria-label="Cari nama atau NIK">
                </label>
                <button type="button" class="btn dd" data-dd="st" aria-haspopup="listbox">
                    <span><span class="mu">Status:</span> <span class="l"></span></span>
                    <svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
                </button>
            </div>
            <div class="tr">
                <button type="button" class="btn" id="imp">
                    <svg class="i" viewBox="0 0 16 16"><path d="M8 2.5V11M4.5 7.5L8 11l3.5-3.5M2.5 13.5h11"/></svg>
                    Import
                </button>
                <button type="button" class="btn" id="exp">
                    <svg class="i" viewBox="0 0 16 16"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v3h11v-3"/></svg>
                    Export
                </button>
                <button type="button" class="btn go" id="add">
                    <svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>
                    Tambah Karyawan
                </button>
            </div>
        </div>

        <div class="box">
            <div class="tw">
                <table>
                    <thead>
                        <tr><th class="c1">Aksi</th><th>NIK</th><th>Nama</th><th>Jabatan</th><th>Posisi</th><th>Status</th></tr>
                    </thead>
                    <tbody id="tb"></tbody>
                </table>
            </div>
            <div class="empty" id="empty" hidden>Tidak ada data pegawai yang cocok.</div>
            <div class="ft"><span id="cnt"></span><div class="pn" id="pn"></div></div>
        </div>
    </div>

    <div class="mn" id="mn" hidden></div>
    <div class="ov2" id="ov" hidden></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
