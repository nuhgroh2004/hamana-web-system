const initializedRoots = new WeakSet();

function initPageSatpam() {
    const root = document.getElementById('page-satpam');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    (function () {
        var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        var MONF = [
            'Januari',
            'Februari',
            'Maret',
            'April',
            'Mei',
            'Juni',
            'Juli',
            'Agustus',
            'September',
            'Oktober',
            'November',
            'Desember',
        ];

        function D(off) {
            var d = new Date();
            d.setDate(d.getDate() - off);
            return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
        }

        // Data contoh (ganti dengan data dari server). st: disetujui | menunggu | ditolak
        var OFF = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 400];
        var AP1 = { n: 'DODDY AL FIQRI', r: 'Kepala Bagian' },
            AP2 = { n: 'Fadhilah Fathul Janah', r: 'Atasan Langsung (Pemberi Izin)' };
        var all = [
            ['Budi Santoso', 'Produksi', 'Operator', 'Mengurus dokumen kendaraan di Samsat', 'disetujui', '09:30 – 11:30', AP1],
            ['Siti Rahmawati', 'HRD', 'Officer', 'Mengantar anak ke dokter', 'disetujui', '10:00 – 12:00', AP2],
            ['Andi Pratama', 'Logistik', 'Driver', 'Mengambil barang ke vendor', 'disetujui', '08:30 – 10:30', AP1],
            ['Dewi Lestari', 'Finance', 'Supervisor', 'Keperluan keluarga', 'menunggu', '13:00 – 15:00', null],
            ['Rudi Hartono', 'Maintenance', 'Foreman', 'Membeli suku cadang mesin', 'menunggu', '11:00 – 13:00', null],
            ['Maya Anggraini', 'IT', 'Leader', 'Mengurus perpanjangan KTP', 'ditolak', '14:00 – 16:00', null],
            ['Fajar Nugroho', 'Produksi', 'Operator', 'Pemeriksaan kesehatan di klinik', 'disetujui', '09:00 – 11:00', AP2],
            ['Lina Marlina', 'Quality Control', 'Officer', 'Mengambil dokumen di kantor pusat', 'disetujui', '10:30 – 12:30', AP1],
            ['Hendra Wijaya', 'Logistik', 'Head', 'Rapat dengan klien di luar kantor', 'disetujui', '13:30 – 16:00', AP1],
            ['Rina Puspita', 'HRD', 'Intern', 'Keperluan kampus', 'menunggu', '15:00 – 17:00', null],
            ['Agus Setiawan', 'Maintenance', 'Operator', 'Mengantar istri ke rumah sakit', 'disetujui', '08:00 – 10:00', AP2],
            ['Yuni Kartika', 'Finance', 'Officer', 'Mengurus transaksi di bank', 'ditolak', '11:30 – 13:30', null],
        ].map(function (r, i) {
            return {
                id: i,
                nama: r[0],
                div: r[1],
                pos: r[2],
                kep: r[3],
                st: r[4],
                jam: r[5],
                ap: r[6],
                tgl: D(OFF[i]),
            };
        });

        var SIZE = 10,
            page = 1,
            q = '',
            now = new Date();

        function $(id) {
            return root.querySelector('#' + id);
        }

        var tb = $('tb');
        var EYE = '<svg class="i" viewBox="0 0 16 16"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>',
            X = '<svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
        var ST = { disetujui: ['ok', 'Disetujui'], menunggu: ['wr', 'Menunggu'], ditolak: ['er', 'Ditolak'] };

        function esc(v) {
            return String(v == null ? '' : v)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;');
        }

        function fmt(s) {
            var p = s.split('-');
            return +p[2] + ' ' + MON[p[1] - 1] + ' ' + p[0];
        }

        function badge(r) {
            return '<span class="bdg ' + ST[r.st][0] + '">' + ST[r.st][1] + '</span>';
        }

        function pad(n) {
            return ('0' + n).slice(-2);
        }

        var todayISO = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
        var f = { date: todayISO, m: String(now.getMonth() + 1), y: String(now.getFullYear()) };

        function list() {
            var s = q.trim().toLowerCase();

            return all.filter(function (r) {
                var p = r.tgl.split('-');
                var okd = f.date
                    ? r.tgl === f.date
                    : (f.m === 'all' || +p[1] === +f.m) && (f.y === 'all' || +p[0] === +f.y);

                return okd && (!s || r.nama.toLowerCase().indexOf(s) >= 0 || r.div.toLowerCase().indexOf(s) >= 0);
            });
        }

        function render() {
            var L = list(),
                pages = Math.max(1, Math.ceil(L.length / SIZE));

            if (page > pages) {
                page = pages;
            }

            var from = (page - 1) * SIZE,
                rows = L.slice(from, from + SIZE);

            tb.innerHTML = rows
                .map(function (r) {
                    return (
                        '<tr><td class="ak" data-l="Aksi"><button type="button" class="ib" data-v="' +
                        r.id +
                        '" title="Lihat detail" aria-label="Lihat detail ' +
                        esc(r.nama) +
                        '">' +
                        EYE +
                        '</button></td>' +
                        '<td class="nm" data-l="Nama">' +
                        esc(r.nama) +
                        '</td><td class="dv" data-l="Divisi">' +
                        esc(r.div) +
                        '</td><td class="ps" data-l="Posisi">' +
                        esc(r.pos) +
                        '</td>' +
                        '<td class="kp" data-l="Keperluan">' +
                        esc(r.kep) +
                        '</td><td class="st" data-l="Status">' +
                        badge(r) +
                        '<button type="button" class="btn lh" data-v="' +
                        r.id +
                        '">' +
                        EYE +
                        'Lihat</button></td></tr>'
                    );
                })
                .join('');

            $('empty').hidden = L.length > 0;
            $('cnt').textContent = L.length
                ? 'Menampilkan ' + (from + 1) + '–' + (from + rows.length) + ' dari ' + L.length + ' data'
                : '0 data';

            var h =
                    '<button type="button" data-p="' +
                    (page - 1) +
                    '"' +
                    (page <= 1 ? ' disabled' : '') +
                    '>Previous</button>',
                last = 0;

            for (var n = 1; n <= pages; n++) {
                if (!(n === 1 || n === pages || Math.abs(n - page) <= 1)) {
                    continue;
                }

                if (last && n - last > 1) {
                    h += '<span>…</span>';
                }

                h +=
                    '<button type="button" data-p="' +
                    n +
                    '"' +
                    (n === page ? ' class="on" aria-current="page"' : '') +
                    '>' +
                    n +
                    '</button>';
                last = n;
            }

            h +=
                '<button type="button" data-p="' +
                (page + 1) +
                '"' +
                (page >= pages ? ' disabled' : '') +
                '>Next</button>';

            $('pn').innerHTML = h;
        }

        $('q').addEventListener('input', function () {
            q = this.value;
            page = 1;
            render();
        });

        $('pn').addEventListener('click', function (e) {
            var b = e.target.closest('[data-p]');

            if (b && !b.disabled) {
                page = +b.dataset.p;
                render();
            }
        });

        // ---- filter hari / bulan / tahun ----
        var CK = '<svg class="i ck" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>',
            mn = $('mn'),
            cal = $('cal'),
            cv = { y: 0, m: 0 },
            curBtn = null,
            curDD = null;

        function opts(id) {
            var o = [['all', 'Semua']],
                i;

            if (id === 'm') {
                MONF.forEach(function (n, k) {
                    o.push([String(k + 1), n]);
                });
            } else {
                var y = {};
                y[now.getFullYear()] = 1;
                all.forEach(function (r) {
                    y[+r.tgl.slice(0, 4)] = 1;
                });
                Object.keys(y)
                    .sort(function (a, b) {
                        return b - a;
                    })
                    .forEach(function (v) {
                        o.push([v, v]);
                    });
            }

            return o;
        }

        function paint(id) {
            var el = root.querySelector(id === 'd' ? '[data-cal] .l' : '[data-dd="' + id + '"] .l');
            el.textContent =
                id === 'd'
                    ? f.date
                        ? String(+f.date.slice(8))
                        : 'Semua'
                    : f[id] === 'all'
                      ? 'Semua'
                      : id === 'm'
                        ? MON[f[id] - 1]
                        : f[id];
        }

        function closeMenu() {
            mn.hidden = true;
            cal.hidden = true;
            curBtn = null;
            curDD = null;
        }

        function openDD(btn) {
            var id = btn.dataset.dd;
            mn.innerHTML = opts(id)
                .map(function (o) {
                    return (
                        '<button type="button" role="option" data-opt="' +
                        o[0] +
                        '" class="' +
                        (o[0] === f[id] ? 'on' : '') +
                        '">' +
                        o[1] +
                        CK +
                        '</button>'
                    );
                })
                .join('');
            var w = Math.max(btn.offsetWidth, id === 'm' ? 170 : 130);
            mn.style.width = w + 'px';
            mn.hidden = false;
            var r = btn.getBoundingClientRect(),
                h = mn.offsetHeight,
                top = r.bottom + 4;

            if (top + h > innerHeight - 8) {
                top = Math.max(8, r.top - h - 4);
            }

            mn.style.top = top + 'px';
            mn.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + 'px';
            curBtn = btn;
            curDD = id;
            var on = mn.querySelector('.on');

            if (on && on.scrollIntoView) {
                mn.scrollTop = on.offsetTop - mn.offsetHeight / 2 + on.offsetHeight / 2;
            }
        }

        document.addEventListener('click', function (e) {
            if (!root.isConnected) {
                return;
            }

            var b = e.target.closest('[data-dd]');

            if (b) {
                if (curBtn === b) {
                    closeMenu();
                    return;
                }

                closeMenu();
                openDD(b);
                return;
            }

            var c = e.target.closest('[data-cal]');

            if (c) {
                if (curBtn === c) {
                    closeMenu();
                    return;
                }

                closeMenu();
                openCal(c);
                return;
            }

            if ((!mn.hidden || !cal.hidden) && !mn.contains(e.target) && !cal.contains(e.target)) {
                closeMenu();
            }
        });

        mn.addEventListener('click', function (e) {
            var o = e.target.closest('[data-opt]');

            if (o && curDD) {
                var id = curDD;
                f[id] = o.dataset.opt;

                if (f.date && (f.m === 'all' || f.y === 'all' || +f.date.slice(5, 7) !== +f.m || f.date.slice(0, 4) !== f.y)) {
                    f.date = '';
                }

                closeMenu();
                ['d', 'm', 'y'].forEach(paint);
                page = 1;
                render();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (!root.isConnected || e.key !== 'Escape') {
                return;
            }

            if (!mn.hidden || !cal.hidden) {
                closeMenu();
            }
        });

        window.addEventListener(
            'scroll',
            function (e) {
                if (root.isConnected && (!mn.hidden || !cal.hidden) && !mn.contains(e.target) && !cal.contains(e.target)) {
                    closeMenu();
                }
            },
            true,
        );

        window.addEventListener('resize', function () {
            if (root.isConnected) {
                closeMenu();
            }
        });

        document.addEventListener('livewire:navigating', function () {
            if (root.isConnected) {
                closeMenu();
            }
        });

        // ---- kalender ----
        var DOW = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

        function iso(d) {
            return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
        }

        function drawCal() {
            var y = cv.y,
                m = cv.m,
                start = (new Date(y, m - 1, 1).getDay() + 6) % 7,
                has = {},
                h,
                i;

            all.forEach(function (r) {
                has[r.tgl] = 1;
            });

            h =
                '<div class="ch2"><button type="button" class="cn" data-nav="-1" aria-label="Bulan sebelumnya"><svg class="i" viewBox="0 0 16 16"><path d="M10 3.5L5.5 8l4.5 4.5"/></svg></button><span class="ct2">' +
                MONF[m - 1] +
                ' ' +
                y +
                '</span><button type="button" class="cn" data-nav="1" aria-label="Bulan berikutnya"><svg class="i" viewBox="0 0 16 16"><path d="M6 3.5L10.5 8 6 12.5"/></svg></button></div>' +
                '<div class="dw">' +
                DOW.map(function (d) {
                    return '<span>' + d + '</span>';
                }).join('') +
                '</div><div class="dg">';

            for (i = 0; i < 42; i++) {
                var dt = new Date(y, m - 1, 1 - start + i),
                    s = iso(dt);

                h +=
                    '<button type="button" class="dy' +
                    (dt.getMonth() !== m - 1 ? ' out' : '') +
                    (s === todayISO ? ' td' : '') +
                    (s === f.date ? ' on' : '') +
                    (has[s] ? ' has' : '') +
                    '" data-day="' +
                    s +
                    '" aria-label="' +
                    dt.getDate() +
                    ' ' +
                    MONF[dt.getMonth()] +
                    ' ' +
                    dt.getFullYear() +
                    '"' +
                    (s === f.date ? ' aria-pressed="true"' : '') +
                    '>' +
                    dt.getDate() +
                    '</button>';
            }

            cal.innerHTML =
                h +
                '</div><div class="cf2"><button type="button" class="btn sm" data-ctoday>Hari ini</button><button type="button" class="btn sm" data-call>Semua hari</button></div>';
        }

        function openCal(btn) {
            var b = f.date || todayISO;
            cv.y = +b.slice(0, 4);
            cv.m = +b.slice(5, 7);

            if (!f.date && f.m !== 'all' && f.y !== 'all') {
                cv.y = +f.y;
                cv.m = +f.m;
            }

            drawCal();
            cal.hidden = false;

            var r = btn.getBoundingClientRect(),
                h = cal.offsetHeight,
                w = cal.offsetWidth,
                top = r.bottom + 4;

            if (top + h > innerHeight - 8) {
                top = Math.max(8, r.top - h - 4);
            }

            cal.style.top = top + 'px';
            cal.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + 'px';
            curBtn = btn;
        }

        function pickDate(s) {
            f.date = s;
            f.m = String(+s.slice(5, 7));
            f.y = s.slice(0, 4);
            closeMenu();
            ['d', 'm', 'y'].forEach(paint);
            page = 1;
            render();
        }

        cal.addEventListener('click', function (e) {
            e.stopPropagation();

            var n = e.target.closest('[data-nav]'),
                d = e.target.closest('[data-day]');

            if (n) {
                cv.m += +n.dataset.nav;

                if (cv.m < 1) {
                    cv.m = 12;
                    cv.y--;
                }

                if (cv.m > 12) {
                    cv.m = 1;
                    cv.y++;
                }

                drawCal();
                return;
            }

            if (d) {
                pickDate(d.dataset.day);
                return;
            }

            if (e.target.closest('[data-ctoday]')) {
                pickDate(todayISO);
                return;
            }

            if (e.target.closest('[data-call]')) {
                f.date = '';
                closeMenu();
                ['d', 'm', 'y'].forEach(paint);
                page = 1;
                render();
            }
        });

        ['d', 'm', 'y'].forEach(paint);

        // ---- detail ----
        function view(r, from) {
            var ov = document.createElement('div');
            ov.className = 'md-ov';
            ov.innerHTML =
                '<div class="md" role="dialog" aria-modal="true" aria-label="Detail izin"><div class="mh"><span>Detail Izin</span><button type="button" class="mx" data-c aria-label="Tutup">' +
                X +
                '</button></div><div class="mb"><dl class="dl">' +
                '<dt>Nama</dt><dd><b>' +
                esc(r.nama) +
                '</b></dd><dt>Divisi</dt><dd>' +
                esc(r.div) +
                '</dd><dt>Posisi</dt><dd>' +
                esc(r.pos) +
                '</dd><dt>Keperluan</dt><dd>' +
                esc(r.kep) +
                '</dd>' +
                '<dt>Tanggal</dt><dd>' +
                fmt(r.tgl) +
                '</dd><dt>Jam Keluar</dt><dd>' +
                esc(r.jam) +
                '</dd><dt>Status</dt><dd>' +
                badge(r) +
                '</dd>' +
                (r.ap
                    ? '<dt>Disetujui oleh</dt><dd>' + esc(r.ap.n) + '<br><span class="mu">' + esc(r.ap.r) + '</span></dd>'
                    : '') +
                '</dl></div><div class="mf"><button type="button" class="btn go" data-c>Tutup</button></div></div>';
            root.appendChild(ov);
            document.body.style.overflow = 'hidden';
            ov.querySelector('.go').focus();

            function close() {
                ov.remove();
                document.body.style.overflow = '';
                document.removeEventListener('keydown', k);

                if (from && from.isConnected) {
                    from.focus();
                }
            }

            function k(e) {
                if (e.key === 'Escape') {
                    close();
                }
            }

            document.addEventListener('keydown', k);
            ov.addEventListener('click', function (e) {
                if (e.target === ov || e.target.closest('[data-c]')) {
                    close();
                }
            });
            document.dispatchEvent(new CustomEvent('satpam-lihat', { detail: r }));
        }

        tb.addEventListener('click', function (e) {
            var b = e.target.closest('[data-v]');

            if (!b) {
                return;
            }

            var r = all.filter(function (x) {
                return x.id === +b.dataset.v;
            })[0];

            if (r) {
                view(r, b);
            }
        });

        render();
    })();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageSatpam);
} else {
    initPageSatpam();
}

document.addEventListener('livewire:navigated', initPageSatpam);
