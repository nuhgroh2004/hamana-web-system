/* Halaman Absensi — Hitung Berangkat (UI).
   Data yang ditampilkan memakai contoh lokal supaya seluruh tampilan bisa
   dievaluasi tanpa memanggil backend. Struktur kolom, tab, dan modal sama
   dengan halaman sumber. */

const initializedRoots = new WeakSet();
const HB = (window.HB = window.HB || {});
HB.render = HB.render || {};

const $ = (id) => document.getElementById(id);
const pad2 = (n) => String(n).padStart(2, '0');

// Penutup modal edit dipasang sekali di tingkat dokumen agar tetap bekerja
// setelah Livewire mengganti isi halaman (navigasi SPA).
document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') document.getElementById('hbEdit')?.classList.remove('on');
});

function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const hariIniWIB = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

function isoTanggal(t) {
    t = String(t ?? '');
    let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(t);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(t);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return null;
}

function masaDepan(a) {
    const iso = isoTanggal(typeof a === 'string' ? a : a && a.tanggal);
    return !!iso && iso > hariIniWIB();
}

function masihBerjalan(a) {
    const iso = isoTanggal(a.tanggal);
    if (!iso) return false;
    if (iso === hariIniWIB()) return true;
    const jam = /^(\d{1,2}):(\d{2})/.exec(String(a.jam_masuk ?? ''));
    if (!jam) return false;
    const mulai = new Date(`${iso}T${jam[1].padStart(2, '0')}:${jam[2]}:00+07:00`);
    return !isNaN(mulai) && Date.now() - mulai.getTime() < 24 * 3600 * 1000;
}

/* ---------- status ---------- */
function statusAbsensi(a) {
    const libur = !!a.libur_nama || a.status_absensi === 'Hari Libur';

    if (a.jam_masuk || a.jam_keluar) {
        const jalan = !(a.jam_masuk && a.jam_keluar) && masihBerjalan(a);
        return { teks: 'Hadir', jenis: 'b-ok', kunci: jalan ? 'berjalan' : 'hadir', libur };
    }

    const s = a.status_absensi;
    if (libur) return { teks: 'Hari Libur', jenis: 'b-info', kunci: 'libur', libur: true };

    if (masaDepan(a)) {
        if (s && /^(Cuti|Sakit|Izin|Dinas)\b/.test(s)) return { teks: s, jenis: 'b-warn', kunci: 'cuti' };
        return null;
    }

    if (s === 'Tidak Ada Tap') return { teks: 'Tidak Absen', jenis: 'b-bad', kunci: 'tidak' };
    if (s) {
        if (/^(Cuti|Sakit|Izin|Dinas)\b/.test(s)) return { teks: s, jenis: 'b-warn', kunci: 'cuti' };
        return { teks: s, jenis: 'b-bad', kunci: 'tidak' };
    }
    return null;
}

const jenisMasuk = (s) => (s === 'Tepat Waktu' ? 'b-ok' : 'b-warn');
const jenisKeluar = (s) => (String(s).trim() === 'Tepat Waktu' ? 'b-ok' : 'b-warn');

function badge(teks, jenis) {
    if (teks == null) return '<span class="b-none">—</span>';
    return `<span class="badge ${jenis}">${esc(teks)}</span>`;
}

function badgeKet(teks) {
    if (teks == null || teks === '') return '<span class="b-none">-</span>';
    const jenis = /^(Cuti|Sakit|Izin|Dinas)\b/.test(String(teks)) ? 'b-warn' : 'b-info';
    return `<span class="badge ${jenis}">${esc(teks)}</span>`;
}

function hitung(e) {
    const att = e.attendance || [];
    let berangkat = 0, terlambat = 0, tidak = 0, berjalan = 0, libur = 0;

    for (let i = 0; i < att.length; i++) {
        const a = att[i];
        if (masaDepan(a)) continue;

        const s = statusAbsensi(a);
        if (s && s.libur) { libur++; continue; }

        if (a.jam_masuk || a.jam_keluar) berangkat++;
        if (a.status_masuk === 'Terlambat') terlambat++;
        if (s && s.kunci === 'tidak') tidak++;
        if (s && s.kunci === 'berjalan') berjalan++;
    }

    return { berangkat: Number(e.total_berangkat) || berangkat, terlambat, tidak, berjalan, libur };
}

/* ---------- data contoh ---------- */
const DEPARTEMEN_CONTOH = ['Produksi', 'Logistik', 'Keuangan', 'HRD'];

function buatDataContoh(bulanYM) {
    const hariIni = hariIniWIB();
    const ym = bulanYM || hariIni.slice(0, 7);
    const tahun = Number(ym.slice(0, 4));
    const bulan = Number(ym.slice(5, 7));
    const akhirBulan = new Date(tahun, bulan, 0).getDate();
    const sampaiHari = ym === hariIni.slice(0, 7)
        ? Number(hariIni.slice(8))
        : ym < hariIni.slice(0, 7)
          ? akhirBulan
          : 0;

    const karyawan = [
        ['2021001', 'Andi Pratama', 'Produksi', 'Operator'],
        ['2021002', 'Siti Aminah', 'Produksi', 'Quality Control'],
        ['2021003', 'Budi Santoso', 'Logistik', 'Staff Gudang'],
        ['2021004', 'Dewi Lestari', 'Keuangan', 'Staff Akuntansi'],
        ['2021005', 'Eko Nugroho', 'Produksi', 'Leader Produksi'],
        ['2021006', 'Rina Wulandari', 'HRD', 'Staff Personalia'],
        ['2021007', 'Joko Susilo', 'Logistik', 'Driver'],
        ['2021008', 'Maya Sari', 'Keuangan', 'Supervisor Keuangan'],
    ];

    const cuti = [
        ['Sakit', 'Surat dokter'],
        ['Cuti Tahunan', 'Cuti tahunan'],
        ['Dinas Dalam Kota', 'Kunjungan vendor'],
        ['Izin Keluar Kantor', 'Urusan bank'],
        ['Cuti Haid', 'Cuti haid'],
    ];

    return karyawan.map(function (k, idx) {
        const attendance = [];

        for (let d = 1; d <= sampaiHari; d++) {
            const tanggal = `${tahun}-${pad2(bulan)}-${pad2(d)}`;
            const hari = new Date(tanggal + 'T00:00:00Z').getUTCDay();

            if (hari === 0 || hari === 6) {
                attendance.push({
                    tanggal,
                    jam_masuk: null, jam_keluar: null,
                    status_masuk: null, status_keluar: null,
                    status_absensi: 'Hari Libur', keterangan: null,
                    libur_nama: 'Akhir Pekan',
                });
                continue;
            }

            const pola = (idx * 7 + d * 3) % 11;

            if (pola === 4) {
                attendance.push({
                    tanggal,
                    jam_masuk: null, jam_keluar: null,
                    status_masuk: null, status_keluar: null,
                    status_absensi: 'Tidak Ada Tap', keterangan: null,
                });
                continue;
            }

            if (pola === 7) {
                const c = cuti[(idx + d) % cuti.length];
                attendance.push({
                    tanggal,
                    jam_masuk: null, jam_keluar: null,
                    status_masuk: null, status_keluar: null,
                    status_absensi: c[0], keterangan: c[1],
                });
                continue;
            }

            const telat = pola === 1 || pola === 9;
            const awal = pola === 2;
            const masuk = telat ? `08:${pad2(10 + (d % 15))}` : `07:${45 + (d % 10)}`;
            const keluar = awal ? `16:${pad2(20 + (d % 20))}` : `17:0${d % 10}`;

            attendance.push({
                tanggal,
                jam_masuk: masuk + ':00',
                jam_keluar: keluar + ':00',
                status_masuk: telat ? 'Terlambat' : 'Tepat Waktu',
                status_keluar: awal ? 'Pulang Lebih Awal' : 'Tepat Waktu',
                status_absensi: telat ? 'Terlambat' : awal ? 'Pulang Lebih Awal' : 'Hadir',
                keterangan: null,
            });
        }

        const total = attendance.filter((a) => a.jam_masuk || a.jam_keluar).length;

        return {
            nik: k[0],
            nama: k[1],
            nama_roster: k[1],
            departemen: k[2],
            _div: k[2],
            jabatan: k[3],
            attendance,
            total_berangkat: total,
        };
    });
}

function buatTahunContoh(tahun) {
    const sekarang = hariIniWIB();
    const bulanSekarang = Number(sekarang.slice(5, 7));
    const bulan = [];

    for (let i = 0; i < 12; i++) {
        const baris = {};
        DEPARTEMEN_CONTOH.forEach(function (d, j) {
            if (i + 1 > bulanSekarang) return;

            const lewat = i + 1 < bulanSekarang;
            const hari = lewat ? 20 : Number(sekarang.slice(8));
            const tidak = hari ? (i + j) % 3 : 0;
            baris[d] = {
                berangkat: Math.max(0, hari - tidak),
                hari,
                tidak,
                terlambat: hari ? (i + j) % 5 : 0,
                dinas: lewat ? (i + j) % 2 : 0,
                sakit: lewat ? (i + j) % 2 : 0,
                cuti_tahunan: lewat ? (i + j) % 3 : 0,
                cuti_haid: lewat && j % 2 === 0 ? 1 : 0,
                eksternal: lewat && j % 3 === 0 ? 1 : 0,
                lembur: 0,
            };
        });
        bulan.push(baris);
    }

    return {
        tahun: String(tahun),
        bulan,
        karyawan: { Produksi: 3, Logistik: 2, Keuangan: 2, HRD: 1 },
        libur: [],
    };
}

/* ---------- state ---------- */
function initHitungBerangkat() {
    const root = $('hitung-berangkat');
    if (!root || initializedRoots.has(root)) return;

    initializedRoots.add(root);

    const TAB_AKTIF = ['hariini', 'tabel', 'grafik', 'rekap'];
    const KUNCI_TAB = 'hitung-berangkat-tab';
    const kotor = { hariini: true, tabel: true, grafik: true, rekap: true };

    let bulanData = hariIniWIB().slice(0, 7);
    let semuaData = buatDataContoh(bulanData);
    let tabAktif = 'hariini';
    let siap = false;
    let dataTerakhir = [];
    const cacheTahun = {};

    HB.$ = $;
    HB.esc = esc;
    HB.badge = badge;
    HB.badgeKet = badgeKet;
    HB.hitung = hitung;
    HB.statusAbsensi = statusAbsensi;
    HB.jenisMasuk = jenisMasuk;
    HB.jenisKeluar = jenisKeluar;
    HB.isoTanggal = isoTanggal;
    HB.hariIniWIB = hariIniWIB;
    HB.masaDepan = masaDepan;
    HB.liburData = [];
    HB.liburMap = {};
    HB.dataSemua = () => semuaData;
    HB.periodeData = {
        month: bulanData,
        timezone: 'Asia/Jakarta',
    };
    HB.namaLibur = () => '';
    HB.tahunPerlu = hariIniWIB().slice(0, 4);
    HB.tahun = function (tahun) {
        tahun = String(tahun);
        if (!cacheTahun[tahun]) cacheTahun[tahun] = buatTahunContoh(tahun);
        return cacheTahun[tahun];
    };

    function toast(teks) {
        const el = $('toast');
        if (!el) return;
        el.textContent = teks;
        el.classList.add('on');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => el.classList.remove('on'), 2600);
    }
    HB.toast = toast;

    /* ---------- filter ---------- */
    function tersaring(abaikanDepartemen) {
        const q = ($('cari')?.value || '').trim().toLowerCase();
        const dv = abaikanDepartemen ? '' : $('departemen')?.value || '';
        return semuaData.filter(
            (e) =>
                (!dv || e._div === dv) &&
                (!q || String(e.nama).toLowerCase().includes(q) || String(e.nik).toLowerCase().includes(q)),
        );
    }

    function isiPilihanDepartemen() {
        const sel = $('departemen');
        if (!sel) return;
        const lama = sel.value;
        const daftar = [...new Set(semuaData.map((e) => e._div))].sort();
        sel.innerHTML =
            '<option value="">Semua departemen</option>' +
            daftar
                .map((d) => `<option value="${esc(d)}">${esc(d)} (${semuaData.filter((e) => e._div === d).length})</option>`)
                .join('');
        sel.value = daftar.includes(lama) ? lama : '';
    }

    function tampilkanPesan(teks, jenis) {
        const el = $('pesan');
        if (el) el.innerHTML = teks ? `<div class="msg ${jenis}">${esc(teks)}</div>` : '';
    }

    function gambarStats(data) {
        const h = data.map(hitung);
        const jml = (k) => h.reduce((n, x) => n + x[k], 0);
        const stats = [
            [data.length, 'Karyawan'],
            [jml('berangkat'), 'Jumlah berangkat'],
            [jml('terlambat'), 'Keterlambatan masuk'],
            [jml('tidak'), 'Absensi tidak lengkap'],
            [jml('berjalan'), 'Masih berjalan (&lt;24 jam)'],
        ];
        const host = $('stats');
        if (!host) return;
        host.innerHTML = stats.map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');
        host.hidden = false;
    }

    /* ---------- render ---------- */
    function renderTab(nama, data) {
        const fn = (HB.render && HB.render[nama]) || function () {};
        fn(data);
        kotor[nama] = false;
    }

    function tandaiSemuaKotor() {
        TAB_AKTIF.forEach((t) => (kotor[t] = true));
    }

    function gambar() {
        const data = tersaring(false);
        dataTerakhir = data;
        gambarStats(data);
        tandaiSemuaKotor();
        renderTab(tabAktif, data);
    }
    HB.gambar = gambar;

    function pilihTab(nama) {
        if (!TAB_AKTIF.includes(nama)) nama = 'hariini';
        tabAktif = nama;
        TAB_AKTIF.forEach((t) => {
            const tab = $('tab-' + t);
            const panel = $('panel-' + t);
            if (tab) tab.setAttribute('aria-selected', String(t === nama));
            if (panel) panel.hidden = t !== nama;
        });
        try { localStorage.setItem(KUNCI_TAB, nama); } catch (_) {}

        if (siap && kotor[nama]) renderTab(nama, dataTerakhir);
    }

    function muat() {
        const bulanInput = ($('bulan')?.value || bulanData || hariIniWIB().slice(0, 7)).slice(0, 7);
        const dari = $('dari')?.value || '';
        const sampai = $('sampai')?.value || '';

        if ((dari && !sampai) || (!dari && sampai)) {
            tampilkanPesan("Isi tanggal 'Dari' dan 'Sampai', atau kosongkan keduanya.", 'error');
            return;
        }
        if (dari && sampai && dari > sampai) {
            tampilkanPesan("Tanggal 'dari' harus sebelum tanggal 'sampai'.", 'error');
            return;
        }

        bulanData = bulanInput;
        let data = buatDataContoh(bulanData);

        if (dari && sampai) {
            data = data.map(function (e) {
                const attendance = (e.attendance || []).filter(function (a) {
                    const iso = isoTanggal(a.tanggal);
                    return iso && iso >= dari && iso <= sampai;
                });
                return Object.assign({}, e, {
                    attendance,
                    total_berangkat: attendance.filter(function (a) {
                        return a.jam_masuk || a.jam_keluar;
                    }).length,
                });
            });
            HB.periodeData = { dari, sampai, timezone: 'Asia/Jakarta' };
        } else {
            HB.periodeData = { month: bulanData, timezone: 'Asia/Jakarta' };
        }

        semuaData = data;
        HB.tahunPerlu = String(HB.periodeData.sampai || HB.periodeData.month).slice(0, 4);
        isiPilihanDepartemen();
        siap = true;

        const per = HB.periodeData;
        const label = per.dari ? `${per.dari} – ${per.sampai}` : per.month;
        const elPeriode = $('periode');
        if (elPeriode) {
            elPeriode.textContent = `Periode ${label} · zona waktu ${per.timezone}`;
        }

        tampilkanPesan('', '');
        gambar();
        const konten = $('konten');
        if (konten) konten.hidden = false;
    }

    /* ---------- tab hari ini ---------- */
    HB.render.hariini = function (data) {
        const tb = $('isi-hariini');
        if (!tb) return;
        const iso = hariIniWIB();
        const libur = HB.namaLibur(iso);
        const info = $('info-libur-hariini');
        const baris = [];

        if (info) {
            info.hidden = !libur;
            info.innerHTML = libur ? '<b>Hari Libur Nasional:</b> ' + esc(libur) + ' · ' + esc(iso) : '';
        }

        data.forEach(function (e) {
            const a = (e.attendance || []).find((x) => isoTanggal(x.tanggal) === iso);
            if (!a) return;
            const s = statusAbsensi(a);
            baris.push(`
                <tr>
                    <td>${esc(e.nik)}</td>
                    <td>${esc(e.nama)}</td>
                    <td class="div-tag">${esc(e._div)}</td>
                    <td>${esc(a.jam_masuk ?? '—')}</td>
                    <td>${badge(a.status_masuk, jenisMasuk(a.status_masuk))}</td>
                    <td>${esc(a.jam_keluar ?? '—')}</td>
                    <td>${badge(a.status_keluar, jenisKeluar(a.status_keluar))}</td>
                    <td>${s ? badge(s.teks, s.jenis) : badge(null)}</td>
                    <td>${badgeKet(a.keterangan)}</td>
                </tr>`);
        });

        tb.innerHTML = baris.length
            ? baris.join('')
            : `<tr><td colspan="9" class="b-none">Tidak ada data absensi untuk hari ini (${iso}).</td></tr>`;
    };

    /* ---------- tab tabel ---------- */
    let dataTabel = [];
    const tbodyTabel = $('isi');

    function detailHtml(e) {
        const baris = (e.attendance || [])
            .map(function (a, ai) {
                const s = statusAbsensi(a);
                const depan = masaDepan(a);
                let cls = s && s.libur ? 'det is-libur' : 'det';
                if (depan) cls += ' is-depan';
                return `
                    <tr class="${cls}" data-ai="${ai}" title="${depan ? 'Tanggal belum tiba' : 'Double-klik untuk edit absen manual'}">
                        <td>${esc(a.tanggal)}</td>
                        <td>${esc(a.jam_masuk ?? '—')}</td>
                        <td>${badge(a.status_masuk, jenisMasuk(a.status_masuk))}</td>
                        <td>${esc(a.jam_keluar ?? '—')}</td>
                        <td>${badge(a.status_keluar, jenisKeluar(a.status_keluar))}</td>
                        <td>${s ? badge(s.teks, s.jenis) : badge(null)}</td>
                        <td>${badgeKet(a.keterangan)}</td>
                    </tr>`;
            })
            .join('');

        return (
            '<div class="detail-inner"><table><thead><tr>' +
            '<th>Tanggal</th><th>Jam masuk</th><th>Status masuk</th>' +
            '<th>Jam keluar</th><th>Status keluar</th><th>Status absensi</th><th>Keterangan</th>' +
            '</tr></thead><tbody>' +
            (baris || '<tr><td colspan="7" class="b-none">Belum ada data kehadiran.</td></tr>') +
            '</tbody></table></div>'
        );
    }

    function isiDetail(i) {
        const d = document.getElementById('d' + i);
        if (!d || d.dataset.terisi === '1') return d;
        const e = dataTabel[i];
        if (!e) return d;
        d.querySelector('td').innerHTML = detailHtml(e);
        d.dataset.terisi = '1';
        return d;
    }

    function aturBaris(i, buka) {
        const d = isiDetail(i);
        if (!d) return;
        d.hidden = !buka;
        const tr = tbodyTabel?.querySelector('tr.emp[data-i="' + i + '"]');
        if (tr) {
            tr.classList.toggle('open', buka);
            tr.setAttribute('aria-expanded', String(buka));
        }
    }

    function toggle(i) {
        const d = document.getElementById('d' + i);
        if (!d) return;
        aturBaris(i, !!d.hidden);
    }

    HB.bukaDetail = function (i) {
        aturBaris(i, true);
    };

    HB.render.tabel = function (data) {
        dataTabel = data || [];
        if (!tbodyTabel) return;

        if (!dataTabel.length) {
            tbodyTabel.innerHTML = '<tr><td colspan="7" class="b-none">Tidak ada karyawan yang cocok.</td></tr>';
            return;
        }

        tbodyTabel.innerHTML = dataTabel
            .map(function (e, i) {
                const h = hitung(e);
                return `
                    <tr class="emp" data-i="${i}" tabindex="0" role="button" aria-expanded="false">
                        <td>${esc(e.nik)}</td>
                        <td><span class="chev">▸</span>${esc(e.nama)}</td>
                        <td class="div-tag">${esc(e._div)}</td>
                        <td class="num">${h.berangkat}</td>
                        <td class="num">${h.terlambat}</td>
                        <td class="num">${h.tidak}</td>
                        <td class="num">${h.libur}</td>
                    </tr>
                    <tr class="detail" id="d${i}" data-i="${i}" hidden>
                        <td colspan="7"></td>
                    </tr>`;
            })
            .join('');
    };

    if (tbodyTabel) {
        tbodyTabel.addEventListener('click', function (ev) {
            const tr = ev.target.closest('tr.emp');
            if (tr) toggle(+tr.dataset.i);
        });

        tbodyTabel.addEventListener('keydown', function (ev) {
            if (ev.key !== 'Enter' && ev.key !== ' ') return;
            const tr = ev.target.closest('tr.emp');
            if (!tr) return;
            ev.preventDefault();
            toggle(+tr.dataset.i);
        });

        tbodyTabel.addEventListener('dblclick', function (ev) {
            const tr = ev.target.closest('tr.det');
            if (!tr) return;
            const induk = tr.closest('tr.detail');
            const i = induk ? +induk.dataset.i : NaN;
            const e = dataTabel[i];
            const a = e && (e.attendance || [])[+tr.dataset.ai];
            if (e && a) HBEditAbsen(e, a, i);
        });
    }

    /* ---------- modal edit (tanpa backend) ---------- */
    let editCur = null;

    function jamHM(s) {
        const m = /^(\d{2}:\d{2})/.exec(String(s || ''));
        return m ? m[1] : '';
    }

    function fmtTgl(s) {
        const p = String(s || '').split('-');
        return p.length < 3 ? s : p[2] + '/' + p[1] + '/' + p[0];
    }

    function namaHari(s) {
        const d = new Date(String(s) + 'T00:00:00');
        return isNaN(d) ? '' : ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
    }

    function hitungStatus(jm, jk) {
        const menit = (v) => {
            const m = /^(\d{1,2}):(\d{2})/.exec(String(v || ''));
            return m ? +m[1] * 60 + +m[2] : null;
        };
        const a = menit(jm);
        const b = menit(jk);
        return {
            status_masuk: a == null ? null : a > 8 * 60 ? 'Terlambat' : 'Tepat Waktu',
            status_keluar: b == null ? null : b < 17 * 60 ? 'Pulang Lebih Awal' : 'Tepat Waktu',
            status_absensi: a != null || b != null ? 'Hadir' : 'Tidak Ada Tap',
        };
    }

    window.HBEditAbsen = function (emp, att, idx) {
        editCur = { emp, att, idx };
        const judul = $('hbEdT');
        if (judul) judul.textContent = fmtTgl(att.tanggal) + ' · ' + namaHari(att.tanggal);
        const who = $('hbEdWho');
        if (who) {
            who.innerHTML =
                '<b>' + esc(emp.nama) + '</b> · NIK ' + esc(emp.nik) +
                (emp._div && emp._div !== '-' ? ' · ' + esc(emp._div) : '');
        }
        if ($('hbEdJM')) $('hbEdJM').value = jamHM(att.jam_masuk);
        if ($('hbEdJK')) $('hbEdJK').value = jamHM(att.jam_keluar);
        $('hbEdit')?.classList.add('on');
    };

    function tutupEdit() {
        $('hbEdit')?.classList.remove('on');
    }

    document.querySelectorAll('#hbEdit [data-x]').forEach((b) => b.addEventListener('click', tutupEdit));

    $('hbEdSave')?.addEventListener('click', function () {
        if (!editCur) return;
        const { emp, att, idx } = editCur;
        const jm = $('hbEdJM')?.value || '';
        const jk = $('hbEdJK')?.value || '';

        if (!jm && !jk && !window.confirm('Jam masuk dan jam keluar dikosongkan. Lanjutkan?')) return;

        att.jam_masuk = jm ? jm + ':00' : null;
        att.jam_keluar = jk ? jk + ':00' : null;
        Object.assign(att, hitungStatus(jm, jk));
        att.libur_nama = null;

        emp.total_berangkat = (emp.attendance || []).filter((a) => (a.jam_masuk || a.jam_keluar) && !masaDepan(a)).length;

        tutupEdit();
        toast('Perubahan hanya tersimpan di tampilan (backend belum terhubung).');
        gambar();
        HB.bukaDetail(idx);
    });

    $('hbEdit')?.addEventListener('click', function (ev) {
        if (ev.target === this) tutupEdit();
    });

    /* ---------- event filter ---------- */
    $('muat')?.addEventListener('click', function () {
        muat();
        toast('Mode UI: data contoh, backend belum terhubung.');
    });

    $('bulan')?.addEventListener('change', function () {
        muat();
        toast('Mode UI: data contoh, backend belum terhubung.');
    });

    let timerCari = null;
    $('cari')?.addEventListener('input', function () {
        clearTimeout(timerCari);
        timerCari = setTimeout(gambar, 200);
    });

    $('departemen')?.addEventListener('change', gambar);

    TAB_AKTIF.forEach(function (t) {
        $('tab-' + t)?.addEventListener('click', () => pilihTab(t));
    });

    /* ---------- mulai ---------- */
    let tersimpan = 'hariini';
    try { tersimpan = localStorage.getItem(KUNCI_TAB) || 'hariini'; } catch (_) {}
    pilihTab(tersimpan);

    // Jadwalkan render pertama setelah seluruh modul (grafik/rekap/laporan)
    // selesai dievaluasi, supaya tab tersimpan di localStorage langsung terisi.
    setTimeout(muat, 0);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHitungBerangkat, { once: true });
} else {
    initHitungBerangkat();
}

document.addEventListener('livewire:navigated', initHitungBerangkat);


/* Tab Grafik — tren harian, perbandingan bulanan per departemen, dan
   rekap per karyawan. Data tahunan berasal dari contoh lokal di script.js. */

(function (HB) {
    HB.render = HB.render || {};

    var SVGNS = 'http://www.w3.org/2000/svg';
    var WARNA = ['#0969da', '#1a7f37', '#8250df', '#9a6700', '#0e7490', '#bc4c00', '#cf222e', '#59636e', '#6e7781'];
    var NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    var rootMetrik = new WeakSet();

    var el = function (tag, attrs, teks) {
        var n = document.createElementNS(SVGNS, tag);
        attrs = attrs || {};
        for (var k in attrs) n.setAttribute(k, attrs[k]);
        if (teks != null) n.textContent = teks;
        return n;
    };

    var potong = function (s, n) {
        s = String(s);
        return s.length > n ? s.slice(0, n - 1) + '…' : s;
    };

    function kosong(host) {
        host.innerHTML = '<p class="b-none">Belum ada data untuk ditampilkan.</p>';
    }

    function grafikHarian(data) {
        var $ = HB.$;
        var host = $('g-harian');
        if (!host) return;
        host.innerHTML = '';

        var per = {};
        data.forEach(function (e) {
            (e.attendance || []).forEach(function (a) {
                if (HB.masaDepan(a)) return;
                var iso = HB.isoTanggal(a.tanggal);
                if (!iso) return;
                var d = (per[iso] = per[iso] || { berangkat: 0, terlambat: 0, tidak: 0 });
                var s = HB.statusAbsensi(a);
                if (s && s.libur) return;
                if (a.jam_masuk || a.jam_keluar) d.berangkat++;
                if (s && s.kunci === 'tidak') d.tidak++;
                if (a.status_masuk === 'Terlambat') d.terlambat++;
            });
        });

        var hari = Object.keys(per).sort();
        if (!hari.length) return kosong(host);

        var W = 820, H = 300, L = 40, R = 16, T = 12, B = 34;
        var maks = Math.max.apply(null, [1].concat(hari.map(function (h) { return Math.max(per[h].berangkat, per[h].terlambat, per[h].tidak); })));
        var langkah = maks <= 5 ? 1 : Math.ceil(maks / 5);
        var atas = Math.ceil(maks / langkah) * langkah;
        var x = function (i) { return L + (hari.length === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (hari.length - 1)); };
        var y = function (v) { return T + (H - T - B) * (1 - v / atas); };
        var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Grafik garis kehadiran harian' });

        for (var v = 0; v <= atas; v += langkah) {
            svg.append(el('line', { class: 'grid', x1: L, x2: W - R, y1: y(v), y2: y(v) }));
            svg.append(el('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end' }, v));
        }

        var lompat = Math.ceil(hari.length / 16);
        hari.forEach(function (h, i) {
            if (i % lompat === 0) svg.append(el('text', { x: x(i), y: H - 12, 'text-anchor': 'middle' }, String(Number(h.slice(8)))));
        });

        [['berangkat', 'info'], ['terlambat', 'warn'], ['tidak', 'bad']].forEach(function (pair) {
            var k = pair[0], c = pair[1];
            svg.append(el('polyline', {
                class: 's-' + c,
                fill: 'none',
                'stroke-width': 2.5,
                'stroke-linejoin': 'round',
                points: hari.map(function (h, i) { return x(i) + ',' + y(per[h][k]); }).join(' '),
            }));
            hari.forEach(function (h, i) {
                var p = el('rect', { class: 'f-' + c, x: x(i) - 3, y: y(per[h][k]) - 3, width: 6, height: 6 });
                p.append(el('title', {}, h + ': ' + per[h][k]));
                svg.append(p);
            });
        });

        host.append(svg);
    }

    function grafikBulanan() {
        var $ = HB.$;
        var host = $('g-bulanan');
        if (!host) return;
        host.innerHTML = '';

        var tahun = String(HB.tahunPerlu || HB.hariIniWIB().slice(0, 4));
        var dataTahun = HB.tahun(tahun);
        var metrikEl = $('metrik');
        var divEl = $('departemen');
        var metrik = metrikEl ? metrikEl.value : 'berangkat';
        var dv = divEl ? divEl.value : '';
        var semuaData = HB.dataSemua();

        var daftar = {};
        semuaData.forEach(function (e) { daftar[e._div] = true; });
        (dataTahun.bulan || []).forEach(function (m) {
            Object.keys(m || {}).forEach(function (d) { daftar[d] = true; });
        });
        var semuaDiv = Object.keys(daftar).sort();
        var seri = dv ? [dv] : semuaDiv;
        var warna = function (d) { return WARNA[Math.max(0, semuaDiv.indexOf(d)) % WARNA.length]; };

        var jdl = $('jdl-bulanan');
        if (jdl) jdl.textContent = 'Perbandingan bulanan ' + tahun + ' · ' + (dv || 'per departemen');

        var leg = $('leg-bulanan');
        if (leg) {
            leg.innerHTML = seri
                .map(function (d) { return '<span><i style="background:' + warna(d) + '"></i>' + HB.esc(d) + '</span>'; })
                .join('');
        }

        var per = dataTahun.bulan || [];
        var persen = metrik !== 'terlambat';
        var nilai = function (m, d) {
            var x = (m || {})[d];
            if (!x) return 0;
            if (!persen) return Number(x.terlambat) || 0;
            var total = Number(x.hari) || 0;
            if (!total) return 0;
            return Math.min(100, ((Number(x[metrik]) || 0) / total) * 100);
        };
        var fmt = function (v) { return persen ? v.toFixed(1) + '%' : String(v); };
        var catatan = !persen
            ? 'Jumlah hari terlambat masuk (total semua karyawan departemen)'
            : metrik === 'berangkat'
              ? 'Persentase hari berangkat dari hari non-libur yang sudah lewat'
              : 'Persentase hari absensi tidak lengkap dari hari non-libur yang sudah lewat';

        if (leg) leg.innerHTML += '<span>' + catatan + '</span>';

        var maks = persen ? 100 : Math.max.apply(null, [1].concat(per.map(function (m) {
            return Math.max.apply(null, seri.map(function (d) { return nilai(m, d); }));
        })));
        var langkah = persen ? 20 : maks <= 5 ? 1 : Math.ceil(maks / 5);
        var atas = persen ? 100 : Math.ceil(maks / langkah) * langkah;

        var W = 1100, H = 340, L = 52, R = 10, T = 14, B = 32;
        var gw = (W - L - R) / 12;
        var bw = Math.min(16, (gw - 12) / Math.max(1, seri.length));
        var y = function (v) { return T + (H - T - B) * (1 - v / atas); };
        var svg = el('svg', { class: 'wide', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Grafik batang perbandingan bulanan per departemen' });

        for (var v = 0; v <= atas; v += langkah) {
            svg.append(el('line', { class: 'grid', x1: L, x2: W - R, y1: y(v), y2: y(v) }));
            svg.append(el('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end' }, persen ? v + '%' : v));
        }

        per.forEach(function (m, i) {
            var x0 = L + i * gw + (gw - bw * seri.length) / 2;
            svg.append(el('text', { x: L + i * gw + gw / 2, y: H - 10, 'text-anchor': 'middle' }, NAMA_BULAN[i]));
            seri.forEach(function (d, j) {
                var val = nilai(m, d);
                var r = el('rect', {
                    x: x0 + j * bw,
                    y: y(val),
                    width: Math.max(bw - 1, 1),
                    height: y(0) - y(val),
                    style: 'fill:' + warna(d),
                });
                r.append(el('title', {}, NAMA_BULAN[i] + ' · ' + d + ': ' + (m && m[d] ? fmt(val) : 'tidak ada data')));
                svg.append(r);
                if (seri.length === 1 && val) {
                    svg.append(el('text', { x: x0 + j * bw + bw / 2, y: y(val) - 4, 'text-anchor': 'middle', class: 'val' }, fmt(val)));
                }
            });
        });

        host.append(svg);
    }

    function grafikKaryawan(data) {
        var $ = HB.$;
        var host = $('g-karyawan');
        if (!host) return;
        host.innerHTML = '';
        if (!data.length) return kosong(host);

        var baris = data
            .map(function (e) { return { e: e, h: HB.hitung(e) }; })
            .sort(function (a, b) { return b.h.berangkat - a.h.berangkat; });

        var W = 820, L = 200, R = 140, rh = 22, T = 4;
        var maks = Math.max.apply(null, [1].concat(baris.map(function (b) { return b.h.berangkat; })));
        var H = T + baris.length * rh + 4;
        var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Grafik batang per karyawan' });

        baris.forEach(function (b, i) {
            var y = T + i * rh;
            var ruang = W - L - R;
            var wb = (ruang * b.h.berangkat) / maks;
            svg.append(el('text', { x: L - 10, y: y + 14, 'text-anchor': 'end', class: 'val' }, potong(b.e.nama, 26)));
            svg.append(el('rect', { class: 'f-info', x: L, y: y + 3, width: wb, height: 14 }));
            svg.append(el('text', { x: L + wb + 6, y: y + 14 }, b.h.berangkat + ' · ' + b.h.terlambat + ' tlt'));
        });

        host.append(svg);
    }

    HB.render.grafik = function (data) {
        var $ = HB.$;
        var divEl = $('departemen');
        var dv = divEl ? divEl.value : '';
        var jdlHarian = $('jdl-harian');
        var jdlKaryawan = $('jdl-karyawan');
        if (jdlHarian) jdlHarian.textContent = 'Tren harian · ' + (dv || 'semua karyawan');
        if (jdlKaryawan) jdlKaryawan.textContent = 'Per karyawan · ' + (dv || 'semua departemen');
        grafikHarian(data);
        grafikBulanan();
        grafikKaryawan(data);
    };

    function pasangMetrik() {
        var root = document.getElementById('hitung-berangkat');
        if (!root || rootMetrik.has(root)) return;
        rootMetrik.add(root);

        var metrik = document.getElementById('metrik');
        if (metrik) metrik.addEventListener('change', grafikBulanan);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', pasangMetrik);
    } else {
        pasangMetrik();
    }

    document.addEventListener('livewire:navigated', pasangMetrik);
})(window.HB || (window.HB = {}));


/* Tab Rekap — ringkasan per departemen, rinci per karyawan, dan detail
   harian (mode Bulanan), serta agregat per departemen per bulan (mode
   Tahunan). Semua data berasal dari contoh lokal; unduhan belum aktif. */

(function (HB) {
    HB.render = HB.render || {};

    var BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    var NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    var dataTerkini = [];
    var PILIH = {};

    function kunciKaryawan(nik, nama) {
        return String(nik) + '|' + String(nama);
    }

    function bolehPilih(t) {
        return !!t && t.nama === 'Rekap Karyawan';
    }

    function karyawanTerpilih() {
        var semua = (HB.dataSemua && HB.dataSemua()) || dataTerkini;
        return semua.filter(function (e) {
            return PILIH[kunciKaryawan(e.nik, e.nama)];
        });
    }

    function perbaruiTombolLaporan() {
        var btn = HB.$('laporan-terpilih');
        if (!btn) return;
        var n = karyawanTerpilih().length;
        btn.disabled = n === 0;
        btn.textContent = n ? 'Laporan karyawan (' + n + ')' : 'Laporan karyawan';
    }

    var modeRekap = function () {
        var el = HB.$('mode-rekap');
        return el ? el.value : 'bulanan';
    };
    var tahunSekarang = function () {
        if (HB.tahunPerlu) return String(HB.tahunPerlu);
        var el = HB.$('bulan');
        return String(((el && el.value) || HB.hariIniWIB()).slice(0, 4));
    };
    var labelPeriode = function () {
        var el = HB.$('periode');
        return ((el && el.textContent) || '').replace(/^Periode\s*/, '').split(' · ')[0];
    };

    function liburPeriode() {
        var p = HB.periodeData || {};
        var hariIni = HB.hariIniWIB();
        return (HB.liburData || []).filter(function (x) {
            var t = String((x && x.tanggal) || '').slice(0, 10);
            if (!t) return false;
            if (hariIni && t > hariIni) return false;
            if (p.month) return t.slice(0, 7) === p.month;
            if (p.dari && p.sampai) return t >= p.dari && t <= p.sampai;
            return true;
        });
    }

    function tglPendek(iso) {
        var p = String(iso || '').slice(0, 10).split('-');
        return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(iso || '');
    }

    function liburHtml(daftar) {
        if (!daftar || !daftar.length) return '';
        return '<div class="note-libur"><b>Hari libur nasional:</b> ' +
            daftar.map(function (x) {
                return HB.esc(tglPendek(x.tanggal)) + ' — ' + HB.esc(x.nama || 'Hari Libur');
            }).join('; ') + '</div>';
    }

    function liburTeks(daftar) {
        if (!daftar || !daftar.length) return '';
        return daftar.map(function (x) {
            return tglPendek(x.tanggal) + ' ' + (x.nama || 'Hari Libur');
        }).join('; ');
    }

    function pesanRekap(teks, jenis) {
        var el = HB.$('pesan-rekap');
        if (el) el.innerHTML = teks ? '<div class="msg ' + jenis + '">' + HB.esc(teks) + '</div>' : '';
    }

    /* ---------- indikator ---------- */
    var BATAS_MASUK = 8 * 60;
    var BATAS_KELUAR = 17 * 60;
    var TAP_MINIMAL = 30;

    function menitJam(v) {
        var m = /^(\d{1,2}):(\d{2})/.exec(String(v || ''));
        return m ? +m[1] * 60 + +m[2] : null;
    }

    function teksDurasi(total) {
        total = Math.max(0, Math.round(total || 0));
        var jam = String(Math.floor(total / 60));
        if (jam.length < 2) jam = '0' + jam;
        return jam + ':' + ('0' + (total % 60)).slice(-2);
    }

    function indikatorHarian(a) {
        var masuk = menitJam(a.jam_masuk);
        var keluar = menitJam(a.jam_keluar);
        var telat = 0, awal = 0;

        if (String(a.status_masuk || '') === 'Terlambat' && masuk !== null && masuk > BATAS_MASUK && masuk < 12 * 60) {
            telat = masuk - BATAS_MASUK;
        }

        if (String(a.status_keluar || '') === 'Pulang Lebih Awal' && keluar !== null && keluar < BATAS_KELUAR) {
            var sah = masuk === null || (masuk >= 4 * 60 && keluar - masuk >= TAP_MINIMAL);
            if (sah) awal = BATAS_KELUAR - keluar;
        }

        return { telat: telat, awal: awal };
    }

    function hitungRekap(e) {
        var r = {
            hari: 0, berangkat: 0, tidak: 0, terlambat: 0, pulangAwal: 0, menit: 0,
            menitTerlambat: 0, menitPulangAwal: 0, cuti: 0, libur: 0,
            dinas: 0, sakit: 0, cutiTahunan: 0, cutiHaid: 0, eksternal: 0, lembur: 0,
        };

        (e.attendance || []).forEach(function (a) {
            if (HB.masaDepan(a)) return;
            var s = String(a.status_absensi || '');
            if (a.libur_nama || s === 'Hari Libur') { r.libur++; return; }
            if (/^Dinas\b/.test(s)) { r.dinas++; r.cuti++; return; }
            if (/^Sakit\b/.test(s)) { r.sakit++; r.cuti++; return; }
            if (/^Cuti Haid\b/.test(s)) { r.cutiHaid++; r.cuti++; return; }
            if (/^Cuti (Tahunan|Biasa|Setengah Hari)\b/.test(s)) { r.cutiTahunan++; r.cuti++; return; }
            if (/^Izin Keluar Kantor\b/.test(s)) { r.eksternal++; r.cuti++; return; }
            if (/^(Cuti|Sakit|Izin|Dinas)\b/.test(s)) { r.cuti++; return; }

            r.hari++;
            if (a.jam_masuk || a.jam_keluar) r.berangkat++;
            else r.tidak++;

            var ind = indikatorHarian(a);
            if (ind.telat > 0) { r.terlambat++; r.menitTerlambat += ind.telat; }
            if (ind.awal > 0) { r.pulangAwal++; r.menitPulangAwal += ind.awal; }
            r.menit += ind.telat + ind.awal;
        });

        return r;
    }

    var pct = function (a, b) { return b ? (a / b) * 100 : null; };
    var fm = function (v, k) {
        if (k === 'text') return String(v ?? '');
        if (v == null) return '-';
        if (k === 'pct') return v.toFixed(1) + '%';
        if (k === 'kali') return v + ' Kali';
        if (k === 'dur') return teksDurasi(v);
        return String(v);
    };

    function teksIndikator(i) {
        var bagian = ['Total Hari Kerja: ' + i.hari + ' Hari'];
        if (i.lengkap) {
            bagian.push('Frekuensi Terlambat / Pulang Awal: ' + i.frekuensi + ' Kali');
            bagian.push('Total Akumulasi Waktu: ' + teksDurasi(i.menit));
        } else {
            bagian.push('Frekuensi Terlambat: ' + i.terlambat + ' Kali');
            bagian.push('Akumulasi waktu tersedia pada mode Bulanan');
        }
        return bagian.join('  ·  ');
    }

    var kol = function () {
        return Array.prototype.slice.call(arguments).map(function (d) { return { t: d[0], k: d[1] }; });
    };
    var urut = function (a, b) {
        return String(a[2]).localeCompare(String(b[2])) || String(a[1]).localeCompare(String(b[1]));
    };

    /* ---------- model ---------- */
    function modelBulanan() {
        var $ = HB.$;
        var divEl = $('departemen');
        var cariEl = $('cari');
        var dv = divEl ? divEl.value : '';
        var q = ((cariEl && cariEl.value) || '').trim().toLowerCase();
        var dm = {};
        var rinci = [];
        var ind = {
            hari: 0, terlambat: 0, pulangAwal: 0, frekuensi: 0,
            menitTerlambat: 0, menitPulangAwal: 0, menit: 0, lengkap: true,
        };

        dataTerkini.forEach(function (e) {
            var h = hitungRekap(e);
            var x = dm[e._div] || (dm[e._div] = {
                n: 0, hari: 0, b: 0, t: 0, r: 0, p: 0, menit: 0,
                libur: 0, dinas: 0, sakit: 0, cutiTahunan: 0, cutiHaid: 0, eksternal: 0, lembur: 0,
            });

            x.n++;
            x.hari += h.hari;
            x.b += h.berangkat;
            x.t += h.tidak;
            x.r += h.terlambat;
            x.p += h.pulangAwal;
            x.menit += h.menit;
            x.libur += h.libur;
            x.dinas += h.dinas;
            x.sakit += h.sakit;
            x.cutiTahunan += h.cutiTahunan;
            x.cutiHaid += h.cutiHaid;
            x.eksternal += h.eksternal;
            x.lembur += h.lembur;

            rinci.push([
                e.nik, e.nama, e._div, h.hari, h.berangkat, h.tidak, h.terlambat,
                h.pulangAwal, h.menit, h.libur,
                h.dinas, h.sakit, h.cutiTahunan, h.cutiHaid, h.eksternal, h.lembur,
                pct(h.berangkat, h.hari),
            ]);

            ind.hari += h.hari;
            ind.terlambat += h.terlambat;
            ind.pulangAwal += h.pulangAwal;
            ind.menit += h.menit;
            ind.menitTerlambat += h.menitTerlambat;
            ind.menitPulangAwal += h.menitPulangAwal;
        });

        rinci.sort(urut);
        ind.frekuensi = ind.terlambat + ind.pulangAwal;

        var baris = Object.keys(dm).sort().map(function (d) {
            var x = dm[d];
            return [
                d, x.n, x.hari, x.b, x.t, x.r, x.p, x.menit, x.libur,
                x.dinas, x.sakit, x.cutiTahunan, x.cutiHaid, x.eksternal, x.lembur,
                pct(x.b, x.hari),
            ];
        });

        var tot = ['JUMLAH', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null];
        baris.forEach(function (r) { for (var i = 1; i <= 14; i++) tot[i] += r[i]; });
        tot[15] = pct(tot[3], tot[2]);

        var harian = [];
        dataTerkini.forEach(function (e) {
            (e.attendance || []).forEach(function (a) {
                if (HB.masaDepan(a)) return;
                var s = HB.statusAbsensi(a);
                harian.push([
                    a.tanggal, e.nik, e.nama, e._div, a.jam_masuk ?? '-', a.status_masuk ?? '-',
                    a.jam_keluar ?? '-', a.status_keluar ?? '-', s ? s.teks : '-', a.keterangan ?? '-',
                ]);
            });
        });
        harian.sort(function (a, b) {
            return String(a[0]).localeCompare(String(b[0])) || String(a[2]).localeCompare(String(b[2]));
        });

        var lbl = labelPeriode();
        var mBln = /^(\d{4})-(\d{2})$/.exec(lbl);
        var judul = mBln
            ? 'Rekap Absensi Bulanan - ' + BULAN_PANJANG[+mBln[2] - 1] + ' ' + mBln[1]
            : 'Rekap Absensi - ' + lbl;
        var sub = 'Departemen: ' + (dv || 'Semua departemen') +
            (q ? ' · Pencarian: "' + q + '"' : '') + ' · ' + rinci.length + ' karyawan';
        var libur = liburPeriode();
        var catatan = '% Berangkat = hari berangkat ÷ hari non-libur & non-cuti yang sudah lewat ' +
            '(Cuti/Sakit/Izin/Dinas dihitung tersendiri). Termasuk hari ini; absensi berjalan (<24 jam) dihitung berangkat. ' +
            'Terlambat = masuk setelah 08:00; Pulang Awal = keluar sebelum 17:00 (tap ganda pagi & shift malam tidak dihitung). ' +
            'Akumulasi Waktu = total menit terlambat + menit pulang lebih awal selama periode. ' +
            'Perjalanan Dinas = Dinas dalam/luar kota/negeri; Cuti Tahunan = Cuti Tahunan + Cuti Setengah Hari; ' +
            'Kegiatan Eksternal = Izin Keluar Kantor; kolom Lembur masih placeholder (0) — sumber data sedang dikembangkan. ' +
            'Hari libur nasional mengikuti master Payroll (m_harilibur) dan tidak dihitung sebagai hari kerja.';
        if (libur.length) catatan += ' Hari libur periode ini: ' + liburTeks(libur) + '.';

        return {
            mode: 'bulanan',
            catatan,
            libur,
            indikator: ind,
            indikatorTeks: teksIndikator(ind),
            judul,
            sub,
            ringkasan: {
                nama: 'Ringkasan Departemen', judul: 'Ringkasan per departemen', baris, total: tot,
                kolom: kol(['Departemen', 'text'], ['Karyawan', 'int'], ['Hari Kerja', 'int'], ['Berangkat', 'int'],
                    ['Tidak Absen', 'int'], ['Terlambat', 'kali'], ['Pulang Awal', 'kali'],
                    ['Akumulasi Waktu', 'dur'], ['Hari Libur', 'int'],
                    ['Perjalanan Dinas', 'int'], ['Sakit', 'int'], ['Cuti Tahunan', 'int'], ['Cuti Haid', 'int'],
                    ['Kegiatan Eksternal', 'int'], ['Lembur', 'int'], ['% Berangkat', 'pct']),
            },
            rinci: {
                nama: 'Rekap Karyawan', judul: 'Rekap per karyawan', baris: rinci, total: null,
                kolom: kol(['NIK', 'text'], ['Nama', 'text'], ['Departemen', 'text'], ['Hari Kerja', 'int'],
                    ['Berangkat', 'int'], ['Tidak Absen', 'int'], ['Terlambat', 'kali'], ['Pulang Awal', 'kali'],
                    ['Akumulasi Waktu', 'dur'], ['Hari Libur', 'int'],
                    ['Perjalanan Dinas', 'int'], ['Sakit', 'int'], ['Cuti Tahunan', 'int'], ['Cuti Haid', 'int'],
                    ['Kegiatan Eksternal', 'int'], ['Lembur', 'int'], ['% Berangkat', 'pct']),
            },
            harian: {
                nama: 'Detail Harian', judul: 'Detail harian', baris: harian, total: null,
                kolom: kol(['Tanggal', 'text'], ['NIK', 'text'], ['Nama', 'text'], ['Departemen', 'text'],
                    ['Jam Masuk', 'text'], ['Status Masuk', 'text'], ['Jam Keluar', 'text'],
                    ['Status Keluar', 'text'], ['Status Absensi', 'text'], ['Keterangan', 'text']),
            },
        };
    }

    function modelTahunan() {
        var $ = HB.$;
        var tahun = tahunSekarang();
        var dataTahun = HB.tahun(tahun);
        var divEl = $('departemen');
        var cariEl = $('cari');
        var dv = divEl ? divEl.value : '';
        var q = ((cariEl && cariEl.value) || '').trim().toLowerCase();
        var kar = dataTahun.karyawan || {};
        var dvm = {};

        dataTahun.bulan.forEach(function (m, i) {
            Object.keys(m || {}).forEach(function (d) {
                if (dv && d !== dv) return;
                var c = m[d];
                var x = dvm[d] || (dvm[d] = {
                    m: Array(12).fill(null), b: 0, h: 0, r: 0,
                    dinas: 0, sakit: 0, cutiTahunan: 0, cutiHaid: 0, eksternal: 0, lembur: 0,
                });
                x.m[i] = { b: +c.berangkat || 0, h: +c.hari || 0 };
                x.b += +c.berangkat || 0;
                x.h += +c.hari || 0;
                x.r += +c.terlambat || 0;
                x.dinas += +c.dinas || 0;
                x.sakit += +c.sakit || 0;
                x.cutiTahunan += +c.cuti_tahunan || 0;
                x.cutiHaid += +c.cuti_haid || 0;
                x.eksternal += +c.eksternal || 0;
                x.lembur += +c.lembur || 0;
            });
        });

        var katKeys = ['dinas', 'sakit', 'cutiTahunan', 'cutiHaid', 'eksternal', 'lembur'];

        var baris = Object.keys(dvm).sort().map(function (d) {
            var v = dvm[d];
            return [d, kar[d] || 0]
                .concat(v.m.map(function (c) { return c ? pct(c.b, c.h) : null; }))
                .concat([pct(v.b, v.h), v.r])
                .concat(katKeys.map(function (k) { return v[k]; }));
        });

        var tm = Array(12).fill(null), K = 0, B = 0, H = 0, R = 0;
        var katTot = { dinas: 0, sakit: 0, cutiTahunan: 0, cutiHaid: 0, eksternal: 0, lembur: 0 };

        Object.keys(dvm).forEach(function (d) {
            var v = dvm[d];
            K += kar[d] || 0;
            B += v.b;
            H += v.h;
            R += v.r;
            katKeys.forEach(function (k) { katTot[k] += v[k]; });
            v.m.forEach(function (c, i) {
                if (c) {
                    var z = tm[i] || (tm[i] = { b: 0, h: 0 });
                    z.b += c.b;
                    z.h += c.h;
                }
            });
        });

        var tot = ['JUMLAH', K]
            .concat(tm.map(function (c) { return c ? pct(c.b, c.h) : null; }))
            .concat([pct(B, H), R])
            .concat(katKeys.map(function (k) { return katTot[k]; }));

        var libur = dataTahun.libur || [];
        var catatan = '% Berangkat = hari berangkat ÷ hari non-libur & non-cuti yang sudah lewat; hari ini belum dihitung.';
        if (q) catatan += ' Pencarian nama/NIK tidak berlaku (rekap tahunan hanya agregat per departemen).';
        catatan += ' Rincian per karyawan tersedia pada mode bulanan.' +
            ' Perjalanan Dinas = Dinas dalam/luar kota/negeri; Cuti Tahunan = Cuti Tahunan + Cuti Setengah Hari;' +
            ' Kegiatan Eksternal = Izin Keluar Kantor; kolom Lembur masih placeholder (0) — sumber data sedang dikembangkan.' +
            ' Indikator pulang lebih awal & akumulasi waktu dihitung pada mode Bulanan.' +
            ' Hari libur nasional mengikuti master Payroll (m_harilibur) dan tidak dihitung sebagai hari kerja.';
        if (libur.length) catatan += ' Hari libur tahun ini: ' + liburTeks(libur) + '.';

        var ind = { hari: H, terlambat: R, pulangAwal: 0, frekuensi: R, menitTerlambat: 0, menitPulangAwal: 0, menit: 0, lengkap: false };

        return {
            mode: 'tahunan',
            catatan,
            libur,
            indikator: ind,
            indikatorTeks: teksIndikator(ind),
            judul: 'Rekap Absensi Tahunan - ' + tahun,
            sub: 'Departemen: ' + (dv || 'Semua departemen') + ' · ' + baris.length + ' departemen',
            ringkasan: {
                nama: 'Ringkasan Departemen', judul: 'Persentase berangkat per departemen (per bulan)',
                baris, total: tot,
                kolom: kol(['Departemen', 'text'], ['Karyawan', 'int'])
                    .concat(NAMA_BULAN.map(function (n) { return { t: n, k: 'pct' }; }))
                    .concat([{ t: '% Tahun', k: 'pct' }, { t: 'Terlambat', k: 'int' },
                        { t: 'Perjalanan Dinas', k: 'int' }, { t: 'Sakit', k: 'int' },
                        { t: 'Cuti Tahunan', k: 'int' }, { t: 'Cuti Haid', k: 'int' },
                        { t: 'Kegiatan Eksternal', k: 'int' }, { t: 'Lembur', k: 'int' }]),
            },
            rinci: null,
            harian: null,
        };
    }

    function modelSekarang() {
        return modeRekap() === 'tahunan' ? modelTahunan() : modelBulanan();
    }

    /* ---------- render ---------- */
    function tabelHtml(t) {
        var pilih = bolehPilih(t);
        var num = function (i) { return t.kolom[i].k === 'text' ? '' : 'num'; };
        var th = (pilih ? '<th class="pilih"><input type="checkbox" id="pilih-semua" title="Pilih semua karyawan"></th>' : '') +
            t.kolom.map(function (c, i) { return '<th class="' + num(i) + '">' + HB.esc(c.t) + '</th>'; }).join('');

        var tr = function (r, cls, kunci) {
            var sel = pilih
                ? '<td class="pilih"><input type="checkbox" class="pilih-baris" value="' + HB.esc(kunci) + '"' +
                  (PILIH[kunci] ? ' checked' : '') + ' aria-label="' + HB.esc(r[1]) + '"></td>'
                : '';
            return '<tr' + (cls ? ' class="' + cls + '"' : '') +
                (kunci ? ' data-kunci="' + HB.esc(kunci) + '" title="Klik dua kali untuk melihat laporan absensi"' : '') +
                '>' + sel +
                r.map(function (v, i) { return '<td class="' + num(i) + '">' + HB.esc(fm(v, t.kolom[i].k)) + '</td>'; }).join('') +
                '</tr>';
        };

        var isi = t.baris.map(function (r) {
            return tr(r, '', pilih ? kunciKaryawan(r[0], r[1]) : null);
        }).join('') || '<tr><td colspan="99" class="b-none">Tidak ada data.</td></tr>';

        return '<div class="table-wrap"><table class="rekap"><thead><tr>' + th + '</tr></thead><tbody>' +
            isi + (t.total ? tr(t.total, 'total') : '') + '</tbody></table></div>';
    }

    function renderIsi(m) {
        if (!m) return;
        var host = HB.$('rekap-isi');
        if (!host) return;

        host.innerHTML =
            '<h2>' + HB.esc(m.judul) + '</h2><p class="sub">' + HB.esc(m.sub) + '</p>' +
            '<h3>' + HB.esc(m.ringkasan.judul) + '</h3>' + tabelHtml(m.ringkasan) +
            (m.rinci ? '<h3>' + HB.esc(m.rinci.judul) + '</h3>' + tabelHtml(m.rinci) : '') +
            (m.harian ? '<h3>' + HB.esc(m.harian.judul) + '</h3>' + tabelHtml(m.harian) : '') +
            (m.libur ? liburHtml(m.libur) : '') +
            '<p class="note">' + HB.esc(m.catatan) + '</p>';

        var semua = HB.$('pilih-semua');
        if (semua) {
            var baris = host.querySelectorAll('input.pilih-baris');
            var nyala = 0;
            baris.forEach(function (b) { if (b.checked) nyala++; });
            semua.checked = baris.length > 0 && nyala === baris.length;
        }
        perbaruiTombolLaporan();
    }

    HB.render.rekap = function (data) {
        dataTerkini = data || [];
        renderIsi(modelSekarang());
    };

    /* ---------- interaksi ---------- */
    var rootTerikat = new WeakSet();

    function pasangEvent() {
        var root = document.getElementById('hitung-berangkat');
        if (!root || rootTerikat.has(root)) return;
        rootTerikat.add(root);

        var mode = HB.$('mode-rekap');
        if (mode) {
            mode.addEventListener('change', function () {
                pesanRekap('', '');
                renderIsi(modelSekarang());
            });
        }

        HB.$('unduh-xlsx')?.addEventListener('click', function () {
            pesanRekap('Fitur unduh Excel belum tersedia pada tahap UI ini.', 'info');
            HB.toast?.('Unduh Excel belum tersedia.');
        });

        HB.$('unduh-pdf')?.addEventListener('click', function () {
            pesanRekap('Fitur unduh PDF belum tersedia pada tahap UI ini.', 'info');
            HB.toast?.('Unduh PDF belum tersedia.');
        });

        var isiRekapEl = HB.$('rekap-isi');
        if (!isiRekapEl) return;

        isiRekapEl.addEventListener('change', function (ev) {
            var el = ev.target;
            if (!el || el.tagName !== 'INPUT') return;

            if (el.id === 'pilih-semua') {
                isiRekapEl.querySelectorAll('input.pilih-baris').forEach(function (b) {
                    b.checked = el.checked;
                    if (el.checked) PILIH[b.value] = true;
                    else delete PILIH[b.value];
                });
            } else if (el.classList.contains('pilih-baris')) {
                if (el.checked) PILIH[el.value] = true;
                else delete PILIH[el.value];
            } else {
                return;
            }

            var semua = HB.$('pilih-semua');
            if (semua && el.id !== 'pilih-semua') {
                var baris = isiRekapEl.querySelectorAll('input.pilih-baris');
                var nyala = 0;
                baris.forEach(function (b) { if (b.checked) nyala++; });
                semua.checked = baris.length > 0 && nyala === baris.length;
            }

            perbaruiTombolLaporan();
        });

        isiRekapEl.addEventListener('dblclick', function (ev) {
            if (ev.target.closest('td.pilih')) return;
            var tr = ev.target.closest('tr[data-kunci]');
            if (!tr || !HB.laporan || !HB.laporan.buka) return;

            var kunci = tr.dataset.kunci;
            var semua = (HB.dataSemua && HB.dataSemua()) || dataTerkini;
            var karyawan = semua.filter(function (e) {
                return kunciKaryawan(e.nik, e.nama) === kunci;
            });

            if (karyawan.length) HB.laporan.buka(karyawan, 0);
        });

        HB.$('laporan-terpilih')?.addEventListener('click', function () {
            if (!HB.laporan || !HB.laporan.buka) {
                pesanRekap('Modul laporan belum termuat. Muat ulang halaman lalu coba lagi.', 'error');
                return;
            }

            var daftar = karyawanTerpilih();
            if (daftar.length) HB.laporan.buka(daftar, 0);
        });
    }

    function siapkan() {
        pasangEvent();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', siapkan);
    } else {
        siapkan();
    }

    document.addEventListener('livewire:navigated', siapkan);
})(window.HB || (window.HB = {}));


/* Laporan absensi per karyawan — pratinjau "DAILY ATTENDANCE REPORT".
   Dipanggil dari tab Rekap (double-klik baris atau tombol Laporan karyawan).
   Unduhan PDF/Excel belum aktif pada tahap UI ini. */

(function (HB) {
    var BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var LEBAR = [26, 22, 44, 30, 44, 30, 42, 40, 42, 42, 17, 17, 17, 17, 17, 26,
        26, 28, 38, 28, 46, 122];

    var KEPALA_HTML = [
        '<th rowspan="2">Shif</th>', '<th rowspan="2">Hari</th>',
        '<th rowspan="2">Date In</th>', '<th rowspan="2">In</th>',
        '<th rowspan="2">Date Out</th>', '<th rowspan="2">Out</th>',
        '<th rowspan="2">Working</th>', '<th rowspan="2">Normal</th>',
        '<th rowspan="2">Late</th>', '<th rowspan="2">Go Early</th>',
        '<th colspan="6">Overtime</th>',
        '<th rowspan="2">sakit</th>', '<th rowspan="2">cuti Haid</th>',
        '<th rowspan="2">Cuti Tahuna</th>', '<th rowspan="2">Dinas</th>',
        '<th rowspan="2">Kegiatan external</th>', '<th rowspan="2">Keterangan</th>',
    ].join('') + '</tr><tr>' + [1, 2, 3, 4, 5, 'Total']
        .map(function (n) { return '<th>' + n + '</th>'; }).join('');

    var BATAS_MASUK = 8 * 60;
    var BATAS_KELUAR = 17 * 60;
    var TAP_MINIMAL = 30;

    var daftar = [];
    var aktif = 0;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function jam(v) {
        var m = /^(\d{1,2}):(\d{2})/.exec(String(v || ''));
        return m ? pad(+m[1]) + ':' + m[2] : null;
    }

    function menit(hhmm) {
        var m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || ''));
        return m ? +m[1] * 60 + +m[2] : null;
    }

    function durasi(masuk, keluar) {
        var a = menit(masuk);
        var b = menit(keluar);
        if (a === null || b === null) return '00:00';
        if (b < a) b += 24 * 60;
        var d = b - a;
        return pad(Math.floor(d / 60)) + ':' + pad(d % 60);
    }

    function terlambat(masuk) {
        var a = menit(masuk);
        if (a === null || a <= 8 * 60 || a >= 12 * 60) return '00:00';
        var d = a - 8 * 60;
        return pad(Math.floor(d / 60)) + ':' + pad(d % 60);
    }

    function teksDurasi(total) {
        total = Math.max(0, Math.round(total || 0));
        return pad(Math.floor(total / 60)) + ':' + pad(total % 60);
    }

    function indikatorHarian(a) {
        var masuk = menit(jam(a.jam_masuk));
        var keluar = menit(jam(a.jam_keluar));
        var telat = 0, awal = 0;

        if (String(a.status_masuk || '') === 'Terlambat' && masuk !== null && masuk > BATAS_MASUK && masuk < 12 * 60) {
            telat = masuk - BATAS_MASUK;
        }

        if (String(a.status_keluar || '') === 'Pulang Lebih Awal' && keluar !== null && keluar < BATAS_KELUAR) {
            var sah = masuk === null || (masuk >= 4 * 60 && keluar - masuk >= TAP_MINIMAL);
            if (sah) awal = BATAS_KELUAR - keluar;
        }

        return { telat: telat, awal: awal };
    }

    function tglID(iso) {
        var p = String(iso || '').slice(0, 10).split('-');
        return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : '';
    }

    function tglEn(iso) {
        var p = String(iso || '').slice(0, 10).split('-');
        if (p.length !== 3) return '';
        return p[2] + '-' + (BULAN[+p[1] - 1] || p[1]) + '-' + p[0].slice(2);
    }

    function akhirBulan(bulan) {
        var p = String(bulan || '').split('-');
        if (p.length !== 2) return '';
        var d = new Date(+p[0], +p[1], 0);
        return p[0] + '-' + p[1] + '-' + pad(d.getDate());
    }

    function periode() {
        var p = HB.periodeData || {};

        if (p.dari && p.sampai) return { dari: p.dari, sampai: p.sampai };

        if (p.month) {
            var akhir = akhirBulan(p.month);
            var hariIni = HB.hariIniWIB();
            return { dari: p.month + '-01', sampai: akhir < hariIni ? akhir : hariIni };
        }

        return { dari: '', sampai: '' };
    }

    function model(emp) {
        var p = periode();
        var baris = [];
        var h0 = 0, wIn = 0;
        var nTelat = 0, nAwal = 0, menitTelat = 0, menitAwal = 0;

        (emp.attendance || []).slice()
            .sort(function (a, b) { return String(a.tanggal).localeCompare(String(b.tanggal)); })
            .forEach(function (a) {
                if (HB.masaDepan(a)) return;

                var masuk = jam(a.jam_masuk);
                var keluar = jam(a.jam_keluar);
                var tap = !!(masuk || keluar);
                var s = String(a.status_absensi || '');
                var libur = !!a.libur_nama || s === 'Hari Libur';
                var kategori = /^(Cuti|Sakit|Izin|Dinas)\b/.test(s);
                var ho = !libur && !kategori;

                var late = terlambat(masuk);
                var lateMenit = menit(late) || 0;
                var ind = indikatorHarian(a);
                var goEarly = ho ? teksDurasi(ind.awal) : '00:00';

                if (ho) {
                    h0++;
                    if (String(a.status_masuk || '') === 'Terlambat') nTelat++;
                    menitTelat += lateMenit;
                    if (ind.awal > 0) { nAwal++; menitAwal += ind.awal; }
                }

                if (masuk || (keluar && !kategori)) wIn++;

                baris.push([
                    tap ? 'HO' : 'HW',
                    tap ? 0 : 1,
                    tglID(a.tanggal),
                    masuk || '------',
                    tglID(a.tanggal),
                    keluar || '------',
                    durasi(masuk, keluar),
                    tap ? '08:00' : '00:00',
                    late,
                    goEarly,
                    '', '', '', '', '', '',
                    /^Sakit\b/.test(s) ? 1 : '',
                    /^Cuti Haid\b/.test(s) ? 1 : '',
                    /^Cuti (Biasa|Setengah Hari)\b/.test(s) ? 1 : '',
                    /^Dinas\b/.test(s) ? 1 : '',
                    /^Izin Keluar Kantor\b/.test(s) ? 1 : '',
                    libur ? (a.libur_nama || a.keterangan || 'Hari Libur') : (a.keterangan || ''),
                ]);
            });

        return {
            nik: String(emp.nik || ''),
            nama: String(emp.nama || ''),
            jabatan: String(emp.jabatan || '-'),
            departemen: String(emp.departemen || emp._div || '-'),
            periodeEn: p.dari && p.sampai ? tglEn(p.dari) + ' to ' + tglEn(p.sampai) : '',
            periodeIso: p.dari && p.sampai ? p.dari + ' - ' + p.sampai : '',
            baris, h0, wIn, nTelat, nAwal, menitTelat, menitAwal,
        };
    }

    function sel(v) {
        return v === '' || v === null || v === undefined ? '&nbsp;' : HB.esc(v);
    }

    function htmlLaporan(m) {
        var isi = m.baris.map(function (r) {
            return '<tr>' + r.map(function (v) { return '<td>' + sel(v) + '</td>'; }).join('') + '</tr>';
        }).join('');

        if (!isi) {
            isi = '<tr><td colspan="22" class="lap-kosong">Tidak ada data absensi pada periode ini.</td></tr>';
        }

        return '<div class="lap-doc">' +
            '<div class="lap-kop">' +
                '<div class="lap-pt">PT.Hamana Works Tira Indonesia</div>' +
                '<div class="lap-alamat">Jl. Garuda No. 44 Ds.Munjungagung, Kec. Kramat</div>' +
                '<div class="lap-alamat">Tegal</div>' +
            '</div>' +
            '<div class="lap-head"><b>DAILY ATTENDANCE REPORT</b>' +
                '<span>Period: <b>' + HB.esc(m.periodeEn || '-') + '</b></span></div>' +
            '<table class="lap-id"><tbody>' +
                '<tr>' +
                    '<td><span>Employee ID:</span> <b>' + HB.esc(m.nik) + '</b></td>' +
                    '<td><span>Departement:</span> <b>' + HB.esc(m.departemen) + '</b></td>' +
                '</tr><tr>' +
                    '<td><span>Name:</span> <b>' + HB.esc(m.nama) + '</b></td>' +
                    '<td><span>Title:</span> <b>' + HB.esc(m.jabatan) + '</b></td>' +
                '</tr>' +
            '</tbody></table>' +
            '<table class="lap-tabel">' +
                '<colgroup>' + LEBAR.map(function (n) { return '<col style="width:' + n + 'pt">'; }).join('') + '</colgroup>' +
                '<thead><tr>' + KEPALA_HTML + '</tr></thead>' +
                '<tbody>' + isi + '</tbody>' +
                '<tfoot>' +
                    '<tr class="lap-total">' +
                        '<td colspan="3" rowspan="2">Total</td>' +
                        '<td colspan="2" rowspan="2">H0 = ' + m.h0 + '</td>' +
                        '<td colspan="3" rowspan="2">W In = ' + m.wIn + '</td>' +
                        '<td>L = ' + m.nTelat + '</td>' +
                        '<td>GE = ' + m.nAwal + '</td>' +
                        '<td colspan="6" rowspan="2"></td>' +
                        '<td colspan="6" rowspan="2"></td>' +
                    '</tr>' +
                    '<tr class="lap-total">' +
                        '<td>LA = ' + teksDurasi(m.menitTelat) + '</td>' +
                        '<td>GEA = ' + teksDurasi(m.menitAwal) + '</td>' +
                    '</tr>' +
                '</tfoot>' +
            '</table>' +
        '</div>';
    }

    function setStatus(teks) {
        var el = HB.$('hbLapStatus');
        if (el) el.textContent = teks || '';
    }

    function isiPilihan() {
        var selEl = HB.$('hbLapPilih');
        if (!selEl) return;
        selEl.innerHTML = daftar.map(function (e, i) {
            return '<option value="' + i + '">' + HB.esc(e.nama) + ' — ' + HB.esc(e.nik) + '</option>';
        }).join('');
        selEl.value = String(aktif);

        var banyak = daftar.length > 1;
        if (HB.$('hbLapPdfAll')) HB.$('hbLapPdfAll').hidden = !banyak;
        if (HB.$('hbLapXlsxAll')) HB.$('hbLapXlsxAll').hidden = !banyak;
        if (HB.$('hbLapBar')) HB.$('hbLapBar').hidden = false;
    }

    function tampil() {
        var m = model(daftar[aktif]);
        if (HB.$('hbLapT')) HB.$('hbLapT').textContent = 'Laporan Absensi — ' + m.nama;
        if (HB.$('hbLapIsi')) HB.$('hbLapIsi').innerHTML = htmlLaporan(m);
        setStatus('');
    }

    function buka(list, idx) {
        daftar = (list || []).filter(Boolean);
        if (!daftar.length) return;

        aktif = Math.min(Math.max(idx || 0, 0), daftar.length - 1);
        isiPilihan();
        tampil();
        HB.$('hbLaporan')?.classList.add('on');
    }

    function tutup() {
        HB.$('hbLaporan')?.classList.remove('on');
        setStatus('');
    }

    HB.laporan = { buka: buka };

    // Penutup modal laporan dipasang sekali di tingkat dokumen agar tetap
    // bekerja setelah Livewire mengganti isi halaman (navigasi SPA).
    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') document.getElementById('hbLaporan')?.classList.remove('on');
    });

    var rootTerikat = new WeakSet();

    function pasangEvent() {
        var root = document.getElementById('hitung-berangkat');
        if (!root || rootTerikat.has(root)) return;
        rootTerikat.add(root);

        document.querySelectorAll('#hbLaporan [data-x]').forEach(function (b) {
            b.addEventListener('click', tutup);
        });

        HB.$('hbLaporan')?.addEventListener('click', function (ev) {
            if (ev.target === this) tutup();
        });

        HB.$('hbLapPilih')?.addEventListener('change', function () {
            aktif = +this.value || 0;
            tampil();
        });

        ['hbLapPdf', 'hbLapXlsx', 'hbLapPdfAll', 'hbLapXlsxAll'].forEach(function (id) {
            HB.$(id)?.addEventListener('click', function () {
                setStatus('Fitur unduh belum tersedia pada tahap UI ini.');
                HB.toast?.('Unduh laporan belum tersedia.');
            });
        });
    }

    function siapkan() {
        pasangEvent();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', siapkan);
    } else {
        siapkan();
    }

    document.addEventListener('livewire:navigated', siapkan);
})(window.HB || (window.HB = {}));
