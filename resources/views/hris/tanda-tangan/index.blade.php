<div id="tanda-tangan">
    <div class="pg">
        <h1>Tanda Tangan</h1>
        <p class="ds">Gambar langsung atau upload tanda tangan Anda.</p>

        <div class="nb" id="nb" role="alert" hidden><svg class="i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v4M8 11v.01"/></svg><span>Anda belum memiliki tanda tangan.</span></div>

        <section class="bx">
            <div class="bh">Gambar Tanda Tangan</div>
            <div class="bb">
                <div class="pad" id="pad">
                    <canvas id="cv" aria-label="Area untuk menggambar tanda tangan"></canvas>
                    <div class="bl"></div>
                    <div class="ph" id="ph"><svg class="i" viewBox="0 0 16 16"><path d="M11 2.5l2.5 2.5L5.5 13H3v-2.5L11 2.5z"/></svg>Tanda tangan di sini</div>
                </div>
                <div class="tl">
                    <button type="button" class="btn" id="clr" disabled><svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5"/></svg>Hapus</button>
                    <button type="button" class="btn" id="und" disabled><svg class="i" viewBox="0 0 16 16"><path d="M3 6.5h6.5a3.5 3.5 0 010 7H6M3 6.5l2.8-2.8M3 6.5l2.8 2.8"/></svg>Undo</button>
                    <button type="button" class="btn" id="up"><svg class="i" viewBox="0 0 16 16"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v3h11v-3"/></svg>Upload PNG</button>
                    <button type="button" class="btn go" id="sv" disabled><svg class="i" viewBox="0 0 16 16"><path d="M2.5 2.5h8l3 3v8h-11zM5 2.5v3.5h5V2.5M5 13.5v-4h6v4"/></svg>Simpan</button>
                </div>
                <input type="file" id="fin" accept="image/png,.png" hidden>
                <div class="wn"><svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2l6.5 11.5h-13z"/><path d="M8 6.5v3M8 11.5v.01"/></svg><p><b>Peringatan:</b> hanya menerima file PNG. Pastikan file tanda tangan yang kamu upload tanpa background (transparan) agar hasilnya rapi.</p></div>
                <div class="wn x" id="tn" role="alert" hidden><svg class="i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v4M8 11v.01"/></svg><p>File yang diupload tidak transparan, hasil tanda tangan akan tampak memiliki background.</p></div>
            </div>
        </section>

        <section class="bx">
            <div class="bh">Tanda Tangan Tersimpan</div>
            <div class="bb" id="sa"></div>
        </section>
    </div>
</div>
