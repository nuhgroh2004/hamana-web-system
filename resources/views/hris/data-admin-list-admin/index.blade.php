<div id="data-admin-list-admin">
    <div class="pg">
        <h1>User Admin</h1>
        <p class="ds">Daftar akun admin beserta pemegang aksesnya.</p>

        <div class="tbar">
            <label class="srch">
                <svg class="i" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
                <input class="fld" id="q" type="search" placeholder="Cari username atau nama" autocomplete="off" aria-label="Cari username atau nama">
            </label>
            <button type="button" class="btn go" id="add">
                <svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>
                Tambah Akun
            </button>
        </div>

        <div class="box">
            <div class="tw">
                <table>
                    <thead>
                        <tr>
                            <th class="c1">Aksi</th>
                            <th>Username</th>
                            <th>NIK Pemegang Akses</th>
                            <th>Nama Pemegang Akses</th>
                            <th>Status Akun Admin</th>
                            <th>Status Karyawan</th>
                        </tr>
                    </thead>
                    <tbody id="tb"></tbody>
                </table>
            </div>
            <div class="empty" id="empty" hidden>Tidak ada akun yang cocok.</div>
            <div class="ft"><span id="cnt"></span><div class="pn" id="pn"></div></div>
        </div>
    </div>

    <div class="mn" id="mn" hidden></div>
    <div class="ov2" id="ov" hidden></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
