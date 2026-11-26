<div id="payroll-pengaturan-bpjs-kesehatan">
<!-- Halaman Pengaturan BPJS Kesehatan tanpa sidebar/navbar. Pasang di dalam layout sistem Anda.
     Event "bpjs-kes-save" (detail = objek pengaturan) dikirim saat tombol Simpan ditekan. -->
<div class="pg">
  <h1>Pengaturan BPJS Kesehatan</h1>
  <p class="ds">Nilai persentase diisi dalam bentuk angka, mis. 0.04 untuk 4%.</p>

  <div class="box">
    <div class="hd">Iuran</div>
    <div class="bd" id="iuran"></div>
  </div>

  <div class="box">
    <div class="hd">Batas upah &amp; periode</div>
    <div class="bd">
      <div class="f" data-f="batas"><label for="batas">Batas Atas Upah<i>*</i></label>
        <div class="ig"><span class="l">Rp</span><input class="fld" id="batas" inputmode="numeric" autocomplete="off"></div><div class="er"></div></div>
      <div class="f" data-f="bulan"><label for="bulan">Bulan Mulai<i>*</i></label><select class="fld" id="bulan"></select><div class="er"></div></div>
      <div class="f" data-f="tahun"><label for="tahun">Tahun Mulai<i>*</i></label><select class="fld" id="tahun"></select><div class="er"></div></div>
      <p class="note">Perubahan berlaku untuk payroll pada periode yang dipilih.</p>
    </div>
  </div>

  <div class="act"><button type="button" class="btn go" id="sv"><svg class="i" viewBox="0 0 16 16"><path d="M2.5 2.5h9l2 2v9h-11zM5 2.5v3.5h5V2.5M5 13.5V9h6v4.5"/></svg>Simpan</button></div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
