<div id="permohonan-masuk">
    <div class="pg">
        <h1>Permohonan Masuk</h1>
        <p class="ds">Daftar permohonan yang masuk untuk ditinjau</p>

        <div class="wrap" id="wrap">
            <section class="pane" id="lpane" aria-label="Daftar permohonan">
                <div class="lf">
                    <div class="frow">
                        <label class="srch">
                            <svg class="i" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
                            <input class="fld" id="q" type="search" placeholder="Cari nama..." autocomplete="off" aria-label="Cari nama">
                        </label>
                        <div class="r2">
                            <button type="button" class="btn dd" data-dd="mon" aria-haspopup="listbox">
                                <b class="l" style="font-weight: 400"></b>
                                <svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
                            </button>
                            <button type="button" class="btn dd" data-dd="yr" aria-haspopup="listbox">
                                <b class="l" style="font-weight: 400"></b>
                                <svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
                            </button>
                            <div class="dtw">
                                <input class="fld" id="dt" type="date" aria-label="Tanggal" title="Tanggal">
                                <button type="button" class="btn sm dtx" id="dtx" aria-label="Tampilkan semua tanggal" title="Tampilkan semua tanggal">
                                    <svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="chips" id="chips"></div>
                </div>
                <div class="lst" id="lst"></div>
            </section>

            <section class="pane" id="dpane" aria-label="Detail permohonan"></section>
        </div>
    </div>

    <div class="mn" id="mn" role="listbox" hidden></div>
    <div class="ov2" id="ov" hidden></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <div id="pa" aria-hidden="true"></div>
</div>
