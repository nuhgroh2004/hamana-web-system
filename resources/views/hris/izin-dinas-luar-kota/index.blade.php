<div id="izin-dinas-luar-kota">
    <form class="pg" id="fm" autocomplete="off">
        <div class="stage" id="stage">
            <div class="fit">
                <div class="paper dk">
                    <div class="frm">
                        <div class="hd">
                            <img src="{{ asset('assets/logo-hamana-forms.png') }}" alt="Hamana Works">
                        </div>

                        <h1 class="tt">SURAT PERINTAH TUGAS</h1>

                        <p class="no">
                            <b>NO :</b>
                            <input class="u dt" name="nomor" type="text" aria-label="Nomor surat">
                        </p>

                        <p class="jus">Kami yang bertanda tangan di bawah ini, Direksi/General Manager/Kepala Departemen/Product Manager/Kepala Bagian/Area Manager PT. Hamana Works Indonesia, menerangkan bahwa :</p>

                        <div class="nj">
                            <div class="rw">
                                <label for="en">Nama</label>
                                <span>:</span>
                                <input class="u dt" id="en" readonly>
                            </div>
                            <div class="rw">
                                <label for="jb">Jabatan</label>
                                <span>:</span>
                                <input class="u dt" id="jb" readonly>
                            </div>
                        </div>

                        <p class="jus">Untuk melaksanakan Tugas Perjalanan Dinas Dalam Negeri/Luar Negeri</p>

                        <p class="sh">Detail Acara (Itinerary):</p>
                        <table class="tb" id="it">
                            <colgroup>
                                <col style="width: 36px">
                                <col>
                                <col style="width: 184px">
                                <col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Tempat yang dikunjungi</th>
                                    <th>Hari, Tanggal dan Waktu keberangkatan</th>
                                    <th>Keperluan</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="n">1</td>
                                    <td><textarea aria-label="Tempat yang dikunjungi 1"></textarea></td>
                                    <td>
                                        <input type="date" aria-label="Tanggal keberangkatan 1">
                                        <input type="time" aria-label="Waktu keberangkatan 1">
                                    </td>
                                    <td><textarea aria-label="Keperluan 1"></textarea></td>
                                </tr>
                                <tr>
                                    <td class="n">2</td>
                                    <td><textarea aria-label="Tempat yang dikunjungi 2"></textarea></td>
                                    <td>
                                        <input type="date" aria-label="Tanggal keberangkatan 2">
                                        <input type="time" aria-label="Waktu keberangkatan 2">
                                    </td>
                                    <td><textarea aria-label="Keperluan 2"></textarea></td>
                                </tr>
                                <tr>
                                    <td class="n">3</td>
                                    <td><textarea aria-label="Tempat yang dikunjungi 3"></textarea></td>
                                    <td>
                                        <input type="date" aria-label="Tanggal keberangkatan 3">
                                        <input type="time" aria-label="Waktu keberangkatan 3">
                                    </td>
                                    <td><textarea aria-label="Keperluan 3"></textarea></td>
                                </tr>
                            </tbody>
                        </table>

                        <p class="jus">Demikian Surat Perintah Tugas ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
                        <p class="jus">Atas perhatian dan kerjasamanya, kami mengucapkan terima kasih.</p>
                        <p class="tg">Tegal,<input class="u dt" id="tg" name="tanggal" type="date" required aria-label="Tanggal surat"></p>

                        <div class="sg">
                            <div class="col">
                                <p class="cap">Pemberi Tugas,</p>
                                <div class="sgz">
                                    <div class="par">
                                        <span>(</span>
                                        <input class="u c" id="n1" name="pemberi_nama" type="text" placeholder="Nama jelas">
                                        <span>)</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col">
                                <p class="cap">Penerima Tugas,</p>
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
                                        <input class="u c" id="n2" name="penerima_nama" type="text" placeholder="Nama jelas">
                                        <span>)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p class="sh">Detail Transportasi:</p>
                        <table class="tb" id="tp">
                            <colgroup>
                                <col style="width: 36px">
                                <col>
                                <col>
                                <col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Transportasi</th>
                                    <th>Pergi</th>
                                    <th>Pulang</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="n">1</td>
                                    <td><input type="text" aria-label="Transportasi 1"></td>
                                    <td><input type="text" aria-label="Pergi 1"></td>
                                    <td><input type="text" aria-label="Pulang 1"></td>
                                </tr>
                                <tr>
                                    <td class="n">2</td>
                                    <td><input type="text" aria-label="Transportasi 2"></td>
                                    <td><input type="text" aria-label="Pergi 2"></td>
                                    <td><input type="text" aria-label="Pulang 2"></td>
                                </tr>
                            </tbody>
                        </table>

                        <table class="tb" id="lk">
                            <colgroup>
                                <col style="width: 36px">
                                <col>
                                <col>
                                <col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Lokasi</th>
                                    <th>Estimasi Jarak</th>
                                    <th>Total Jarak Tempuh</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="n">1</td>
                                    <td><input type="text" aria-label="Lokasi 1"></td>
                                    <td><input type="text" aria-label="Estimasi jarak 1"></td>
                                    <td><input type="text" aria-label="Total jarak tempuh 1"></td>
                                </tr>
                                <tr>
                                    <td class="n">2</td>
                                    <td><input type="text" aria-label="Lokasi 2"></td>
                                    <td><input type="text" aria-label="Estimasi jarak 2"></td>
                                    <td><input type="text" aria-label="Total jarak tempuh 2"></td>
                                </tr>
                            </tbody>
                        </table>
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
