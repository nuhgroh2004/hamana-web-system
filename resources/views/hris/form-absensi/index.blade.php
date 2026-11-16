<div id="form-absensi">
    <form class="pg" id="fm" autocomplete="off">
        <div class="stage" id="stage">
            <div class="fit">
                <div class="paper dk fa">
                    <div class="frm">
                        <div class="hd">
                            <img src="{{ asset('assets/logo-hamana-forms.png') }}" alt="Hamana Works">
                            <h1>FORM ABSENSI</h1>
                        </div>

                        <div class="ib" role="radiogroup" aria-label="Jenis absensi">
                            <p>PILIH SALAH SATU BILA :</p>
                            <label class="cbx"><input type="radio" name="jenis" value="cuti_haid" required>1. CUTI HAID (KHUSUS KARYAWATI)</label>
                            <label class="cbx"><input type="radio" name="jenis" value="mesin_error">2. MESIN ABSENSI ERROR</label>
                            <label class="cbx"><input type="radio" name="jenis" value="lupa_absen">3. TIDAK ABSEN / LUPA ABSEN</label>
                        </div>

                        <div class="rw">
                            <label for="en">NAMA</label>
                            <span>:</span>
                            <input class="u dt" id="en" name="nama" readonly>
                        </div>
                        <div class="rw">
                            <label for="bg">DIVISI</label>
                            <span>:</span>
                            <input class="u dt" id="bg" name="divisi" type="text" required>
                        </div>
                        <div class="rw">
                            <label for="ps">POSISI</label>
                            <span>:</span>
                            <input class="u dt" id="ps" name="posisi" type="text" required>
                        </div>
                        <div class="rw">
                            <label for="tgl">TANGGAL</label>
                            <span>:</span>
                            <input class="u dt" id="tgl" name="tanggal" type="date" required>
                        </div>
                        <div class="rw">
                            <label for="jam">JAM</label>
                            <span>:</span>
                            <input class="u dt" id="jam" name="jam" type="time" required>
                        </div>
                        <div class="rw top">
                            <label for="als">ALASAN</label>
                            <span>:</span>
                            <textarea class="u dt" id="als" name="alasan" rows="1" required></textarea>
                        </div>

                        <div class="sg2">
                            <div class="col">
                                <p class="cap">Diajukan oleh,</p>
                                <div class="sgz">
                                    <button type="button" class="sigb" id="sb" aria-haspopup="listbox" aria-label="Pilih tanda tangan">Pilih tanda tangan</button>
                                    <div class="mn" id="mn" role="listbox" hidden>
                                        <b>Pilih Tanda Tangan</b>
                                        <button type="button" role="option" id="mo">
                                            <span class="th"></span>
                                            <span id="mnm"></span>
                                        </button>
                                    </div>
                                </div>
                                <input class="u dt" id="n2" name="pengaju_nama" type="text" aria-label="Nama pengaju">
                            </div>
                            <div class="col r">
                                <p class="cap">Disetujui oleh,<br>Kepala Bagian</p>
                                <div class="ln"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="acts">
            <button type="button" class="btn" id="cetak">Cetak</button>
            <button type="button" class="btn" id="draft">Simpan Draft</button>
            <button type="submit" class="btn go" id="kirim">Kirim Pengajuan</button>
        </div>
    </form>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
