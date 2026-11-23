<div id="hitung-berangkat">
    <div class="pg">
        <h1>Hitung Berangkat</h1>
        <p class="sub" id="periode">Memuat data…</p>

        <div class="toolbar box">
            <label>Bulan
                <input type="month" id="bulan" value="{{ now()->format('Y-m') }}">
            </label>
            <label>Dari tanggal
                <input type="date" id="dari">
            </label>
            <label>Sampai tanggal
                <input type="date" id="sampai">
            </label>
            <label>Departemen
                <select id="departemen"><option value="">Semua departemen</option></select>
            </label>
            <label class="grow">Cari nama atau NIK
                <input type="search" id="cari" placeholder="Ketik untuk menyaring">
            </label>
            <button type="button" class="btn pri" id="muat">Muat data</button>
        </div>

        <div id="pesan"></div>
        <div class="stats" id="stats" hidden></div>

        <div id="konten" hidden>
            <div class="tabs" role="tablist">
                <button type="button" role="tab" id="tab-hariini" aria-selected="true">Hari Ini</button>
                <button type="button" role="tab" id="tab-tabel" aria-selected="false">Tabel</button>
                <button type="button" role="tab" id="tab-grafik" aria-selected="false">Grafik</button>
                <button type="button" role="tab" id="tab-rekap" aria-selected="false">Rekap</button>
            </div>

            <section id="panel-hariini">
                <div id="info-libur-hariini" class="hb-libur-info" hidden></div>
                <div class="table-wrap box">
                    <table>
                        <thead>
                            <tr>
                                <th>NIK</th>
                                <th>Nama</th>
                                <th>Departemen</th>
                                <th>Jam masuk</th>
                                <th>Status masuk</th>
                                <th>Jam keluar</th>
                                <th>Status keluar</th>
                                <th>Status absensi</th>
                                <th>Keterangan</th>
                            </tr>
                        </thead>
                        <tbody id="isi-hariini"></tbody>
                    </table>
                </div>
            </section>

            <section id="panel-tabel" hidden>
                <div class="table-wrap box">
                    <table>
                        <thead>
                            <tr>
                                <th>NIK</th>
                                <th>Nama</th>
                                <th>Departemen</th>
                                <th class="num">Berangkat</th>
                                <th class="num">Terlambat</th>
                                <th class="num">Tidak lengkap</th>
                                <th class="num">Libur</th>
                            </tr>
                        </thead>
                        <tbody id="isi"></tbody>
                    </table>
                </div>
            </section>

            <section id="panel-grafik" hidden>
                <div class="chart box">
                    <h2 id="jdl-harian">Tren harian</h2>
                    <div class="legend">
                        <span><i class="i-info"></i>Berangkat</span>
                        <span><i class="i-warn"></i>Terlambat masuk</span>
                        <span><i class="i-bad"></i>Tidak lengkap</span>
                    </div>
                    <div id="g-harian"></div>
                </div>
                <div class="chart box">
                    <div class="chart-head">
                        <h2 id="jdl-bulanan">Perbandingan bulanan</h2>
                        <label>Yang dibandingkan
                            <select id="metrik">
                                <option value="berangkat">Berangkat (%)</option>
                                <option value="tidak">Absensi tidak lengkap (%)</option>
                                <option value="terlambat">Terlambat masuk (jumlah)</option>
                            </select>
                        </label>
                    </div>
                    <div class="legend" id="leg-bulanan"></div>
                    <div style="overflow-x:auto" id="g-bulanan"></div>
                </div>
                <div class="chart box">
                    <h2 id="jdl-karyawan">Per karyawan</h2>
                    <div class="legend">
                        <span><i class="i-info"></i>Berangkat</span>
                        <span>Angka di kanan: berangkat · terlambat</span>
                    </div>
                    <div class="scroll" id="g-karyawan"></div>
                </div>
            </section>

            <section id="panel-rekap" hidden>
                <div class="toolbar box">
                    <label>Jenis rekap
                        <select id="mode-rekap">
                            <option value="bulanan">Bulanan</option>
                            <option value="tahunan">Tahunan</option>
                        </select>
                    </label>
                    <span class="grow"></span>
                    <button type="button" class="btn" id="laporan-terpilih" disabled>Laporan karyawan</button>
                    <button type="button" class="btn" id="unduh-xlsx">Unduh Excel</button>
                    <button type="button" class="btn pri" id="unduh-pdf">Unduh PDF</button>
                </div>
                <div id="pesan-rekap"></div>
                <p class="hint-lap">Klik dua kali baris pada "Rekap per karyawan" untuk melihat laporan absensinya. Centang beberapa baris untuk menyiapkan beberapa laporan sekaligus.</p>
                <div id="rekap-isi"></div>
            </section>
        </div>
    </div>

    <!-- Modal edit absen manual (double-klik baris detail di tab Tabel) -->
    <div class="hb-ov" id="hbEdit"><div class="hb-md">
        <div class="hb-h"><h2 id="hbEdT"></h2><button type="button" data-x aria-label="Tutup">✕</button></div>
        <div class="hb-b">
            <div class="hb-info" id="hbEdWho"></div>
            <div class="hb-g2">
                <div><label>Jam masuk<input type="time" id="hbEdJM" step="1"></label></div>
                <div><label>Jam keluar<input type="time" id="hbEdJK" step="1"></label></div>
            </div>
            <p class="hb-note">Kosongkan jam untuk menghapusnya. Status dihitung ulang otomatis — masuk lewat <b>08:00</b> jadi Terlambat, keluar sebelum <b>17:00</b> jadi Pulang Lebih Awal. Perubahan tersimpan di database dan langsung terpakai di halaman <b>/input/absen</b> serta halaman absensi lainnya.</p>
        </div>
        <div class="hb-f"><button type="button" class="btn" data-x>Batal</button><button type="button" class="btn pri" id="hbEdSave">Simpan</button></div>
    </div></div>

    <!-- Modal laporan absensi per karyawan (double-klik baris Rekap per karyawan) -->
    <div class="hb-ov" id="hbLaporan"><div class="hb-md hb-lap">
        <div class="hb-h"><h2 id="hbLapT">Laporan Absensi Karyawan</h2><button type="button" data-x aria-label="Tutup">✕</button></div>
        <div class="hb-b">
            <div class="hb-lap-bar" id="hbLapBar" hidden>
                <label>Karyawan<select id="hbLapPilih"></select></label>
                <span class="grow"></span>
                <span class="hb-lap-status" id="hbLapStatus"></span>
                <button type="button" class="btn pri" id="hbLapPdf">Unduh PDF</button>
                <button type="button" class="btn" id="hbLapXlsx">Unduh Excel</button>
                <button type="button" class="btn" id="hbLapPdfAll" hidden>Unduh semua PDF</button>
                <button type="button" class="btn" id="hbLapXlsxAll" hidden>Unduh semua Excel</button>
            </div>
            <div id="hbLapIsi" class="hb-lap-isi"></div>
            <p class="hb-note">H0 = jumlah hari kerja normal (bukan hari libur/cuti). Shif HO menandai hari yang ada tap, HW hari tanpa tap. W In = jumlah hari masuk. L = jumlah kejadian berstatus Terlambat; LA = akumulasi kolom Late. GE = jumlah pulang lebih awal yang sah; GEA = akumulasi kolom Go Early (keluar sebelum 17:00; tap ganda pagi dan shift malam tidak dihitung). Kolom Working, Normal, Late, dan Go Early dihitung otomatis dari jam absen. Kolom Overtime belum punya sumber data, jadi dikosongkan.</p>
        </div>
    </div></div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
