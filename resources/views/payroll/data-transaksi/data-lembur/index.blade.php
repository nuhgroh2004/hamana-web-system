<div id="payroll-data-lembur">
<!-- Halaman Lembur Karyawan tanpa sidebar/navbar. Pasang di dalam layout sistem Anda.
     Event: "lembur-save", "lembur-delete", "lembur-import" (detail = File), "lembur-export-rekap".
     Ganti EMP dengan daftar karyawan dari server dan hitungOvertime() dengan aturan perhitungan sistem Anda. -->
<div class="pg">

  <div class="box">
    <div class="hd"><div><h2 id="t1">Tambah lembur karyawan</h2><p>Pilih karyawan lalu isi tanggal dan jam. Gunakan tombol Tambah untuk mencatat beberapa tanggal sekaligus.</p></div></div>
    <div class="bd">
      <div class="fr f1">
        <div class="f" data-f="emp"><label for="emp">Pilih Karyawan</label><select class="fld" id="emp"></select><div class="er"></div></div>
        <div class="f" data-f="tgl"><label for="tgl">Tanggal</label><input class="fld" type="date" id="tgl"></div>
        <div class="f" data-f="jm"><label for="jm">Jam Masuk</label><input class="fld" type="time" id="jm"></div>
        <div class="f" data-f="jp"><label for="jp">Jam Pulang</label><input class="fld" type="time" id="jp"></div>
        <button type="button" class="btn" id="add"><svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>Tambah</button>
      </div>
      <div class="pend" id="pend" hidden><div class="ph" id="ph"></div><div id="pl"></div></div>
      <div class="ft">
        <button type="button" class="btn go" id="sub">Submit</button>
        <button type="button" class="btn" id="rs">Reset</button>
      </div>
    </div>
  </div>

  <div class="box">
    <div class="hd">
      <div><h2>Import data lembur (Excel)</h2><p>Format kolom: NIK, Nama Karyawan, Tanggal (YYYY-MM-DD), Jam Masuk (HH:MM), Jam Pulang (HH:MM).</p></div>
      <button type="button" class="btn bl" id="tpl"><svg class="i" viewBox="0 0 16 16"><path d="M8 2v8M4.5 7L8 10.5 11.5 7M2.5 13.5h11"/></svg>Download Template</button>
    </div>
    <div class="bd"><div class="fb imp" style="align-items:center">
      <input class="fld" type="file" id="file" accept=".xlsx,.xls,.csv" style="max-width:340px">
      <button type="button" class="btn go" id="imp"><svg class="i" viewBox="0 0 16 16"><path d="M8 10.5v-8M4.5 6L8 2.5 11.5 6M2.5 13.5h11"/></svg>Import</button>
    </div></div>
  </div>

  <div class="box">
    <div class="hd"><h2>Data Lembur</h2></div>
    <div class="bd" style="border-bottom:1px solid var(--bd)">
      <div class="fr f3">
        <div class="f"><label for="q">Cari Nama Karyawan</label><input class="fld" id="q" type="search" placeholder="Ketik nama karyawan..." autocomplete="off"></div>
        <div class="f"><label for="bl">Bulan</label><select class="fld" id="bl"></select></div>
        <div class="f"><label for="th">Tahun</label><select class="fld" id="th"></select></div>
        <div class="f"><label for="d1">Dari Tanggal</label><input class="fld" type="date" id="d1"></div>
        <div class="f"><label for="d2">Sampai Tanggal</label><input class="fld" type="date" id="d2"></div>
      </div>
      <div class="fb">
        <button type="button" class="btn go" id="show"><svg class="i" viewBox="0 0 16 16"><path d="M2 3h12l-4.5 5.5V13l-3-1.5V8.5z"/></svg>Tampilkan</button>
        <button type="button" class="btn" id="exp"><svg class="i" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3M6 8l3 4M9 8l-3 4"/></svg>Export Rekap Rupiah</button>
        <button type="button" class="btn bl" id="rl"><svg class="i" viewBox="0 0 16 16"><path d="M2.5 7a5.5 5.5 0 0 1 10-2.2M13.5 2.5v2.5H11M13.5 9a5.5 5.5 0 0 1-10 2.2M2.5 13.5V11H5"/></svg>Muat Ulang</button>
      </div>
    </div>
    <table>
      <thead><tr><th class="no">No.</th><th>Detail Karyawan</th><th>Tanggal</th><th>Tipe</th><th>Mulai</th><th>Selesai</th><th>Overtime</th><th>Tgl. Input</th><th class="ac">Aksi</th></tr></thead>
      <tbody id="tb"></tbody>
    </table>
  </div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
