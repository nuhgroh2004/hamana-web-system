<div id="payroll-makan-lembur">
<div class="pg">

  <!-- Header Halaman Utama -->
  <div class="pg-head">
    <h1>Data Makan Lembur</h1>
    <p class="ds">Kelola data uang makan lembur karyawan berdasarkan periode gaji</p>
  </div>

  <!-- Card 1: Tambah / Edit Makan Lembur -->
  <div class="box">
    <div class="hd">
      <div>
        <h2 id="t1">Tambah makan lembur</h2>
        <p>Pilih karyawan dan periode gaji, lalu isi jumlah uang makan lembur untuk periode tersebut.</p>
      </div>
    </div>
    <div class="bd">
      <div class="fr f1">
        <!-- Custom Searchable Dropdown Karyawan -->
        <div class="f" data-f="emp">
          <label id="emp-lbl">Pilih Karyawan <span class="req">*)</span></label>
          <div class="cb" id="cb">
            <button type="button" class="cb-btn" id="cb-btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="emp-lbl">
              <span class="cb-val ph" id="cb-val">--Pilih Karyawan--</span>
              <svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
            </button>
            <div class="cb-menu" id="cb-menu">
              <div class="cb-sw">
                <input type="search" class="cb-s" id="cb-s" placeholder="Cari nama atau NIK karyawan..." autocomplete="off">
              </div>
              <div class="cb-list" id="cb-list" role="listbox"></div>
            </div>
          </div>
          <div class="er"></div>
        </div>

        <div class="f" data-f="bl">
          <label for="f-bl">Periode Gaji (Bulan) <span class="req">*)</span></label>
          <select class="fld" id="f-bl"></select>
        </div>

        <div class="f" data-f="th">
          <label for="f-th">Tahun <span class="req">*)</span></label>
          <select class="fld" id="f-th"></select>
        </div>

        <div class="f" data-f="jml">
          <label for="f-jml">Jumlah <span class="req">*)</span></label>
          <input class="fld n" type="number" id="f-jml" min="0" step="any" placeholder="0">
          <div class="er"></div>
        </div>
      </div>

      <div class="ft">
        <button type="button" class="btn go" id="sub">Submit</button>
        <button type="button" class="btn" id="rs">Reset</button>
      </div>
    </div>
  </div>

  <!-- Card 2: Import Data Makan Lembur -->
  <div class="box">
    <div class="hd">
      <div>
        <h2>Import data makan lembur (Excel)</h2>
        <p>Format kolom: NIK, Nama Karyawan, Bulan (1-12 atau nama bulan), Tahun, Jumlah.</p>
      </div>
      <button type="button" class="btn bl" id="tpl">
        <svg class="i" viewBox="0 0 16 16"><path d="M8 2v8M4.5 7L8 10.5 11.5 7M2.5 13.5h11"/></svg>Download Template
      </button>
    </div>
    <div class="bd">
      <div class="fb imp" style="align-items:center">
        <input class="fld" type="file" id="file" accept=".xlsx,.xls,.csv" style="max-width:340px">
        <button type="button" class="btn go" id="imp">
          <svg class="i" viewBox="0 0 16 16"><path d="M8 10.5v-8M4.5 6L8 2.5 11.5 6M2.5 13.5h11"/></svg>Import
        </button>
      </div>
    </div>
  </div>

  <!-- Card 3: Data Makan Lembur Karyawan -->
  <div class="box">
    <div class="hd">
      <h2>Data Makan Lembur Karyawan</h2>
    </div>
    <div class="bd" style="border-bottom:1px solid var(--bd)">
      <div class="fr f3">
        <div class="f">
          <label for="q">Cari Nama Karyawan</label>
          <input class="fld" id="q" type="search" placeholder="Ketik nama atau NIK karyawan..." autocomplete="off">
        </div>
        <div class="f">
          <label for="bl">Bulan</label>
          <select class="fld" id="bl"></select>
        </div>
        <div class="f">
          <label for="th">Tahun</label>
          <select class="fld" id="th"></select>
        </div>
      </div>
    </div>
    <div class="tw">
      <table>
        <thead>
          <tr>
            <th class="no">No.</th>
            <th>Detail Karyawan</th>
            <th>Periode</th>
            <th>Jumlah</th>
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
