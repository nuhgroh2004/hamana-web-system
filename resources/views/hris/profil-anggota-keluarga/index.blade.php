<div id="profil-anggota-keluarga">
    <div class="pg">
        <h1>Anggota Keluarga</h1>
        <p class="ds">Mengelola Anggota Keluarga Saya</p>
        <div class="note">
            <svg class="i" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4M8 5v.1"/></svg>
            <span>Kolom dengan tanda <b>*)</b> wajib diisi.</span>
        </div>

        <div class="box">
            <div class="tw">
                <table id="tbl">
                    <thead>
                        <tr>
                            <th class="c1">#</th>
                            <th class="c2"><span style="position:absolute;left:-9999px">Hubungan</span></th>
                            <th>Nama Lengkap</th>
                            <th class="c3">Usia</th>
                            <th>Pekerjaan</th>
                            <th class="c6"><span style="position:absolute;left:-9999px">Aksi</span></th>
                        </tr>
                    </thead>
                    <tbody id="tb"></tbody>
                </table>
            </div>
        </div>

        <div class="act">
            <button type="button" class="btn" id="edit">
                <svg class="i" viewBox="0 0 16 16"><path d="M2 14l1-3.5 8-8 2.5 2.5-8 8zM9.5 4l2.5 2.5"/></svg>
                Edit
            </button>
            <button type="button" class="btn go" id="save" disabled>Simpan</button>
        </div>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
