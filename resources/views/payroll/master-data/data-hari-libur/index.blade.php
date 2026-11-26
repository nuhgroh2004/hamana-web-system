<div id="payroll-data-hari-libur">
<!-- Halaman Data Hari Libur tanpa sidebar/navbar. Pasang di dalam layout sistem Anda.
     Event: "libur-save", "libur-delete" (detail = array data terhapus), "libur-api". Ganti API_URL sesuai endpoint Anda. -->
<div class="pg">
  <h1>Hari Libur</h1>

  <div class="two">
    <div class="box">
      <div class="hd"><span id="t1">Input Hari Libur</span></div>
      <div class="bd">
        <div class="f"><label for="ket">Keterangan</label><input class="fld" id="ket" autocomplete="off"></div>
        <div class="row">
          <div class="f"><label for="tgl">Tanggal</label><input class="fld" type="date" id="tgl"></div>
          <button type="button" class="btn go" id="sv"><svg class="i" viewBox="0 0 16 16"><path d="M2.5 2.5h9l2 2v9h-11zM5 2.5v3.5h5V2.5M5 13.5V9h6v4.5"/></svg><span id="st">Simpan</span></button>
        </div>
      </div>
    </div>

    <div class="box">
      <div class="hd"><span>Ambil Data Hari Libur dari API</span></div>
      <div class="bd">
        <div class="row">
          <div class="f"><label for="th">Tahun</label><select class="fld" id="th"></select></div>
          <button type="button" class="btn go" id="ap"><svg class="i" viewBox="0 0 16 16"><path d="M2.5 2.5h9l2 2v9h-11zM5 2.5v3.5h5V2.5M5 13.5V9h6v4.5"/></svg><span id="at">Simpan</span></button>
        </div>
      </div>
    </div>
  </div>

  <div class="box">
    <div class="hd"><span id="t3"></span></div>
    <div class="tl"><label class="sa"><input type="checkbox" id="ca2"> Pilih semua</label><label for="q">Search:</label><input class="fld" id="q" type="search" placeholder="Search" autocomplete="off"><label for="th3" class="yr">Tahun</label><select class="fld" id="th3" aria-label="Tahun"></select><span class="sc" id="sc"></span></div>
    <table>
      <thead><tr><th class="ck"><input type="checkbox" id="ca" aria-label="Pilih semua"></th><th>Judul</th><th class="tg">Tanggal</th><th class="ac">Aksi</th></tr></thead>
      <tbody id="tb"></tbody>
    </table>
  </div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
