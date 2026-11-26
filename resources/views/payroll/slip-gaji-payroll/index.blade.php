<div id="payroll-slip-gaji">
<!-- Halaman Slip Gaji tanpa sidebar/navbar. Pasang di dalam layout sistem Anda.
     Event: "slip-print" / "slip-download" (detail = data slip) dikirim saat tombol aksi ditekan. -->
<div class="pg">
  <h1>Slip Gaji</h1>
  <p class="ds">Daftar slip gaji karyawan per periode</p>

  <div class="box">
    <div class="hd"><span>Filter</span></div>
    <div class="bd">
      <div class="f"><label for="q">Nama karyawan</label><div class="sw"><svg class="i" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><input class="fld" id="q" type="search" placeholder="Ketik nama atau NIK..." autocomplete="off"></div></div>
      <div class="f"><label for="bl">Bulan</label><select class="fld" id="bl"></select></div>
      <div class="f"><label for="th">Tahun</label><select class="fld" id="th"></select></div>
    </div>
  </div>

  <div class="box" style="margin-bottom:0">
    <div class="tw">
      <table>
        <thead>
          <tr><th rowspan="2">No.</th><th rowspan="2">Detail Karyawan</th><th rowspan="2">Bulan/Tahun</th><th rowspan="2" class="n">Gaji Pokok</th><th colspan="3" class="g">Tunjangan</th><th rowspan="2" class="n">Manfaat</th><th rowspan="2" class="n">Potongan</th><th rowspan="2" class="n">Total</th><th rowspan="2" class="n bs">Gaji Bersih</th><th rowspan="2">Aksi</th></tr>
          <tr><th class="n">Gaji Tetap</th><th class="n">Variabel</th><th class="n">Lainnya</th></tr>
        </thead>
        <tbody id="tb"></tbody>
      </table>
    </div>
    <div class="ft" id="ft"></div>
  </div>
</div>
<div id="ps"></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
