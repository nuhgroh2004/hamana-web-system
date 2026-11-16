<div id="data-admin-data-golongan">
    <div class="pg">
        <h1>Data Golongan</h1>
        <p class="ds">Daftar golongan karyawan.</p>

        <div class="tbar">
            <label class="srch">
                <svg class="i" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
                <input class="fld" id="q" type="search" placeholder="Cari golongan" autocomplete="off" aria-label="Cari golongan">
            </label>
            <button type="button" class="btn go" id="add">
                <svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>
                Tambah Data
            </button>
        </div>

        <div class="box">
            <div class="tw">
                <table>
                    <thead>
                        <tr><th class="c1">Aksi</th><th class="c2">No</th><th>Golongan</th></tr>
                    </thead>
                    <tbody id="tb"></tbody>
                </table>
            </div>
            <div class="empty" id="empty" hidden>Tidak ada golongan yang cocok.</div>
            <div class="ft"><span id="cnt"></span><div class="pn" id="pn"></div></div>
        </div>
    </div>

    <div class="mn" id="mn" hidden></div>
    <div class="ov2" id="ov" hidden></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
