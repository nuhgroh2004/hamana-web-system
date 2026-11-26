<div id="payroll-generate-payroll">
<!-- Halaman Generate Payroll tanpa sidebar/navbar. Pasang di dalam layout sistem Anda.
     Event "payroll-generate" (detail = data riwayat) dikirim saat Generate/Simpan, "payroll-delete" saat hapus.
     Ganti USER dengan nama user yang sedang login. -->
<div class="pg">
  <h1>Generate Payroll</h1>
  <p class="ds">Membuat data payroll berdasarkan rentang tanggal periode</p>

  <div class="box">
    <div class="hd"><span id="ttl">Periode Payroll</span><span class="lbl"><svg class="i" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/></svg><span id="bln"></span></span></div>
    <div class="bd">
      <div class="f"><label for="dr">Dari Tanggal</label><input class="fld" type="date" id="dr"></div>
      <div class="f"><label for="sd">Sampai Tanggal</label><input class="fld" type="date" id="sd"></div>
      <button type="button" class="btn go" id="go"><svg class="i" viewBox="0 0 16 16"><path d="M4 2.5l9 5.5-9 5.5z"/></svg><span id="gt">Generate</span></button>
    </div>
    <div class="hint">Default: tanggal 15 bulan lalu sampai tanggal 16 bulan ini.</div>
  </div>

  <div class="box" style="margin-bottom:0">
    <div class="hd"><span>Riwayat Generate</span></div>
    <table>
      <thead><tr><th class="ac">Aksi</th><th>Di-generate Oleh</th><th>Periode</th><th>Label Bulan</th><th>Waktu Generate</th></tr></thead>
      <tbody id="tb"></tbody>
    </table>
  </div>
</div>

<div class="menu" id="mn" hidden>
  <button type="button" data-a="view"><svg class="i" viewBox="0 0 16 16"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>View</button>
  <button type="button" data-a="edit"><svg class="i" viewBox="0 0 16 16"><path d="M10.5 2.5l3 3-8 8H2.5v-3z"/></svg>Edit</button>
  <hr>
  <button type="button" class="rm" data-a="del"><svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 7v4"/></svg>Hapus</button>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
