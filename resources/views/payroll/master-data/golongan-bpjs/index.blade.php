<div id="payroll-golongan-bpjs">
<!-- Halaman Golongan BPJS tanpa sidebar/navbar. Pasang di dalam layout sistem Anda.
     Event: "golongan-save" (detail = data golongan), "golongan-delete" (detail = data golongan). -->
<div class="pg">
  <div class="box">
    <div class="hd"><h2 id="t1">Tambah Golongan BPJS</h2><p>Isi kode dan nama golongan, lalu pilih komponen BPJS yang termasuk di dalamnya.</p></div>
    <div class="bd">
      <div class="g2">
        <div class="f" data-f="kode"><label for="kode">Kode Golongan</label><input class="fld" id="kode" placeholder="Contoh: 1" autocomplete="off"><div class="er"></div></div>
        <div class="f" data-f="nama"><label for="nama">Nama Golongan</label><input class="fld" id="nama" placeholder="Contoh: Golongan 1" autocomplete="off"><div class="er"></div></div>
      </div>
      <div class="f"><span class="lb">Komponen BPJS</span><div class="chips" id="chips"></div></div>
      <div class="f"><label for="ket">Keterangan</label><textarea class="fld" id="ket" placeholder="Keterangan (opsional)"></textarea></div>
      <div class="ft">
        <button type="button" class="btn go" id="sv"><svg class="i" viewBox="0 0 16 16"><path d="M2.5 2.5h9l2 2v9h-11zM5 2.5v3.5h5V2.5M5 13.5V9h6v4.5"/></svg>Simpan</button>
        <button type="button" class="btn" id="rs"><svg class="i" viewBox="0 0 16 16"><path d="M3 8a5 5 0 1 0 1.8-3.8M3 2.5v3h3"/></svg>Reset</button>
      </div>
    </div>
  </div>

  <div class="box">
    <div class="hd"><h2>Data Golongan BPJS</h2><p>Daftar golongan yang sudah tersimpan beserta komponen jaminannya.</p></div>
    <table>
      <thead><tr><th class="kd">Kode</th><th>Nama Golongan</th><th class="c">JKK</th><th class="c">JKM</th><th class="c">JHT</th><th class="c">JP</th><th class="c">BPJS Regular</th><th>Keterangan</th><th class="ac">Aksi</th></tr></thead>
      <tbody id="tb"></tbody>
    </table>
  </div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
