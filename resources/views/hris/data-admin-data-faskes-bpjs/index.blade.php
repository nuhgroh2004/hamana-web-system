<div id="data-admin-data-faskes-bpjs">
    <div class="pg">
        <h1>Data Faskes BPJS</h1>
        <p class="ds">Daftar fasilitas kesehatan tingkat I (PPK) yang terdaftar.</p>

        <div class="sum" id="sum">
            <button type="button" class="sc" data-s="all">Total Faskes:<b id="nall">0</b></button>
            <button type="button" class="sc warn" data-s="nokode">Tanpa Kode PPK:<b id="nno">0</b></button>
        </div>

        <div class="tbar">
            <div class="tl">
                <label class="srch">
                    <svg class="i" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
                    <input class="fld" id="q" type="search" placeholder="Cari nama PPK, kode, atau alamat" autocomplete="off" aria-label="Cari nama PPK, kode, atau alamat">
                </label>
                <button type="button" class="btn dd" data-dd="prov" aria-haspopup="listbox">
                    <span><span class="mu">Provinsi:</span> <span class="l"></span></span>
                    <svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
                </button>
                <button type="button" class="btn dd" data-dd="kab" aria-haspopup="listbox">
                    <span><span class="mu">Kabupaten/Kota:</span> <span class="l"></span></span>
                    <svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
                </button>
            </div>
            <div class="tr">
                <button type="button" class="btn" id="imp">
                    <svg class="i" viewBox="0 0 16 16"><path d="M8 2.5V11M4.5 7.5L8 11l3.5-3.5M2.5 13.5h11"/></svg>
                    Import Data Faskes
                </button>
                <button type="button" class="btn" id="exp">
                    <svg class="i" viewBox="0 0 16 16"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v3h11v-3"/></svg>
                    Export
                </button>
                <button type="button" class="btn go" id="add">
                    <svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>
                    Tambah Manual
                </button>
            </div>
        </div>

        <div class="box">
            <div class="tw">
                <table>
                    <thead>
                        <tr>
                            <th class="c1">Aksi</th>
                            <th>Nama Provinsi</th>
                            <th>Kantor Regional</th>
                            <th>Kantor Cabang</th>
                            <th>Kabupaten/Kota</th>
                            <th>Kode PPK</th>
                            <th>Nama PPK</th>
                            <th>Alamat PPK</th>
                            <th>Telp PPK</th>
                        </tr>
                    </thead>
                    <tbody id="tb"></tbody>
                </table>
            </div>
            <div class="empty" id="empty" hidden>Tidak ada data faskes yang cocok.</div>
            <div class="ft"><span id="cnt"></span><div class="pn" id="pn"></div></div>
        </div>
    </div>

    <div class="mn" id="mn" role="listbox" hidden></div>
    <div class="ov2" id="ov" hidden></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
