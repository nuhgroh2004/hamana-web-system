<div id="page-satpam">
    <div class="pg">
        <h1>Satpam</h1>
        <p class="ds">Daftar izin keluar kantor karyawan.</p>

        <div class="tbar">
            <label class="srch">
                <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
                <input class="fld" id="q" type="search" placeholder="Cari nama atau divisi" autocomplete="off" aria-label="Cari nama atau divisi">
            </label>
            <div class="tl">
                <button type="button" class="btn dd" data-cal aria-haspopup="dialog">
                    <span class="bt"><span class="mu">Hari:</span> <span class="l"></span></span>
                    <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/></svg>
                </button>
                <button type="button" class="btn dd" data-dd="m" aria-haspopup="listbox">
                    <span class="bt"><span class="mu">Bulan:</span> <span class="l"></span></span>
                    <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>
                </button>
                <button type="button" class="btn dd" data-dd="y" aria-haspopup="listbox">
                    <span class="bt"><span class="mu">Tahun:</span> <span class="l"></span></span>
                    <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>
                </button>
            </div>
        </div>

        <div class="box">
            <table class="rt">
                <thead>
                    <tr>
                        <th class="c1">Aksi</th>
                        <th>Nama</th>
                        <th class="c3">Divisi</th>
                        <th class="c4">Posisi</th>
                        <th>Keperluan</th>
                        <th class="c6">Status</th>
                    </tr>
                </thead>
                <tbody id="tb"></tbody>
            </table>
            <div class="empty" id="empty" hidden>Tidak ada data yang cocok.</div>
            <div class="ft"><span id="cnt"></span><div class="pn" id="pn"></div></div>
        </div>
    </div>

    <div class="mn" id="mn" role="listbox" hidden></div>
    <div class="cal" id="cal" role="dialog" aria-label="Pilih tanggal" hidden></div>
</div>
