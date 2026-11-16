<div id="list-satpam">
    <div class="pg">
        <h1>User Satpam</h1>
        <p class="ds">Daftar akun satpam.</p>

        <div class="tbar">
            <label class="srch">
                <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
                <input class="fld" id="q" type="search" placeholder="Cari email atau nama" autocomplete="off" aria-label="Cari email atau nama">
            </label>
            <button type="button" class="btn go" id="add">
                <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>
                Tambah Akun
            </button>
        </div>

        <div class="box">
            <div class="tw">
                <table class="rt">
                    <thead>
                        <tr>
                            <th class="c1">Aksi</th>
                            <th>Email</th>
                            <th>Nama</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="tb"></tbody>
                </table>
            </div>
            <div class="empty" id="empty" hidden>Tidak ada akun yang cocok.</div>
            <div class="ft"><span id="cnt"></span><div class="pn" id="pn"></div></div>
        </div>
    </div>

    <div class="mn" id="mn" role="menu" aria-label="Aksi akun satpam" hidden></div>
    <div class="ov2" id="ov" hidden></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
