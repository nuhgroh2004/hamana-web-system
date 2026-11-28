/**
 * PermohonanPreview.render(r) — render isi surat mengikuti tata letak lima
 * formulir asli. Pemanggil membungkusnya dengan <div class="paper">.
 * r = objek dari API (formatPermohonan), termasuk form_data, form_type, signatures.
 */
(function (window) {
    'use strict';

    var LOGO = '<img src="/assets/logo-hamana-forms.png" alt="Hamana Works">';

    function esc(v) {
        return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }

    function tgl(v) {
        if (!v) return '-';

        var p = String(v).slice(0, 10).split('-');
        if (p.length !== 3) return v;

        var d = new Date(+p[0], +p[1] - 1, +p[2]);
        return isNaN(d.getTime()) ? v : d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    function row(label, value) {
        return '<div class="rw"><span class="lb">' + label + '</span><span class="cl">:</span>' +
            '<span class="v">' + esc(value || '-') + '</span></div>';
    }

    function check(label, on) {
        return '<span class="ck">' + (on ? '☑' : '☐') + ' ' + esc(label) + '</span>';
    }

    function logo() {
        return '<div class="hd">' + LOGO + '</div>';
    }

    function header(title) {
        return '<div class="hd">' + LOGO + '<h1>' + esc(title) + '</h1></div>';
    }

    function title(text) {
        return '<h1 class="tt">' + esc(text) + '</h1>';
    }

    function sig(cap, png, name, date) {
        var thumb = png
            ? '<img src="' + esc(png) + '" alt="TTD">'
            : '<span class="ln"></span>';

        return '<div class="col"><p class="cap">' + cap + '</p>' +
            '<div class="sig">' + thumb + '</div>' +
            '<p class="nm">(' + esc(name || '__________________') + ')</p>' +
            (date && date !== '-' ? '<p class="dt">' + esc(date) + '</p>' : '') +
            '</div>';
    }

    function table(cols, head, rows, empty) {
        var body = rows || '<tr><td colspan="' + cols.length + '" style="text-align:center;color:#777">' + esc(empty || '-') + '</td></tr>';
        return '<table class="tb"><colgroup>' +
            cols.map(function (w) { return '<col style="width:' + w + '">'; }).join('') +
            '</colgroup><thead><tr>' +
            head.map(function (h) { return '<th>' + h + '</th>'; }).join('') +
            '</tr></thead><tbody>' + body + '</tbody></table>';
    }

    // ---- form renderers ----

    function renderCuti(r) {
        var d = r.form_data || {};
        var jenis = Array.isArray(d.jenis) ? d.jenis.join(', ') : (d.jenis || '');
        var tanggal = tgl(d.tgl_mulai) + (d.tgl_sampai ? ' — ' + tgl(d.tgl_sampai) : '');
        var waktu = (d.waktu_mulai || '-') + (d.waktu_sampai ? ' s.d. ' + d.waktu_sampai : '');

        return '<div class="pv">' +
            header('FORMULIR PERMINTAAN CUTI / SAKIT') +
            '<div class="cb">' + check('Cuti Fullday', jenis.indexOf('Cuti Fullday') >= 0) +
            check('Cuti Halfday', jenis.indexOf('Cuti Halfday') >= 0) + '</div>' +
            row('Tanggal Cuti / Sakit', tanggal) +
            row('Waktu', waktu) +
            row('Tanggal Kembali Kerja', tgl(d.tgl_kembali)) +
            row('Waktu', d.waktu_kembali) +
            row('Untuk Keperluan', d.keperluan) +
            (d.keterangan_lain ? row('Keterangan', d.keterangan_lain) : '') +
            (d.surat ? '<p class="note">' + esc(d.surat) + '</p>' : '') +
            '<p class="kt">Keterangan</p>' +
            '<ol class="ket">' +
            '<li><span>1.</span><div>Selama menjalankan cuti / sakit saya beralamat di : <b>' + esc(d.alamat || '-') + '</b></div></li>' +
            '<li><span>2.</span><div>Apabila dalam 5 (lima) hari sejak tanggal tersebut saya tidak kembali tanpa pemberitahuan dan alasan yang kuat, maka saya dianggap telah mengundurkan diri dari perusahaan.</div></li>' +
            '</ol>' +
            '<div class="sg">' +
            sig('Diketahui / disetujui :<br>Kepala Unit / Bagian', r.signature_approver, d.atasan_nama || (r.ap && r.ap.n), tgl(d.atasan_tanggal)) +
            sig('Yang mengajukan', r.signature_applicant, d.nama_jelas || r.nama, tgl(d.tanggal_ttd || r.tgl)) +
            '</div></div>';
    }

    function renderKeluar(r) {
        var d = r.form_data || {};

        return '<div class="pv">' +
            logo() + title('SURAT IZIN KELUAR KANTOR') +
            '<p class="jus">Yang bertanda tangan di bawah ini, dengan ini memberikan izin kepada tersebut karyawan yang namanya tertera di bawah ini untuk izin keluar kantor pada jam kerja:</p>' +
            row('Nama Karyawan', r.nama) +
            row('Jabatan', r.jabatan) +
            row('Hari/Tanggal', tgl(d.tanggal)) +
            row('Jam Keluar / Masuk', (d.jam_keluar || '-') + ' / ' + (d.jam_masuk || '-')) +
            row('Tujuan', d.tujuan) +
            row('Kendaraan yang Digunakan', d.kendaraan) +
            '<div class="sg">' +
            sig('Karyawan,<br>Pemohon Izin', r.signature_applicant, d.nama_jelas || r.nama, '') +
            sig('Atasan Langsung,<br>Pemberi Izin', r.signature_approver, d.atasan_nama || (r.ap && r.ap.n), '') +
            '</div></div>';
    }

    function renderDinasDalam(r) {
        var d = r.form_data || {};
        var k = d.karyawan || {};
        var baris = Array.isArray(d.baris) ? d.baris : [];
        var rows = baris.map(function (b) {
            return '<tr><td>' + esc(tgl(b.tanggal)) + '</td>' +
                '<td>' + esc(b.dari || '') + '</td>' +
                '<td>' + esc(b.selesai || '') + '</td>' +
                '<td>' + esc(b.tujuan || '') + '</td>' +
                '<td>' + esc(b.langsung || '') + '</td>' +
                '<td>' + esc(b.kembali || '') + '</td></tr>';
        }).join('');

        return '<div class="pv dk"><div class="frm">' +
            logo() + title('FORM IZIN DINAS DALAM KOTA') +
            '<div class="ib">' +
            row('Nama', k.nama || r.nama) +
            row('NPK', k.npk || r.nik) +
            row('Jabatan', k.jabatan || r.jabatan) +
            row('Dept/ Bag', k.dept) +
            '</div>' +
            table(
                ['16%', '11%', '11%', 'auto', '15%', '15%'],
                ['Hari/<br>Tanggal', 'Dari<br>Jam', 'Selesai<br>Jam', 'Tujuan', 'Langsung dr<br>Rumah (Ya/ Tdk)', 'Kembali ke<br>Kantor (Ya/ Tdk)'],
                rows,
                'Tidak ada perjalanan dinas.'
            ) +
            '<p class="kv"><b>Kendaraan yang digunakan :</b> <span class="ln2">' + esc(d.kendaraan || '-') + '</span></p>' +
            '<div class="kt2"><b>Keterangan :</b><ul>' +
            '<li>Untuk tugas rutin atau tugas luar kota &gt; 3 kali dalam seminggu, maka formulir harus diserahkan ke Departemen HRD pada hari terakhir ybs bertugas di minggu tersebut.</li>' +
            '<li>Untuk tugas-tugas luar insidental, formulir harus diserahkan pada hari itu juga/keesokan harinya.</li>' +
            '<li>Formulir tugas luar dianggap tidak sah apabila tidak ada persetujuan dari atasan langsung/ pemberi tugas</li>' +
            '</ul></div>' +
            '<div class="sg2">' +
            sig('Dibuat oleh,', r.signature_applicant, d.nama_jelas || r.nama, '') +
            sig('Disetujui oleh,', r.signature_approver, d.atasan_nama || (r.ap && r.ap.n), '') +
            '</div></div></div>';
    }

    function renderDinasLuar(r) {
        var d = r.form_data || {};
        var itinerary = Array.isArray(d.itinerary) ? d.itinerary : [];
        var transportasi = Array.isArray(d.transportasi) ? d.transportasi : [];
        var lokasi = Array.isArray(d.lokasi) ? d.lokasi : [];

        var itRows = itinerary.map(function (it, i) {
            return '<tr><td class="n">' + (i + 1) + '</td>' +
                '<td>' + esc(it.tempat || '') + '</td>' +
                '<td>' + esc(tgl(it.tanggal)) + (it.jam ? ', ' + esc(it.jam) : '') + '</td>' +
                '<td>' + esc(it.keperluan || '') + '</td></tr>';
        }).join('');

        var tpRows = transportasi.map(function (tp, i) {
            return '<tr><td class="n">' + (i + 1) + '</td><td>' + esc(tp.transportasi || '') +
                '</td><td>' + esc(tp.pergi || '') + '</td><td>' + esc(tp.pulang || '') + '</td></tr>';
        }).join('');

        var lkRows = lokasi.map(function (lk, i) {
            return '<tr><td class="n">' + (i + 1) + '</td><td>' + esc(lk.lokasi || '') +
                '</td><td>' + esc(lk.estimasi_jarak || '') + '</td><td>' + esc(lk.total_jarak || '') + '</td></tr>';
        }).join('');

        return '<div class="pv dk"><div class="frm">' +
            logo() + title('SURAT PERINTAH TUGAS') +
            '<p class="no"><b>NO :</b> <span class="ln2">' + esc(d.nomor || '-') + '</span></p>' +
            '<p class="jus">Kami yang bertanda tangan di bawah ini, Direksi/General Manager/Kepala Departemen/Product Manager/Kepala Bagian/Area Manager PT. Hamana Works Indonesia, menerangkan bahwa :</p>' +
            '<div class="nj">' + row('Nama', r.nama) + row('Jabatan', r.jabatan) + '</div>' +
            '<p class="jus">Untuk melaksanakan Tugas Perjalanan Dinas Dalam Negeri/Luar Negeri</p>' +
            '<p class="sh">Detail Acara (Itinerary):</p>' +
            table(['6%', 'auto', '28%', 'auto'], ['No.', 'Tempat yang dikunjungi', 'Hari, Tanggal dan Waktu keberangkatan', 'Keperluan'], itRows, 'Tidak ada itinerary.') +
            '<p class="jus">Demikian Surat Perintah Tugas ini dibuat untuk dipergunakan sebagaimana mestinya.</p>' +
            '<p class="jus">Atas perhatian dan kerjasamanya, kami mengucapkan terima kasih.</p>' +
            '<p class="tg">Tegal, <span class="ln2">' + esc(tgl(d.tanggal || r.tgl)) + '</span></p>' +
            '<div class="sg">' +
            sig('Pemberi Tugas,', r.signature_approver, d.pemberi_nama || (r.ap && r.ap.n), '') +
            sig('Penerima Tugas,', r.signature_applicant, d.penerima_nama || r.nama, '') +
            '</div>' +
            (tpRows ? '<p class="sh">Detail Transportasi:</p>' +
                table(['6%', 'auto', 'auto', 'auto'], ['No.', 'Transportasi', 'Pergi', 'Pulang'], tpRows) : '') +
            (lkRows ? '<p class="sh">Detail Lokasi:</p>' +
                table(['6%', 'auto', 'auto', 'auto'], ['No.', 'Lokasi', 'Estimasi Jarak', 'Total Jarak Tempuh'], lkRows) : '') +
            '</div></div>';
    }

    function renderAbsensi(r) {
        var d = r.form_data || {};
        var jenis = d.jenis;

        return '<div class="pv dk"><div class="frm">' +
            header('FORM ABSENSI') +
            '<div class="ib"><p>PILIH SALAH SATU BILA :</p>' +
            check('1. CUTI HAID (KHUSUS KARYAWATI)', jenis === 'cuti_haid') +
            check('2. MESIN ABSENSI ERROR', jenis === 'mesin_error') +
            check('3. TIDAK ABSEN / LUPA ABSEN', jenis === 'lupa_absen') +
            '</div>' +
            row('NAMA', r.nama) +
            row('DIVISI', d.divisi) +
            row('POSISI', d.posisi) +
            row('TANGGAL', tgl(d.tanggal)) +
            row('JAM', d.jam) +
            row('ALASAN', d.alasan) +
            '<div class="sg2">' +
            sig('Diajukan oleh,', r.signature_applicant, d.pengaju_nama || r.nama, '') +
            sig('Disetujui oleh,<br>Kepala Bagian', r.signature_approver, (r.ap && r.ap.n), '') +
            '</div></div></div>';
    }

    // ---- main render ----

    function render(r) {
        switch (r.form_type) {
            case 'izin-cuti-atau-sakit':
                return renderCuti(r);
            case 'izin-keluar-kantor':
                return renderKeluar(r);
            case 'izin-dinas-dalam-kota':
                return renderDinasDalam(r);
            case 'izin-dinas-luar-kota':
                return renderDinasLuar(r);
            case 'form-absensi':
                return renderAbsensi(r);
            default:
                return '<div class="pv"><p>Jenis form tidak diketahui.</p></div>';
        }
    }

    window.PermohonanPreview = { render: render };

})(window);
