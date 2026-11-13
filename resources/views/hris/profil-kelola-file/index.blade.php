<div id="profil-kelola-file">
    <div class="pg">
        <x-master-komponen::back />
        <h1>Kelola Dokumen Pegawai</h1>
        <p class="ds">Unggah dan kelola dokumen pegawai Anda.</p>
        <div class="note">
            <svg class="i" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4M8 5v.1"/></svg>
            <span>Format file PDF, JPG, atau PNG dengan ukuran maksimal 10 MB. Kolom dengan tanda <b>*)</b> wajib diisi.</span>
        </div>

        <h2 class="sh">Dokumen Utama</h2>
        <div id="utama"></div>

        <h2 class="sh">Dokumen Lainnya</h2>
        <div id="lain"></div>
    </div>
    <div class="ov2" id="ov" hidden></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
