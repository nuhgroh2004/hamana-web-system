<div id="profil-ciri-fisik">
    <div class="pg">
        <div class="hdr">
            <h1>Ubah Ciri Fisik</h1>
            <button type="button" class="btn" id="edit">
                <svg class="i" viewBox="0 0 16 16"><path d="M2 14l1-3.5 8-8 2.5 2.5-8 8zM9.5 4l2.5 2.5"/></svg>
                Edit
            </button>
        </div>
        <p class="ds">Mengelola data ciri fisik</p>
        <div class="note">
            <svg class="i" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4M8 5v.1"/></svg>
            <span>Kolom dengan tanda <b>*)</b> wajib diisi.</span>
        </div>

        <form id="f" class="box" novalidate>
            <div class="gr">
                <div><label class="lb" for="warna_kulit">Warna Kulit</label><input class="fld" id="warna_kulit" autocomplete="off"></div>
                <div><label class="lb" for="golongan_darah">Golongan Darah</label><input class="fld" id="golongan_darah" autocomplete="off"></div>
                <div><label class="lb" for="warna_rambut">Warna Rambut</label><input class="fld" id="warna_rambut" autocomplete="off"></div>
                <div><label class="lb" for="ukuran_baju">Ukuran Baju</label><input class="fld" id="ukuran_baju" autocomplete="off"></div>
                <div><label class="lb" for="warna_mata">Warna Mata</label><input class="fld" id="warna_mata" autocomplete="off"></div>
                <div><label class="lb" for="ukuran_celana">Ukuran Celana</label><input class="fld" id="ukuran_celana" autocomplete="off"></div>
                <div><label class="lb" for="tinggi_badan">Tinggi Badan</label><input class="fld" id="tinggi_badan" inputmode="decimal" autocomplete="off"></div>
                <div><label class="lb" for="ukuran_sepatu">Ukuran Sepatu</label><input class="fld" id="ukuran_sepatu" inputmode="decimal" autocomplete="off"></div>
                <div><label class="lb" for="berat_badan">Berat Badan</label><input class="fld" id="berat_badan" inputmode="decimal" autocomplete="off"></div>
            </div>
        </form>

        <div class="bar" id="bar" hidden>
            <button type="button" class="btn" id="cancel">Batal</button>
            <button type="button" class="btn go" id="save">Simpan</button>
        </div>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
