<div id="izin-keluar-kantor">
    <form class="pg" id="fm" autocomplete="off">
        <div class="stage" id="stage">
            <div class="fit">
                <div class="paper">
                    <div class="hd">
                        <img src="{{ asset('assets/logo-hamana-forms.png') }}" alt="Hamana Works">
                    </div>

                    <h1 class="tt">SURAT IZIN KELUAR KANTOR</h1>
                    <p class="jus">Yang bertanda tangan di bawah ini, dengan ini memberikan izin kepada tersebut karyawan yang namanya tertera di bawah ini untuk izin keluar kantor pada jam kerja:</p>

                    <div class="rw">
                        <label for="en">Nama Karyawan</label>
                        <span>:</span>
                        <input class="u" id="en" readonly>
                    </div>
                    <div class="rw">
                        <label for="jb">Jabatan</label>
                        <span>:</span>
                        <input class="u" id="jb" readonly>
                    </div>
                    <div class="rw">
                        <label for="hr">Hari/Tanggal</label>
                        <span>:</span>
                        <div class="dp">
                            <input class="u" id="hv" type="text" readonly tabindex="-1" aria-hidden="true">
                            <svg class="i" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/></svg>
                            <input id="hr" name="tanggal" type="date" required aria-label="Hari/Tanggal">
                        </div>
                    </div>
                    <div class="rw p">
                        <label for="j1">Jam Keluar /Masuk</label>
                        <span>:</span>
                        <input class="u" id="j1" name="jam_keluar" type="time" required>
                        <label class="sm" for="j2">/</label>
                        <input class="u" id="j2" name="jam_masuk" type="time">
                    </div>
                    <div class="rw">
                        <label for="tj">Tujuan</label>
                        <span>:</span>
                        <input class="u" id="tj" name="tujuan" type="text" required>
                    </div>
                    <div class="rw">
                        <label class="wr" for="kd">Kendaraan yang Digunakan</label>
                        <span>:</span>
                        <select class="u" id="kd" name="kendaraan" required>
                            <option value="" selected hidden>(pilih satu)</option>
                            <option>Motor</option>
                            <option>Mobil</option>
                            <option>Kendaraan Umum</option>
                            <option>Lainnya</option>
                        </select>
                    </div>

                    <div class="sg">
                        <div class="col">
                            <p class="cap">Karyawan,</p>
                            <div class="sgz">
                                <button type="button" class="sigb" id="sb" aria-haspopup="listbox" aria-label="Pilih tanda tangan">Pilih tanda tangan</button>
                                <div class="mn" id="mn" role="listbox" hidden>
                                    <b>Pilih Tanda Tangan</b>
                                    <button type="button" role="option" id="mo">
                                        <span class="th"></span>
                                        <span id="mnm"></span>
                                    </button>
                                </div>
                                <div class="par">
                                    <span>(</span>
                                    <input class="u c" id="n2" name="nama_jelas" type="text" placeholder="Nama jelas">
                                    <span>)</span>
                                </div>
                            </div>
                            <p class="cap">Pemohon Izin</p>
                        </div>
                        <div class="col">
                            <p class="cap">Atasan Langsung,</p>
                            <div class="sgz">
                                <div class="par">
                                    <span>(</span>
                                    <input class="u c" id="n1" name="atasan_nama" type="text" placeholder="Nama jelas">
                                    <span>)</span>
                                </div>
                            </div>
                            <p class="cap">Pemberi Izin</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card att">
            <div class="ch">
                <h2 class="h">
                    <svg class="i" viewBox="0 0 16 16"><path d="M13 7.5l-5 5a3.2 3.2 0 01-4.5-4.5l5.5-5.5a2.1 2.1 0 013 3L6.5 11a1 1 0 01-1.5-1.5L10 4.5"/></svg>
                    Lampiran
                </h2>
                <span class="bdg" id="cnt">0 / 10 berkas</span>
            </div>
            <div class="cbd">
                <p class="note">Opsional. JPG, PNG, atau PDF. Maksimal 5 MB per berkas — foto besar otomatis dikompres.</p>
                <label class="opt"><input type="checkbox" id="ms">Lampiran akan menyusul</label>
                <div class="row">
                    <button type="button" class="btn bl" id="pb">Pilih Berkas</button>
                    <button type="button" class="btn" id="fb">
                        <svg class="i" viewBox="0 0 16 16"><path d="M2 5h2.5L6 3h4l1.5 2H14v8H2z"/><circle cx="8" cy="9" r="2.4"/></svg>
                        Ambil Foto
                    </button>
                </div>
                <input type="file" id="fp" accept="image/jpeg,image/png,application/pdf" multiple hidden>
                <input type="file" id="fc" accept="image/*" capture="environment" hidden>
                <p class="err" id="fe" hidden></p>
                <div class="fls" id="fls"></div>
                <p class="em" id="fem">Belum ada lampiran dipilih.</p>
            </div>
        </div>

        <div class="acts">
            <button type="button" class="btn" id="cetak">Cetak</button>
            <button type="button" class="btn" id="draft">Simpan Draft</button>
            <button type="submit" class="btn go" id="kirim">Pilih Penerima</button>
        </div>
    </form>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
