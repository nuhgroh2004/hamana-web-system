<div id="input-cuti-dan-sakit">
    <form class="pg" id="fm" autocomplete="off">
        <div class="stage" id="stage">
            <div class="fit">
                <div class="paper">
                    <div class="hd">
                        <img src="{{ asset('assets/logo-hamana-forms.png') }}" alt="Hamana Works">
                        <h1>FORMULIR PERMINTAAN CUTI / SAKIT</h1>
                    </div>

                    <div class="cb">
                        <label class="cbx"><input type="checkbox" name="jenis" value="Cuti Fullday">Cuti Fullday</label>
                        <label class="cbx"><input type="checkbox" name="jenis" value="Cuti Halfday">Cuti Halfday</label>
                    </div>

                    <div class="rw p">
                        <label for="t1">Tanggal Cuti / Sakit</label>
                        <span>:</span>
                        <input class="u" id="t1" name="tgl_mulai" type="date" required>
                        <label class="sm" for="t2">Sampai</label>
                        <input class="u" id="t2" name="tgl_sampai" type="date">
                    </div>
                    <div class="rw p">
                        <label for="w1">Waktu</label>
                        <span>:</span>
                        <input class="u" id="w1" name="waktu_mulai" type="time">
                        <label class="sm" for="w2">Sampai</label>
                        <input class="u" id="w2" name="waktu_sampai" type="time">
                    </div>
                    <div class="rw">
                        <label for="k1">Tanggal Kembali Kerja</label>
                        <span>:</span>
                        <input class="u" id="k1" name="tgl_kembali" type="date" required>
                    </div>
                    <div class="rw">
                        <label for="k2">Waktu</label>
                        <span>:</span>
                        <input class="u" id="k2" name="waktu_kembali" type="time">
                    </div>
                    <div class="rw">
                        <label for="kp">Untuk Keperluan</label>
                        <span>:</span>
                        <select class="u" id="kp" name="keperluan" required>
                            <option value="" selected hidden></option>
                            <option>Sakit</option>
                            <option>Lainnya</option>
                        </select>
                    </div>
                    <div class="rw" id="lain" hidden>
                        <label for="kt">Keterangan</label>
                        <span>:</span>
                        <input class="u" id="kt" name="keterangan_lain" type="text" placeholder="Tulis keperluan cuti">
                    </div>

                    <div class="rd" id="sk">
                        <label class="rdo"><input type="radio" name="surat" value="Sertakan surat dokter">Sertakan surat dokter</label>
                        <label class="rdo"><input type="radio" name="surat" value="Surat dokter menyusul">Surat dokter menyusul</label>
                    </div>

                    <p class="kt">Keterangan</p>
                    <ol>
                        <li>
                            <span>1.</span>
                            <div>
                                <label for="al">Selama menjalankan cuti / sakit saya beralamat di :</label>
                                <textarea class="u" id="al" name="alamat" rows="2"></textarea>
                            </div>
                        </li>
                        <li>
                            <span>2.</span>
                            <p>Apabila dalam 5 (lima) hari sejak tanggal tersebut saya tidak kembali tanpa pemberitahuan dan alasan yang kuat, maka saya dianggap telah mengundurkan diri dari perusahaan.</p>
                        </li>
                    </ol>

                    <div class="sg">
                        <div class="col">
                            <p class="ttl">Diketahui / disetujui :<br>Kepala Unit / Bagian</p>
                            <div class="sigx" aria-hidden="true"></div>
                            <div class="par">
                                <span>(</span>
                                <input class="u c" id="n1" name="atasan_nama" type="text" placeholder="Nama jelas">
                                <span>)</span>
                            </div>
                            <div class="rw">
                                <label for="d1">Tanggal</label>
                                <span>:</span>
                                <input class="u" id="d1" name="atasan_tanggal" type="date">
                            </div>
                        </div>
                        <div class="col">
                            <div class="rw">
                                <label for="en">Nama</label>
                                <span>:</span>
                                <input class="u" id="en" readonly>
                            </div>
                            <div class="rw">
                                <label for="eb">Bagian</label>
                                <span>:</span>
                                <input class="u" id="eb" readonly>
                            </div>
                            <div class="rw">
                                <label for="ek">NIK</label>
                                <span>:</span>
                                <input class="u" id="ek" readonly>
                            </div>
                            <div class="sigw">
                                <button type="button" class="sigb" id="sb" aria-haspopup="listbox" aria-label="Pilih tanda tangan">Pilih tanda tangan</button>
                                <div class="mn" id="mn" role="listbox" hidden>
                                    <b>Pilih Tanda Tangan</b>
                                    <button type="button" role="option" id="mo">
                                        <span class="th"></span>
                                        <span id="mnm"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="par">
                                <span>(</span>
                                <input class="u c" id="n2" name="nama_jelas" type="text" placeholder="Nama jelas">
                                <span>)</span>
                            </div>
                            <div class="rw">
                                <label for="d2">Tanggal</label>
                                <span>:</span>
                                <input class="u" id="d2" name="tanggal_ttd" type="date">
                            </div>
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
            <button type="submit" class="btn go" id="kirim">Kirim Pengajuan</button>
        </div>
    </form>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
