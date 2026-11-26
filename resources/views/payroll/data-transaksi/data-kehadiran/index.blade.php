<div id="payroll-data-kehadiran">
<!-- Halaman Data Kehadiran Karyawan (GitHub Style) tanpa sidebar/navbar dan tanpa pagination.
     Events:
     - "kehadiran-sync"   : detail = { bl, th, count, data }
     - "kehadiran-import" : detail = File
     - "kehadiran-save"   : detail = record
     - "kehadiran-delete" : detail = record -->
<div class="pg">

  <!-- Header Halaman Utama -->
  <div class="pg-head">
    <h1>Data Kehadiran</h1>
    <p class="ds">Kelola data kehadiran karyawan berdasarkan periode bulan dan tahun.</p>
  </div>

  <!-- Card 1: Periode Kehadiran -->
  <div class="box">
    <div class="hd">
      <div>
        <h2>Periode kehadiran</h2>
        <p>Pilih bulan dan tahun, lalu tampilkan data atau ambil langsung dari database absensi.</p>
      </div>
    </div>
    <div class="bd">
      <div class="f-per">
        <div class="f">
          <label for="p-bl">Bulan <span class="req">*)</span></label>
          <select class="fld" id="p-bl"></select>
        </div>
        <div class="f">
          <label for="p-th">Tahun <span class="req">*)</span></label>
          <select class="fld" id="p-th"></select>
        </div>
        <button type="button" class="btn go" id="btn-show">
          <svg class="i" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>Tampilkan
        </button>
        <button type="button" class="btn" id="btn-sync">
          <svg class="i" viewBox="0 0 16 16"><path d="M2.5 7a5.5 5.5 0 0 1 10-2.2M13.5 2.5v2.5H11M13.5 9a5.5 5.5 0 0 1-10 2.2M2.5 13.5V11H5"/></svg>Ambil dari Absensi
        </button>
      </div>
    </div>
  </div>

  <!-- Card 2: Import Data Kehadiran (Excel) -->
  <div class="box">
    <div class="hd">
      <div>
        <h2>Import data kehadiran (Excel)</h2>
        <p>Format kolom: NIK, Nama Karyawan, Bulan, Tahun, Jumlah kehadiran.</p>
      </div>
      <button type="button" class="btn bl" id="btn-tpl">
        <svg class="i" viewBox="0 0 16 16"><path d="M8 2v8M4.5 7L8 10.5 11.5 7M2.5 13.5h11"/></svg>Download Template
      </button>
    </div>
    <div class="bd">
      <div class="fb imp">
        <input class="fld" type="file" id="file-imp" accept=".xlsx,.xls,.csv" style="max-width:340px">
        <button type="button" class="btn go" id="btn-imp">
          <svg class="i" viewBox="0 0 16 16"><path d="M8 10.5v-8M4.5 6L8 2.5 11.5 6M2.5 13.5h11"/></svg>Import
        </button>
      </div>
    </div>
  </div>

  <!-- Card 3: Data Kehadiran Karyawan -->
  <div class="box">
    <div class="hd">
      <div>
        <h2>Data Kehadiran Karyawan</h2>
      </div>
      <span class="lbl" id="badge-per">
        <svg class="i" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/></svg>
        <span id="lbl-per">November 2026</span> &bull; <span id="lbl-cnt">0 data</span>
      </span>
    </div>

    <!-- Baris Pencarian & Tombol Tambah Manual -->
    <div class="bd" style="border-bottom:1px solid var(--bd)">
      <div class="bar">
        <div class="srch">
          <input class="fld" id="q" type="search" placeholder="Cari nama atau NIK karyawan..." autocomplete="off">
        </div>
        <button type="button" class="btn sm" id="btn-toggle-add">
          <svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>Tambah Manual
        </button>
      </div>
    </div>

    <!-- Panel Tambah Kehadiran Manual -->
    <div class="add-box" id="add-box" hidden>
      <div class="f">
        <label for="m-emp">Karyawan</label>
        <select class="fld" id="m-emp"></select>
      </div>
      <div class="f">
        <label for="m-jml">Jumlah Hadir</label>
        <input class="fld n" type="number" id="m-jml" min="0" max="31" step="1" placeholder="22">
      </div>
      <button type="button" class="btn go" id="m-save">Simpan</button>
      <button type="button" class="btn" id="m-cancel">Batal</button>
    </div>

    <!-- Tabel Data Kehadiran (Tanpa Pagination) -->
    <div class="tw">
      <table>
        <thead>
          <tr>
            <th class="no">No.</th>
            <th>Detail Karyawan</th>
            <th>Periode</th>
            <th>Jumlah Kehadiran</th>
            <th>Tgl. Input</th>
            <th class="ac">Aksi</th>
          </tr>
        </thead>
        <tbody id="tb"></tbody>
      </table>
    </div>
  </div>

</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
