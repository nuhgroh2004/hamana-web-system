<div id="input-cuti-dan-sakit">
    <div class="pg">
        <h1>Input Cuti dan Sakit</h1>
        <p class="ds">Klik baris karyawan untuk mengisi. Centang untuk aksi massal.</p>

        <div class="tbar">
            <label class="srch">
                <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
                <input class="fld" id="q" type="search" placeholder="Cari nama / NIK / departemen…" autocomplete="off" aria-label="Cari nama / NIK / departemen">
            </label>
            <div class="acts">
                <button type="button" class="btn" id="bExp">
                    <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M5 7l3 3 3-3M3 13h10"/></svg>
                    Export Excel
                </button>
                <button type="button" class="btn" id="bImp">
                    <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14V6M5 9l3-3 3 3M3 3h10"/></svg>
                    Import Excel
                </button>
                <button type="button" class="btn" id="bAdd" disabled>
                    <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>
                    <span id="bAddTxt">Tambah jatah cuti (0 dipilih)</span>
                </button>
                <button type="button" class="btn" id="bSet">
                    <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="2.2"/><path d="M8 1.8v2M8 12.2v2M1.8 8h2M12.2 8h2M3.6 3.6l1.4 1.4M11 11l1.4 1.4M12.4 3.6L11 5M5 11l-1.4 1.4"/></svg>
                    Pengaturan aturan cuti
                </button>
            </div>
        </div>

        <div id="pesImp"></div>

        <div class="box">
            <div class="tw" id="tw">
                <table class="rt">
                    <thead>
                        <tr>
                            <th class="c"><input type="checkbox" id="all" aria-label="Pilih semua karyawan"></th>
                            <th>NIK</th>
                            <th>Nama</th>
                            <th>Departemen</th>
                            <th>Jabatan</th>
                            <th>Posisi</th>
                            <th>Cuti terpakai</th>
                            <th>Periode</th>
                            <th>Berlaku sampai</th>
                        </tr>
                    </thead>
                    <tbody id="rows"></tbody>
                </table>
            </div>
            <div class="empty" id="empty" hidden>Tidak ada data</div>
            <div class="ft">
                <span id="pTxt"></span>
                <div class="pgn">
                    <button type="button" class="btn sm" id="bPrev" disabled>‹ Sebelumnya</button>
                    <button type="button" class="btn sm" id="bNext" disabled>Berikutnya ›</button>
                </div>
            </div>
        </div>

        <p class="note">Format <b>terpakai/hak</b>: hak cuti dan yang sudah terpakai disimpan terpisah di database per karyawan; pemakaian dipotong dari hak yang paling cepat kadaluarsa. Hak cuti diinput manual lewat “+ Tambah jatah cuti”. Data karyawan, cuti, dan hak cuti tersimpan di server dan terhubung ke data master pegawai.</p>
    </div>

    <!-- Modal input -->
    <div class="ov" id="mIn" hidden>
        <div class="md lg" role="dialog" aria-modal="true" aria-labelledby="inT">
            <div class="mh">
                <h2 id="inT"></h2>
                <button type="button" class="mx" data-x aria-label="Tutup">✕</button>
            </div>
            <div class="mb">
                <div id="inBal"></div>

                <label for="jenis">Jenis</label>
                <select class="fld" id="jenis">
                    <optgroup label="Cuti">
                        <option value="Cuti Tahunan">Cuti Tahunan — mengurangi hak cuti</option>
                        <option value="Cuti Setengah Hari">Cuti Setengah Hari — mengurangi hak cuti</option>
                        <option value="Cuti Alasan Penting">Cuti Alasan Penting — tidak mengurangi hak cuti</option>
                        <option value="Cuti Haid">Cuti Haid (Full Day) — tidak mengurangi hak cuti</option>
                        <option value="Cuti Haid Setengah Hari">Cuti Haid (Setengah Hari) — tidak mengurangi hak cuti</option>
                        <option value="Cuti Melahirkan">Cuti Melahirkan — tidak mengurangi hak cuti</option>
                    </optgroup>
                    <optgroup label="Sakit">
                        <option value="Sakit">Sakit (Full Day) — mengurangi hak cuti</option>
                        <option value="Sakit Setengah Hari">Sakit (Setengah Hari) — mengurangi hak cuti</option>
                        <option value="Sakit Dengan Surat Dokter">Sakit (Full Day, dengan surat dokter) — tidak mengurangi hak cuti</option>
                        <option value="Sakit Setengah Hari Dokter">Sakit (Setengah Hari, dengan surat dokter) — tidak mengurangi hak cuti</option>
                    </optgroup>
                </select>

                <div class="g2">
                    <div>
                        <label for="d1" id="lD1">Tanggal mulai</label>
                        <input class="fld" type="date" id="d1">
                    </div>
                    <div id="wD2">
                        <label for="d2">Tanggal selesai</label>
                        <input class="fld" type="date" id="d2">
                    </div>
                    <div id="wJ1" hidden>
                        <label for="j1" id="lJ1">Jam mulai</label>
                        <input class="fld" type="time" id="j1">
                    </div>
                    <div id="wJ2" hidden>
                        <label for="j2" id="lJ2">Jam selesai</label>
                        <input class="fld" type="time" id="j2">
                    </div>
                </div>

                <div id="wTuj" hidden>
                    <label for="tuj">Tujuan dinas</label>
                    <input class="fld" id="tuj">
                </div>

                <div class="info" id="calc"></div>
                <div id="inRiwayat"></div>
            </div>
            <div class="mf">
                <button type="button" class="btn" data-x>Batal</button>
                <button type="button" class="btn go" id="bSave">Simpan</button>
            </div>
        </div>
    </div>

    <!-- Modal tambah jatah -->
    <div class="ov" id="mAdd" hidden>
        <div class="md" role="dialog" aria-modal="true" aria-labelledby="addT">
            <div class="mh">
                <h2 id="addT">Tambah jatah cuti</h2>
                <button type="button" class="mx" data-x aria-label="Tutup">✕</button>
            </div>
            <div class="mb">
                <div class="info" id="addWho"></div>

                <div class="g2">
                    <div>
                        <label for="aOp">Operasi</label>
                        <select class="fld" id="aOp">
                            <option value="tambah">Tambah hak cuti</option>
                            <option value="kurang">Kurang hak cuti</option>
                        </select>
                    </div>
                    <div>
                        <label for="aAmt">Jumlah hari</label>
                        <input class="fld" type="number" id="aAmt" value="1" min="0.5" step="0.5">
                    </div>
                    <div>
                        <label for="aVal">Berlaku (bulan)</label>
                        <input class="fld" type="number" id="aVal" min="1">
                    </div>
                </div>

                <label for="aNote">Alasan / catatan</label>
                <input class="fld" id="aNote" placeholder="mis. Bonus kinerja, cuti bersama">
            </div>
            <div class="mf">
                <button type="button" class="btn" data-x>Batal</button>
                <button type="button" class="btn go" id="aSave">Tambahkan</button>
            </div>
        </div>
    </div>

    <!-- Modal pengaturan -->
    <div class="ov" id="mSet" hidden>
        <div class="md" role="dialog" aria-modal="true" aria-labelledby="setT">
            <div class="mh">
                <h2 id="setT">Pengaturan aturan cuti</h2>
                <button type="button" class="mx" data-x aria-label="Tutup">✕</button>
            </div>
            <div class="mb">
                <h3 class="sh">Karyawan baru (hak cuti pertama)</h3>
                <label for="sWait">Masa tunggu hak pertama (bulan sejak tanggal masuk)</label>
                <input class="fld" type="number" id="sWait" min="0">
                <div class="g2">
                    <div>
                        <label for="sFQ">Jatah pertama (hari)</label>
                        <input class="fld" type="number" id="sFQ" min="0" step="0.5">
                    </div>
                    <div>
                        <label for="sFV">Masa berlaku jatah pertama (bulan)</label>
                        <input class="fld" type="number" id="sFV" min="1">
                    </div>
                </div>

                <h3 class="sh">Semua karyawan (awal tahun, 1 Januari)</h3>
                <div class="g2">
                    <div>
                        <label for="sYQ">Jatah tiap awal tahun (hari)</label>
                        <input class="fld" type="number" id="sYQ" min="0" step="0.5">
                    </div>
                    <div>
                        <label for="sYV">Masa berlaku (bulan)</label>
                        <input class="fld" type="number" id="sYV" min="1">
                    </div>
                    <div>
                        <label for="sYX">Perpanjangan (bulan)</label>
                        <input class="fld" type="number" id="sYX" min="0">
                    </div>
                </div>

                <label for="sEff">Tanggal mulai berlaku</label>
                <input class="fld" type="date" id="sEff">

                <div class="info" id="sEx"></div>
                <p class="note">Perubahan aturan berlaku sejak <b>Tanggal mulai berlaku</b> dan <b>tidak mengubah riwayat Hak cuti</b> yang sudah tersimpan — hanya baris hak cuti baru (otomatis/manual) yang memakai aturan baru.</p>
            </div>
            <div class="mf">
                <button type="button" class="btn" data-x>Batal</button>
                <button type="button" class="btn go" id="sSave">Simpan</button>
            </div>
        </div>
    </div>

    <!-- Modal import -->
    <div class="ov" id="mImp" hidden>
        <div class="md" role="dialog" aria-modal="true" aria-labelledby="impT">
            <div class="mh">
                <h2 id="impT">Import Excel cuti dan sakit</h2>
                <button type="button" class="mx" data-x aria-label="Tutup">✕</button>
            </div>
            <div class="mb">
                <p class="note top">File <b>.xlsx</b> dengan dua sheet: <b>Riwayat Cuti</b> (kolom: NIK, Nama, Jenis, Tanggal Mulai, Tanggal Selesai, Jam Mulai, Jam Selesai, Tujuan) dan <b>Hak Cuti</b> (kolom: NIK, Nama, Tanggal, Jumlah, Masa Berlaku, Berlaku Sampai, Catatan). Karyawan dicocokkan lewat NIK; jika tidak ada, lewat nama. Baris yang sudah ada (NIK + jenis + tanggal sama) diperbarui, bukan dobel. “Terpakai” dihitung ulang otomatis.</p>

                <label for="impFile">File Excel</label>
                <input class="fld file" type="file" id="impFile" accept=".xlsx,.xls">
                <div id="impPesan"></div>
            </div>
            <div class="mf">
                <button type="button" class="btn" data-x>Batal</button>
                <button type="button" class="btn go" id="impGo">Import</button>
            </div>
        </div>
    </div>
</div>
