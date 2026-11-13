<div id="profil-data-pribadi">
    <div class="pg">
        <div class="top cd">
            <div class="ph">
                <svg id="av" class="av" viewBox="0 0 5 5" aria-hidden="true"></svg>
                <img id="phimg" alt="Foto profil" hidden>
            </div>
            <div class="who">
                <h1 id="nm">Karyawan HWI</h1>
                <p id="sub" hidden></p>
                <label class="btn sm" id="phbtn" hidden>Ganti foto<input type="file" id="phfile" accept="image/*" hidden></label>
            </div>
            <button type="button" class="btn prim" id="edit">
                <svg class="i" viewBox="0 0 16 16"><path d="M2 14l1-3.5 8-8 2.5 2.5-8 8zM9.5 4l2.5 2.5"/></svg>
                Edit Profil
            </button>
        </div>

        <form id="f" class="view" novalidate>
            <section class="cd">
                <div class="hd"><h2>Identitas Pribadi</h2><p>Data dasar sesuai dokumen resmi.</p></div>
                <div class="gr">
                    <div class="f"><label class="lb" for="nik">Nomor Induk Karyawan <span class="rq">*</span></label><input class="fld" id="nik" name="nik" type="text" required></div>
                    <div class="f"><label class="lb" for="nama">Nama Lengkap <span class="rq">*</span></label><input class="fld" id="nama" name="nama" type="text" required></div>
                    <div class="f">
                        <span class="lb">Jenis Kelamin</span>
                        <div class="rd">
                            <label><input type="radio" name="gender" value="Laki-Laki"> Laki-Laki</label>
                            <label><input type="radio" name="gender" value="Perempuan"> Perempuan</label>
                        </div>
                    </div>
                    <div class="f"><label class="lb" for="tempat_lahir">Tempat Lahir <span class="rq">*</span></label><input class="fld" id="tempat_lahir" name="tempat_lahir" type="text" required></div>
                    <div class="f"><label class="lb" for="tgl_lahir">Tanggal Lahir <span class="rq">*</span></label><input class="fld" id="tgl_lahir" name="tgl_lahir" type="date" required></div>
                    <div class="f">
                        <label class="lb" for="agama">Agama</label>
                        <select class="fld" id="agama" name="agama">
                            <option value="">--Pilih--</option>
                            <option>Islam</option>
                            <option>Kristen</option>
                            <option>Katholik</option>
                            <option>Hindu</option>
                            <option>Budha</option>
                            <option>Penganut Kepercayaan</option>
                            <option>Lainnya</option>
                        </select>
                    </div>
                    <div class="f">
                        <label class="lb" for="status_nikah">Status Nikah <span class="rq">*</span></label>
                        <select class="fld" id="status_nikah" name="status_nikah" required>
                            <option value="">--Pilih--</option>
                            <option>Menikah</option>
                            <option>Duda atau Janda</option>
                            <option>Belum Menikah</option>
                        </select>
                    </div>
                    <div class="f"><label class="lb" for="jml_anak">Jumlah Anak</label><input class="fld" id="jml_anak" name="jml_anak" type="number"></div>
                </div>
            </section>

            <section class="cd">
                <div class="hd"><h2>Kepegawaian</h2><p>Posisi dan masa kerja Anda.</p></div>
                <div class="gr">
                    <div class="f">
                        <label class="lb" for="jabatan">Jabatan <span class="rq">*</span></label>
                        <select class="fld" id="jabatan" name="jabatan" required>
                            <option value="">--Pilih--</option>
                            <option>Direktur Utama</option>
                            <option>Direktur</option>
                            <option>Manager</option>
                            <option>Supervisor</option>
                            <option>Foreman</option>
                            <option>Head</option>
                            <option>Leader</option>
                            <option>Officer</option>
                            <option>Operator</option>
                            <option>General Manager</option>
                            <option>Asisstant General Manager</option>
                            <option>Driver</option>
                            <option>Intern</option>
                        </select>
                    </div>
                    <div class="f"><label class="lb" for="departemen">Departemen <span class="rq">*</span></label><input class="fld" id="departemen" name="departemen" type="text" required></div>
                    <div class="f"><label class="lb" for="posisi">Posisi <span class="rq">*</span></label><input class="fld" id="posisi" name="posisi" type="text" required></div>
                    <div class="f"><label class="lb" for="tgl_gabung">Tanggal Bergabung <span class="rq">*</span></label><input class="fld" id="tgl_gabung" name="tgl_gabung" type="date" required></div>
                </div>
            </section>

            <section class="cd">
                <div class="hd"><h2>Kontak &amp; Alamat</h2><p>Cara menghubungi dan tempat tinggal Anda.</p></div>
                <div class="gr">
                    <div class="f"><label class="lb" for="email">Email <span class="rq">*</span></label><input class="fld" id="email" name="email" type="email" required></div>
                    <div class="f"><label class="lb" for="hp1">No. HP 1 <span class="rq">*</span></label><input class="fld" id="hp1" name="hp1" type="tel" required></div>
                    <div class="f"><label class="lb" for="hp2">No. HP 2</label><input class="fld" id="hp2" name="hp2" type="tel"></div>
                    <div class="f wide"><label class="lb" for="alamat_ktp">Alamat sesuai KTP <span class="rq">*</span></label><textarea class="fld" id="alamat_ktp" name="alamat_ktp" rows="3" required></textarea></div>
                    <div class="f wide"><label class="lb" for="alamat_dom">Alamat Domisili</label><textarea class="fld" id="alamat_dom" name="alamat_dom" rows="3"></textarea></div>
                    <div class="f">
                        <label class="lb" for="rumah">Rumah yang Ditinggali</label>
                        <select class="fld" id="rumah" name="rumah">
                            <option value="">--Pilih--</option>
                            <option>Milik Sendiri</option>
                            <option>Sewa/Kontrak</option>
                            <option>Milik Orangtua</option>
                            <option>Lainnya</option>
                        </select>
                    </div>
                </div>
            </section>

            <section class="cd">
                <div class="hd"><h2>Identitas &amp; Jaminan</h2><p>Dokumen identitas, BPJS, dan rekening.</p></div>
                <div class="gr">
                    <div class="f"><label class="lb" for="ktp">No. KTP <span class="rq">*</span></label><input class="fld" id="ktp" name="ktp" type="text" required></div>
                    <div class="f"><label class="lb" for="passport">No. Passport</label><input class="fld" id="passport" name="passport" type="text"></div>
                    <div class="f"><label class="lb" for="npwp">NPWP</label><input class="fld" id="npwp" name="npwp" type="text"></div>
                    <div class="f"><label class="lb" for="bpjs_tk">BPJS Ketenagakerjaan</label><input class="fld" id="bpjs_tk" name="bpjs_tk" type="text"></div>
                    <div class="f"><label class="lb" for="bpjs_kes">BPJS Kesehatan</label><input class="fld" id="bpjs_kes" name="bpjs_kes" type="text"></div>
                    <div class="f"><label class="lb" for="rek_mandiri">Rekening Mandiri</label><input class="fld" id="rek_mandiri" name="rek_mandiri" type="text"></div>
                    <div class="f wide">
                        <span class="lb">Faskes Tingkat I</span>
                        <div class="fk">
                            <div class="fkh"><b>Faskes terpilih</b><button type="button" class="btn sm" id="fkdel">Hapus pilihan</button></div>
                            <dl class="fkd" id="fkd">
                                <div><dt>Nama Provinsi</dt><dd>JAWA TENGAH</dd></div>
                                <div><dt>Kantor Regional</dt><dd>REGIONAL VI - SEMARANG</dd></div>
                                <div><dt>Kantor Cabang</dt><dd>PEKALONGAN</dd></div>
                                <div><dt>Kabupaten/Kota</dt><dd>KAB. TEGAL</dd></div>
                                <div><dt>Kode PPK</dt><dd>0168U010</dd></div>
                                <div><dt>Nama PPK</dt><dd>DR. ACHMAD SHOCHIBUL BIRRI</dd></div>
                                <div><dt>Alamat PPK</dt><dd>Jl. Garuda 115</dd></div>
                                <div><dt>Telp PPK</dt><dd>02836144867</dd></div>
                            </dl>
                            <p class="fkn" id="fkn" hidden>Belum ada faskes dipilih.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="cd">
                <div class="hd"><h2>Code Grup</h2><p>Kode grup pajak dan status pernikahan. Semua kode otomatis disimpan dalam huruf kapital.</p></div>
                <div class="gr">
                    <div class="f"><label class="lb" for="code_pajak">Code Grup Pajak</label><input class="fld up" id="code_pajak" name="code_pajak" type="text" autocapitalize="characters"></div>
                    <div class="f"><label class="lb" for="code_nikah">Code Grup Status Pernikahan</label><input class="fld up" id="code_nikah" name="code_nikah" type="text" autocapitalize="characters"></div>
                    <div class="f"><label class="lb" for="code_status">Code Status Pajak</label><input class="fld up" id="code_status" name="code_status" type="text" autocapitalize="characters"></div>
                </div>
            </section>

            <section class="cd">
                <div class="hd"><h2>Kontak Darurat</h2><p>Orang yang dapat dihubungi dalam keadaan darurat.</p></div>
                <div class="gr">
                    <div class="f"><label class="lb" for="dr_nama1">Nama Darurat 1</label><input class="fld" id="dr_nama1" name="dr_nama1" type="text"></div>
                    <div class="f"><label class="lb" for="dr_telp1">No. Telp Darurat 1</label><input class="fld" id="dr_telp1" name="dr_telp1" type="tel"></div>
                    <div class="f"><label class="lb" for="dr_hub1">Hubungan Darurat 1</label><input class="fld" id="dr_hub1" name="dr_hub1" type="text"></div>
                    <div class="f"><label class="lb" for="dr_nama2">Nama Darurat 2</label><input class="fld" id="dr_nama2" name="dr_nama2" type="text"></div>
                    <div class="f"><label class="lb" for="dr_telp2">No. Telp Darurat 2</label><input class="fld" id="dr_telp2" name="dr_telp2" type="tel"></div>
                    <div class="f"><label class="lb" for="dr_hub2">Hubungan Darurat 2</label><input class="fld" id="dr_hub2" name="dr_hub2" type="text"></div>
                </div>
            </section>

            <section class="cd">
                <div class="hd"><h2>Media Sosial</h2><p>Opsional — isi bila ingin dibagikan.</p></div>
                <div class="gr">
                    <div class="f"><label class="lb" for="facebook">Facebook</label><input class="fld" id="facebook" name="facebook" type="text"></div>
                    <div class="f"><label class="lb" for="instagram">Instagram</label><input class="fld" id="instagram" name="instagram" type="text"></div>
                    <div class="f"><label class="lb" for="twitter">Twitter</label><input class="fld" id="twitter" name="twitter" type="text"></div>
                </div>
            </section>

            <div class="bar" id="bar" hidden>
                <button type="button" class="btn" id="cancel">Batal</button>
                <button type="submit" class="btn prim">Simpan</button>
            </div>
        </form>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
