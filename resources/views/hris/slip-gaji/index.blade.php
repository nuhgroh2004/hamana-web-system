<div id="slip-gaji">
    <div class="gate" id="gate">
        <div class="dlg" role="dialog" aria-modal="true" aria-labelledby="gt">
            <div class="dh"><span id="gt">Masukkan PIN</span></div>
            <div class="db">
                <p>PIN adalah tanggal lahir dan bulan Anda, contoh 0911.</p>
                <div class="f">
                    <input class="fld pin" id="pin" type="password" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="••••" aria-label="PIN">
                    <p class="er" id="pe" role="alert"></p>
                </div>
            </div>
            <div class="df">
                <button type="button" class="btn" id="back">Kembali</button>
                <button type="button" class="btn go" id="sub">Submit</button>
            </div>
        </div>
    </div>

    <div class="pg" id="pg" hidden>
        <h1>Slip Gaji</h1>
        <p class="ds">Daftar slip gaji Anda per bulan.</p>

        <div class="tbar">
            <div class="tl">
                <button type="button" class="btn dd" data-dd="bln" aria-haspopup="listbox">
                    <span><span class="mu">Bulan:</span> <span class="l"></span></span>
                    <svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
                </button>
                <button type="button" class="btn dd" data-dd="thn" aria-haspopup="listbox">
                    <span><span class="mu">Tahun:</span> <span class="l"></span></span>
                    <svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
                </button>
            </div>
        </div>

        <div class="box">
            <div class="tw">
                <table>
                    <thead>
                        <tr><th class="c2">No</th><th class="c1">Lihat</th><th>Bulan</th><th>Tahun</th></tr>
                    </thead>
                    <tbody id="tb"></tbody>
                </table>
            </div>
            <div class="empty" id="empty" hidden>Tidak ada slip gaji yang cocok.</div>
            <div class="ft"><span id="cnt"></span><div class="pn" id="pn"></div></div>
        </div>
    </div>

    <div class="mn" id="mn" role="listbox" hidden></div>
</div>
