@php
    $jabatan = $jabatans ?: [
        'Direktur Utama', 'Direktur', 'Manager', 'Supervisor', 'Foreman', 'Head', 'Leader',
        'Officer', 'Operator', 'General Manager', 'Asisstant General Manager', 'Driver', 'Intern',
    ];
    $agama = ['Islam', 'Kristen', 'Katholik', 'Hindu', 'Budha', 'Penganut Kepercayaan', 'Lainnya'];
    $statusNikah = ['Menikah', 'Duda atau Janda', 'Belum Menikah'];
    $rumah = ['Milik Sendiri', 'Sewa/Kontrak', 'Milik Orangtua', 'Lainnya'];
@endphp

<div id="data-pegawai-wizard" data-employee="{{ $employeeId }}" data-back="{{ route('module', 'data-pegawai') }}">
    <div class="pg">
        <a class="wz-back" href="{{ route('module', 'data-pegawai') }}" wire:navigate>
            <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
            Kembali ke Data Pegawai
        </a>

        <h1>Tambah Karyawan</h1>
        <p class="ds">Lengkapi data karyawan per bagian, lalu lanjut ke bagian berikutnya.</p>

        <div class="wz-progress" aria-label="Progres pengisian">
            <div class="wz-bars" id="wz-bars">
                <span class="wz-bar" data-step="1"></span>
                <span class="wz-bar" data-step="2"></span>
                <span class="wz-bar" data-step="3"></span>
                <span class="wz-bar" data-step="4"></span>
                <span class="wz-bar" data-step="5"></span>
            </div>
            <div class="wz-labels" id="wz-labels">
                <span data-step="1">Data Pribadi</span>
                <span data-step="2">Pendidikan</span>
                <span data-step="3">Keluarga</span>
                <span data-step="4">Ciri Fisik</span>
                <span data-step="5">File</span>
            </div>
        </div>

        <form id="wz-form" novalidate>
            <section class="wz-step" data-step="1">
                <div class="cd">
                    <div class="hd"><h2>Identitas Pribadi</h2><p>Data dasar sesuai dokumen resmi.</p></div>
                    <div class="gr">
                        <div class="f"><label class="lb" for="w-nik">Nomor Induk Karyawan <span class="rq">*</span></label><input class="fld" id="w-nik" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-nama">Nama Lengkap <span class="rq">*</span></label><input class="fld" id="w-nama" autocomplete="off"></div>
                        <div class="f">
                            <span class="lb">Jenis Kelamin</span>
                            <div class="rd">
                                <label><input type="radio" name="w-gender" value="Laki-Laki"> Laki-Laki</label>
                                <label><input type="radio" name="w-gender" value="Perempuan"> Perempuan</label>
                            </div>
                        </div>
                        <div class="f"><label class="lb" for="w-tempat_lahir">Tempat Lahir <span class="rq">*</span></label><input class="fld" id="w-tempat_lahir" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-tgl_lahir">Tanggal Lahir <span class="rq">*</span></label><input class="fld" id="w-tgl_lahir" type="date"></div>
                        <div class="f">
                            <label class="lb" for="w-agama">Agama</label>
                            <select class="fld" id="w-agama">
                                <option value="">--Pilih--</option>
                                @foreach ($agama as $item)
                                    <option>{{ $item }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="f">
                            <label class="lb" for="w-status_nikah">Status Nikah <span class="rq">*</span></label>
                            <select class="fld" id="w-status_nikah">
                                <option value="">--Pilih--</option>
                                @foreach ($statusNikah as $item)
                                    <option>{{ $item }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="f"><label class="lb" for="w-jml_anak">Jumlah Anak</label><input class="fld" id="w-jml_anak" type="number" min="0" max="50"></div>
                        <div class="f wide">
                            <label class="lb" for="w-photo">Foto Profil</label>
                            <input class="fld" id="w-photo" type="file" accept="image/*">
                            <p class="hint" id="w-photo-info">Opsional. JPG atau PNG maksimal 5 MB.</p>
                        </div>
                    </div>
                </div>

                <div class="cd">
                    <div class="hd"><h2>Kepegawaian</h2><p>Posisi dan masa kerja karyawan.</p></div>
                    <div class="gr">
                        <div class="f">
                            <label class="lb" for="w-jabatan">Jabatan <span class="rq">*</span></label>
                            <select class="fld" id="w-jabatan">
                                <option value="">--Pilih--</option>
                                @foreach ($jabatan as $item)
                                    <option>{{ $item }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="f">
                            <label class="lb" for="w-status_pegawai">Status Pegawai <span class="rq">*</span></label>
                            <select class="fld" id="w-status_pegawai">
                                <option>Aktif</option>
                                <option>Tidak Aktif</option>
                            </select>
                        </div>
                        <div class="f"><label class="lb" for="w-departemen">Departemen <span class="rq">*</span></label><input class="fld" id="w-departemen" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-posisi">Posisi <span class="rq">*</span></label><input class="fld" id="w-posisi" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-tgl_gabung">Tanggal Bergabung <span class="rq">*</span></label><input class="fld" id="w-tgl_gabung" type="date"></div>
                    </div>
                </div>

                <div class="cd">
                    <div class="hd"><h2>Kontak &amp; Alamat</h2><p>Cara menghubungi dan tempat tinggal karyawan.</p></div>
                    <div class="gr">
                        <div class="f"><label class="lb" for="w-email">Email <span class="rq">*</span></label><input class="fld" id="w-email" type="email"></div>
                        <div class="f"><label class="lb" for="w-hp1">No. HP 1 <span class="rq">*</span></label><input class="fld" id="w-hp1" type="tel"></div>
                        <div class="f"><label class="lb" for="w-hp2">No. HP 2</label><input class="fld" id="w-hp2" type="tel"></div>
                        <div class="f wide"><label class="lb" for="w-alamat_ktp">Alamat sesuai KTP <span class="rq">*</span></label><textarea class="fld" id="w-alamat_ktp" rows="3"></textarea></div>
                        <div class="f wide"><label class="lb" for="w-alamat_dom">Alamat Domisili</label><textarea class="fld" id="w-alamat_dom" rows="3"></textarea></div>
                        <div class="f">
                            <label class="lb" for="w-rumah">Rumah yang Ditinggali</label>
                            <select class="fld" id="w-rumah">
                                <option value="">--Pilih--</option>
                                @foreach ($rumah as $item)
                                    <option>{{ $item }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>

                <div class="cd">
                    <div class="hd"><h2>Identitas &amp; Jaminan</h2><p>Dokumen identitas, BPJS, dan rekening.</p></div>
                    <div class="gr">
                        <div class="f"><label class="lb" for="w-ktp">No. KTP <span class="rq">*</span></label><input class="fld" id="w-ktp" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-passport">No. Passport</label><input class="fld" id="w-passport" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-npwp">NPWP</label><input class="fld" id="w-npwp" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-bpjs_tk">BPJS Ketenagakerjaan</label><input class="fld" id="w-bpjs_tk" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-bpjs_kes">BPJS Kesehatan</label><input class="fld" id="w-bpjs_kes" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-rek_mandiri">Rekening Mandiri</label><input class="fld" id="w-rek_mandiri" autocomplete="off"></div>
                    </div>
                </div>

                <div class="cd">
                    <div class="hd"><h2>Faskes Tingkat I</h2><p>Pilih bila karyawan sudah memiliki faskes BPJS.</p></div>
                    <div class="gr">
                        <div class="f wide">
                            <label class="chk"><input type="checkbox" id="w-faskes_terpilih"> Faskes sudah terpilih</label>
                        </div>
                        <div class="f"><label class="lb" for="w-faskes_provinsi">Nama Provinsi</label><input class="fld" id="w-faskes_provinsi" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-faskes_kantor_regional">Kantor Regional</label><input class="fld" id="w-faskes_kantor_regional" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-faskes_kantor_cabang">Kantor Cabang</label><input class="fld" id="w-faskes_kantor_cabang" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-faskes_kabupaten_kota">Kabupaten/Kota</label><input class="fld" id="w-faskes_kabupaten_kota" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-faskes_kode_ppk">Kode PPK</label><input class="fld" id="w-faskes_kode_ppk" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-faskes_nama_ppk">Nama PPK</label><input class="fld" id="w-faskes_nama_ppk" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-faskes_alamat_ppk">Alamat PPK</label><input class="fld" id="w-faskes_alamat_ppk" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-faskes_telp_ppk">Telp PPK</label><input class="fld" id="w-faskes_telp_ppk" autocomplete="off"></div>
                    </div>
                </div>

                <div class="cd">
                    <div class="hd"><h2>Code Grup</h2><p>Kode grup pajak dan status pernikahan.</p></div>
                    <div class="gr">
                        <div class="f"><label class="lb" for="w-code_pajak">Code Grup Pajak</label><input class="fld up" id="w-code_pajak" autocapitalize="characters"></div>
                        <div class="f"><label class="lb" for="w-code_nikah">Code Grup Status Pernikahan</label><input class="fld up" id="w-code_nikah" autocapitalize="characters"></div>
                        <div class="f"><label class="lb" for="w-code_status">Code Status Pajak</label><input class="fld up" id="w-code_status" autocapitalize="characters"></div>
                    </div>
                </div>

                <div class="cd">
                    <div class="hd"><h2>Kontak Darurat</h2><p>Orang yang dapat dihubungi dalam keadaan darurat.</p></div>
                    <div class="gr">
                        <div class="f"><label class="lb" for="w-dr_nama1">Nama Darurat 1</label><input class="fld" id="w-dr_nama1" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-dr_telp1">No. Telp Darurat 1</label><input class="fld" id="w-dr_telp1" type="tel"></div>
                        <div class="f"><label class="lb" for="w-dr_hub1">Hubungan Darurat 1</label><input class="fld" id="w-dr_hub1" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-dr_nama2">Nama Darurat 2</label><input class="fld" id="w-dr_nama2" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-dr_telp2">No. Telp Darurat 2</label><input class="fld" id="w-dr_telp2" type="tel"></div>
                        <div class="f"><label class="lb" for="w-dr_hub2">Hubungan Darurat 2</label><input class="fld" id="w-dr_hub2" autocomplete="off"></div>
                    </div>
                </div>

                <div class="cd">
                    <div class="hd"><h2>Media Sosial</h2><p>Opsional.</p></div>
                    <div class="gr">
                        <div class="f"><label class="lb" for="w-facebook">Facebook</label><input class="fld" id="w-facebook" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-instagram">Instagram</label><input class="fld" id="w-instagram" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-twitter">Twitter</label><input class="fld" id="w-twitter" autocomplete="off"></div>
                    </div>
                </div>
            </section>

            <section class="wz-step" data-step="2" hidden>
                <div class="cd">
                    <div class="hd"><h2>Riwayat Pendidikan</h2><p>Tambahkan jenjang pendidikan yang pernah ditempuh.</p></div>
                    <div class="wz-rows" id="wz-pendidikan"></div>
                    <div class="wz-actions">
                        <button type="button" class="btn" id="wz-add-pendidikan">
                            <svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>
                            Tambah Pendidikan
                        </button>
                    </div>
                </div>
            </section>

            <section class="wz-step" data-step="3" hidden>
                <div class="cd">
                    <div class="hd"><h2>Anggota Keluarga</h2><p>Tambahkan anggota keluarga yang perlu tercatat.</p></div>
                    <div class="wz-rows" id="wz-keluarga"></div>
                    <div class="wz-actions">
                        <button type="button" class="btn" id="wz-add-keluarga">
                            <svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>
                            Tambah Anggota Keluarga
                        </button>
                    </div>
                </div>
            </section>

            <section class="wz-step" data-step="4" hidden>
                <div class="cd">
                    <div class="hd"><h2>Ciri Fisik</h2><p>Data fisik karyawan.</p></div>
                    <div class="gr">
                        <div class="f"><label class="lb" for="w-warna_kulit">Warna Kulit</label><input class="fld" id="w-warna_kulit" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-golongan_darah">Golongan Darah</label><input class="fld" id="w-golongan_darah" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-warna_rambut">Warna Rambut</label><input class="fld" id="w-warna_rambut" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-ukuran_baju">Ukuran Baju</label><input class="fld" id="w-ukuran_baju" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-warna_mata">Warna Mata</label><input class="fld" id="w-warna_mata" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-ukuran_celana">Ukuran Celana</label><input class="fld" id="w-ukuran_celana" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-tinggi_badan">Tinggi Badan (cm)</label><input class="fld" id="w-tinggi_badan" inputmode="decimal" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-ukuran_sepatu">Ukuran Sepatu</label><input class="fld" id="w-ukuran_sepatu" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-berat_badan">Berat Badan (kg)</label><input class="fld" id="w-berat_badan" inputmode="decimal" autocomplete="off"></div>
                    </div>
                </div>
            </section>

            <section class="wz-step" data-step="5" hidden>
                <div class="cd">
                    <div class="hd"><h2>Nomor Dokumen</h2><p>Nomor KK, KTP, dan NPWP karyawan.</p></div>
                    <div class="gr">
                        <div class="f"><label class="lb" for="w-nomor-KK">Nomor KK</label><input class="fld" id="w-nomor-KK" inputmode="numeric" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-nomor-KTP">Nomor NIK (KTP)</label><input class="fld" id="w-nomor-KTP" inputmode="numeric" autocomplete="off"></div>
                        <div class="f"><label class="lb" for="w-nomor-NPWP">Nomor NPWP</label><input class="fld" id="w-nomor-NPWP" inputmode="numeric" autocomplete="off"></div>
                    </div>
                </div>

                <div class="cd">
                    <div class="hd"><h2>Unggah Dokumen</h2><p>Format PDF, JPG, atau PNG maksimal 10 MB per file.</p></div>
                    <div class="wz-docs">
                        <div class="wz-doc" data-cat="KK">
                            <div class="wz-doc-head"><b>Kartu Keluarga</b><span class="bdg" data-file>Belum ada</span></div>
                            <input class="fld" type="file" data-upload="KK" accept=".pdf,.jpg,.jpeg,.png">
                            <button type="button" class="btn sm dgb" data-del hidden>Hapus file</button>
                        </div>
                        <div class="wz-doc" data-cat="KTP">
                            <div class="wz-doc-head"><b>KTP</b><span class="bdg" data-file>Belum ada</span></div>
                            <input class="fld" type="file" data-upload="KTP" accept=".pdf,.jpg,.jpeg,.png">
                            <button type="button" class="btn sm dgb" data-del hidden>Hapus file</button>
                        </div>
                        <div class="wz-doc" data-cat="NPWP">
                            <div class="wz-doc-head"><b>NPWP</b><span class="bdg" data-file>Belum ada</span></div>
                            <input class="fld" type="file" data-upload="NPWP" accept=".pdf,.jpg,.jpeg,.png">
                            <button type="button" class="btn sm dgb" data-del hidden>Hapus file</button>
                        </div>
                        <div class="wz-doc" data-cat="LAIN">
                            <div class="wz-doc-head"><b>Dokumen Lainnya</b><span class="bdg" data-file>Belum ada</span></div>
                            <div class="wz-filelist" data-list></div>
                            <input class="fld" id="w-lain-judul" placeholder="Judul dokumen" autocomplete="off">
                            <input class="fld" type="file" data-upload="LAIN" accept=".pdf,.jpg,.jpeg,.png">
                        </div>
                    </div>
                </div>
            </section>
        </form>

        <div class="wz-foot">
            <button type="button" class="btn" id="wz-prev" hidden>Kembali</button>
            <span class="wz-count" id="wz-count">Langkah 1 dari 5</span>
            <div class="sp"></div>
            <a class="btn" href="{{ route('module', 'data-pegawai') }}" wire:navigate>Batal</a>
            <button type="button" class="btn go" id="wz-next">Simpan &amp; Lanjut</button>
        </div>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
