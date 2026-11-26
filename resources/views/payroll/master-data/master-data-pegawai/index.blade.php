<div id="payroll-master-data-pegawai">
<!-- Halaman Kelola Data Pegawai tanpa sidebar/navbar. Pasang di dalam layout sistem Anda.
     Event: "pegawai-edit" (detail = data pegawai), "pegawai-export", "pegawai-import", "pegawai-sync". -->
<div class="pg">
  <div class="top">
    <h1>Kelola Data Pegawai</h1>
    <div class="acts">
      <button type="button" class="btn" id="ex"><svg class="i" viewBox="0 0 16 16"><path d="M8 2v8M4.5 7L8 10.5 11.5 7M2.5 13.5h11"/></svg>Export Data (Excel)</button>
      <button type="button" class="btn" id="im"><svg class="i" viewBox="0 0 16 16"><path d="M8 10.5v-8M4.5 6L8 2.5 11.5 6M2.5 13.5h11"/></svg>Import</button>
      <button type="button" class="btn go" id="sy"><svg class="i" viewBox="0 0 16 16"><path d="M2.5 7a5.5 5.5 0 0 1 10-2.2M13.5 2.5v2.5H11M13.5 9a5.5 5.5 0 0 1-10 2.2M2.5 13.5V11H5"/></svg>Sinkronisasi Data</button>
    </div>
  </div>

  <div class="stats">
    <div class="st"><span>Aktif</span><b id="sa"></b></div>
    <div class="st"><span>Tidak aktif</span><b id="sn"></b></div>
  </div>

  <div class="box">
    <div class="tl">
      <div class="sw"><svg class="i" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg><input class="fld" id="q" type="search" placeholder="Cari nama, NIK, email, rekening, atau telepon" autocomplete="off"></div>
      <div class="seg" id="sg"><button type="button" data-f="all">Semua</button><button type="button" data-f="aktif" class="on">Aktif</button><button type="button" data-f="off">Tidak aktif</button></div>
      <select class="fld srt" id="sr" aria-label="Urutkan"></select>
    </div>
    <table>
      <thead><tr>
        <th class="s" data-k="nama">Pegawai<span class="so"></span></th>
        <th class="s" data-k="nik">NIK<span class="so"></span></th>
        <th class="s" data-k="rek">No. Rekening<span class="so"></span></th>
        <th class="s" data-k="aktif">Status<span class="so"></span></th>
        <th class="s r" data-k="gaji">Gaji Pokok<span class="so"></span></th>
        <th>Aksi</th>
      </tr></thead>
      <tbody id="tb"></tbody>
    </table>
  </div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
