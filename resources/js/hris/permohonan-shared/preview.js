/**
 * PermohonanPreview.render(r) — render paper form HTML identik dengan form asli.
 * r = objek dari API (formatPermohonan), termasuk form_data, form_type, signatures, dll.
 */
(function (window) {
    'use strict';

    var LOGO = '<img src="/assets/logo-hamana-forms.png" alt="Hamana Works" style="max-height:48px;display:block;margin-bottom:4px">';

    function esc(v) {
        return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }

    function row(label, value) {
        return '<div class="fl"><span>' + label + '</span><span>:</span><div class="v">' + esc(value) + '</div></div>';
    }

    function sigBox(title, png, name, date) {
        var thumb = png
            ? '<img src="' + esc(png) + '" style="max-height:75px;max-width:160px;display:block;margin:6px auto;object-fit:contain" alt="TTD">'
            : '<div style="height:75px;border-bottom:1px solid #aaa;margin-bottom:4px"></div>';
        return '<div class="col" style="text-align:center;min-width:150px">' +
            '<p class="cap" style="margin:0 0 4px">' + esc(title) + '</p>' +
            thumb +
            '<div style="border-top:1px solid #333;margin-top:2px;padding-top:4px">(' + esc(name || '__________________') + ')</div>' +
            (date ? '<small>' + esc(date) + '</small>' : '') +
            '</div>';
    }

    // ---- form renderers ----

    function renderCuti(r) {
        var d = r.form_data || {};
        var jenis = Array.isArray(d.jenis) ? d.jenis.join(', ') : (d.jenis || '-');
        var tanggalRange = esc(d.tgl_mulai || '-') + (d.tgl_sampai ? ' — ' + esc(d.tgl_sampai) : '');
        var waktuRange = (d.waktu_mulai || '-') + (d.waktu_sampai ? ' s.d. ' + d.waktu_sampai : '');

        return LOGO +
            '<h4 style="text-align:center">FORMULIR PERMINTAAN CUTI / SAKIT</h4>' +
            '<div class="cb" style="margin:4px 0">' +
            checkItem('Cuti Fullday', jenis.indexOf('Cuti Fullday') >= 0) +
            checkItem('Cuti Halfday', jenis.indexOf('Cuti Halfday') >= 0) +
            '</div>' +
            row('Tanggal Cuti / Sakit', tanggalRange) +
            row('Waktu', waktuRange) +
            row('Tanggal Kembali Kerja', d.tgl_kembali || '-') +
            row('Waktu', d.waktu_kembali || '-') +
            row('Untuk Keperluan', d.keperluan || '-') +
            (d.keterangan_lain ? row('Keterangan', d.keterangan_lain) : '') +
            (d.surat ? '<p style="margin:4px 0;font-size:.85em">📋 ' + esc(d.surat) + '</p>' : '') +
            '<p class="kt" style="margin:8px 0 2px;font-weight:600">Keterangan</p>' +
            '<ol style="margin:0;padding-left:1.2em;font-size:.85em">' +
            '<li>Selama menjalankan cuti / sakit saya beralamat di : ' + esc(d.alamat || '-') + '</li>' +
            '<li>Apabila dalam 5 (lima) hari sejak tanggal tersebut saya tidak kembali tanpa pemberitahuan dan alasan yang kuat, maka saya dianggap telah mengundurkan diri dari perusahaan.</li>' +
            '</ol>' +
            '<div class="sg" style="display:flex;gap:16px;margin-top:16px;justify-content:space-between">' +
            sigBox('Diketahui / disetujui :<br>Kepala Unit / Bagian', r.signature_approver, d.atasan_nama || (r.ap && r.ap.n) || '', d.atasan_tanggal || '') +
            sigBox('Yang mengajukan', r.signature_applicant, d.nama_jelas || r.nama, d.tanggal_ttd || r.tgl) +
            '</div>';
    }

    function renderKeluar(r) {
        var d = r.form_data || {};
        var tgl = d.tanggal ? formatTanggal(d.tanggal) : '-';
        return LOGO +
            '<h4 style="text-align:center">SURAT IZIN KELUAR KANTOR</h4>' +
            '<p style="font-size:.85em">Yang bertanda tangan di bawah ini, dengan ini memberikan izin kepada karyawan yang namanya tertera di bawah ini untuk izin keluar kantor pada jam kerja:</p>' +
            row('Nama Karyawan', r.nama) +
            row('Jabatan', r.jabatan) +
            row('Hari/Tanggal', tgl) +
            '<div class="fl"><span>Jam Keluar /Masuk</span><span>:</span><div class="v">' + esc(d.jam_keluar || '-') + ' / ' + esc(d.jam_masuk || '-') + '</div></div>' +
            row('Tujuan', d.tujuan || '-') +
            row('Kendaraan yang Digunakan', d.kendaraan || '-') +
            '<div class="sg" style="display:flex;gap:16px;margin-top:16px;justify-content:space-between">' +
            sigBox('Karyawan / Pemohon Izin', r.signature_applicant, d.nama_jelas || r.nama, '') +
            sigBox('Atasan Langsung / Pemberi Izin', r.signature_approver, d.atasan_nama || (r.ap && r.ap.n) || '', '') +
            '</div>';
    }

    function renderDiasDalam(r) {
        var d = r.form_data || {};
        var baris = Array.isArray(d.baris) ? d.baris : [];

        var tableRows = baris.map(function (b) {
            return '<tr><td>' + esc(b.tanggal || '') + '</td>' +
                '<td>' + esc(b.dari || '') + '</td>' +
                '<td>' + esc(b.selesai || '') + '</td>' +
                '<td>' + esc(b.tujuan || '') + '</td>' +
                '<td>' + esc(b.langsung || '') + '</td>' +
                '<td>' + esc(b.kembali || '') + '</td></tr>';
        }).join('') || '<tr><td colspan="6" style="text-align:center;color:#888">-</td></tr>';

        return LOGO +
            '<h4 style="text-align:center">FORM IZIN DINAS DALAM KOTA</h4>' +
            row('Nama', r.nama) +
            row('NPK', (d.karyawan && d.karyawan.npk) || r.nik) +
            row('Jabatan', r.jabatan) +
            row('Dept / Bag', (d.karyawan && d.karyawan.dept) || '-') +
            '<table style="width:100%;border-collapse:collapse;font-size:.8em;margin-top:8px">' +
            '<thead><tr style="background:#f0f0f0">' +
            '<th>Hari/Tanggal</th><th>Dari Jam</th><th>Selesai</th><th>Tujuan</th><th>Langsung dr Rumah</th><th>Kembali ke Kantor</th>' +
            '</tr></thead><tbody>' + tableRows + '</tbody></table>' +
            row('Kendaraan', d.kendaraan || '-') +
            '<div class="sg" style="display:flex;gap:16px;margin-top:16px;justify-content:space-between">' +
            sigBox('Dibuat oleh', r.signature_applicant, d.nama_jelas || r.nama, '') +
            sigBox('Disetujui oleh', r.signature_approver, d.atasan_nama || (r.ap && r.ap.n) || '', '') +
            '</div>';
    }

    function renderDinasLuar(r) {
        var d = r.form_data || {};
        var itinerary = Array.isArray(d.itinerary) ? d.itinerary : [];
        var transportasi = Array.isArray(d.transportasi) ? d.transportasi : [];
        var lokasi = Array.isArray(d.lokasi) ? d.lokasi : [];

        var itRows = itinerary.map(function (it, i) {
            return '<tr><td>' + (i + 1) + '</td>' +
                '<td>' + esc(it.tempat || '') + '</td>' +
                '<td>' + esc(it.tanggal || '') + ' ' + esc(it.jam || '') + '</td>' +
                '<td>' + esc(it.keperluan || '') + '</td></tr>';
        }).join('') || '<tr><td colspan="4" style="text-align:center;color:#888">-</td></tr>';

        var tpRows = transportasi.map(function (tp, i) {
            return '<tr><td>' + (i + 1) + '</td><td>' + esc(tp.transportasi || '') + '</td><td>' + esc(tp.pergi || '') + '</td><td>' + esc(tp.pulang || '') + '</td></tr>';
        }).join('');

        var lkRows = lokasi.map(function (lk, i) {
            return '<tr><td>' + (i + 1) + '</td><td>' + esc(lk.lokasi || '') + '</td><td>' + esc(lk.estimasi_jarak || '') + '</td><td>' + esc(lk.total_jarak || '') + '</td></tr>';
        }).join('');

        return LOGO +
            '<h4 style="text-align:center">SURAT PERINTAH TUGAS</h4>' +
            (d.nomor ? '<p style="text-align:center;font-size:.85em"><b>NO: ' + esc(d.nomor) + '</b></p>' : '') +
            '<p style="font-size:.82em">Kami yang bertanda tangan di bawah ini menerangkan bahwa:</p>' +
            row('Nama', r.nama) +
            row('Jabatan', r.jabatan) +
            '<p style="font-size:.82em">Untuk melaksanakan Tugas Perjalanan Dinas.</p>' +
            '<p style="font-weight:600;margin:6px 0 2px">Detail Acara (Itinerary):</p>' +
            '<table style="width:100%;border-collapse:collapse;font-size:.8em"><thead><tr style="background:#f0f0f0">' +
            '<th>No.</th><th>Tempat</th><th>Hari, Tanggal dan Waktu</th><th>Keperluan</th>' +
            '</tr></thead><tbody>' + itRows + '</tbody></table>' +
            '<div class="sg" style="display:flex;gap:16px;margin-top:16px;justify-content:space-between">' +
            sigBox('Pemberi Tugas', r.signature_approver, d.pemberi_nama || (r.ap && r.ap.n) || '', d.tanggal || r.tgl) +
            sigBox('Penerima Tugas', r.signature_applicant, d.penerima_nama || r.nama, '') +
            '</div>' +
            (tpRows ? '<p style="font-weight:600;margin:12px 0 2px">Detail Transportasi:</p>' +
            '<table style="width:100%;border-collapse:collapse;font-size:.8em"><thead><tr style="background:#f0f0f0">' +
            '<th>No.</th><th>Transportasi</th><th>Pergi</th><th>Pulang</th>' +
            '</tr></thead><tbody>' + tpRows + '</tbody></table>' : '') +
            (lkRows ? '<p style="font-weight:600;margin:12px 0 2px">Detail Lokasi:</p>' +
            '<table style="width:100%;border-collapse:collapse;font-size:.8em"><thead><tr style="background:#f0f0f0">' +
            '<th>No.</th><th>Lokasi</th><th>Estimasi Jarak</th><th>Total Jarak</th>' +
            '</tr></thead><tbody>' + lkRows + '</tbody></table>' : '');
    }

    function renderAbsensi(r) {
        var d = r.form_data || {};
        var jenisMap = { cuti_haid: '1. CUTI HAID (KHUSUS KARYAWATI)', mesin_error: '2. MESIN ABSENSI ERROR', lupa_absen: '3. TIDAK ABSEN / LUPA ABSEN' };
        var jenisTxt = jenisMap[d.jenis] || esc(d.jenis || '-');

        return LOGO +
            '<h4 style="text-align:center">FORM ABSENSI</h4>' +
            '<div style="border:1px solid #ddd;border-radius:4px;padding:8px;margin-bottom:8px;font-size:.85em">' +
            '<p style="margin:0 0 4px;font-weight:600">PILIH SALAH SATU BILA:</p>' +
            checkItem('1. CUTI HAID (KHUSUS KARYAWATI)', d.jenis === 'cuti_haid') +
            checkItem('2. MESIN ABSENSI ERROR', d.jenis === 'mesin_error') +
            checkItem('3. TIDAK ABSEN / LUPA ABSEN', d.jenis === 'lupa_absen') +
            '</div>' +
            row('NAMA', r.nama) +
            row('DIVISI', d.divisi || '-') +
            row('POSISI', d.posisi || '-') +
            row('TANGGAL', d.tanggal || '-') +
            row('JAM', d.jam || '-') +
            row('ALASAN', d.alasan || '-') +
            '<div class="sg" style="display:flex;gap:16px;margin-top:16px;justify-content:space-between">' +
            sigBox('Diajukan oleh', r.signature_applicant, d.pengaju_nama || r.nama, '') +
            sigBox('Disetujui oleh,<br>Kepala Bagian', r.signature_approver, (r.ap && r.ap.n) || '', '') +
            '</div>';
    }

    // ---- helpers ----

    function checkItem(label, checked) {
        return '<span style="display:inline-block;margin-right:12px">' +
            (checked ? '☑' : '☐') + ' ' + esc(label) + '</span>';
    }

    function formatTanggal(iso) {
        if (!iso) return '-';
        var p = iso.split('-');
        if (p.length !== 3) return iso;
        var d = new Date(+p[0], +p[1] - 1, +p[2]);
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    // ---- main render ----

    function render(r) {
        var inner;
        switch (r.form_type) {
            case 'izin-cuti-atau-sakit':
                inner = renderCuti(r);
                break;
            case 'izin-keluar-kantor':
                inner = renderKeluar(r);
                break;
            case 'izin-dinas-dalam-kota':
                inner = renderDiasDalam(r);
                break;
            case 'izin-dinas-luar-kota':
                inner = renderDinasLuar(r);
                break;
            case 'form-absensi':
                inner = renderAbsensi(r);
                break;
            default:
                inner = '<p>Jenis form tidak diketahui.</p>';
        }
        return '<div class="paper" style="background:#fff;padding:24px;font-size:.88rem;line-height:1.5">' + inner + '</div>';
    }

    window.PermohonanPreview = { render: render };

})(window);
