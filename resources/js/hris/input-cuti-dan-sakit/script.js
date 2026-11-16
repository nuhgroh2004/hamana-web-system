/*
 * Logika tampilan Input Cuti dan Sakit.
 * Data masih contoh di memori browser; belum tersambung ke server.
 */

const inputCutiRoots = new WeakSet();

function initInputCutiDanSakit() {
    const root = document.getElementById('input-cuti-dan-sakit');

    if (!root || inputCutiRoots.has(root)) {
        return;
    }

    inputCutiRoots.add(root);

    var $ = function (id) {
        return root.querySelector('#' + id);
    };

    var TODAY = new Date().toISOString().slice(0, 10);
    var YEAR = TODAY.slice(0, 4);
    var Y = +YEAR;
    var START = YEAR + '-01-01';
    var END = addM(START, 18);
    var SIZE = 10;
    var DEFAULT = { wait: 12, firstQ: 10, firstV: 18, yearQ: 8, yearV: 12, yearX: 6 };
    var HALF = ['Cuti Setengah Hari', 'Cuti Haid Setengah Hari', 'Sakit Setengah Hari', 'Sakit Setengah Hari Dokter', 'Izin Keluar Kantor'];
    var POTONG = ['Cuti Tahunan', 'Cuti Biasa', 'Cuti Setengah Hari', 'Sakit', 'Sakit Setengah Hari'];
    var HAID = ['Cuti Haid', 'Cuti Haid Setengah Hari'];

    var S = { set: Object.assign({}, DEFAULT), q: '', page: 1, last: 1, total: 0 };
    var sel = new Set();
    var selData = new Map();
    var cur = null;
    var uid = Date.now();

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function addM(s, m) {
        var d = new Date(s + 'T00:00:00Z');
        var day = d.getUTCDate();

        d.setUTCMonth(d.getUTCMonth() + m);

        if (d.getUTCDate() !== day) {
            d.setUTCDate(0);
        }

        return d.toISOString().slice(0, 10);
    }

    function fmt(s) {
        var p = String(s || '').split('-');

        return p.length < 3 ? s : p[2] + '/' + p[1] + '/' + p[0];
    }

    function num(n) {
        return Math.round(n * 10) / 10;
    }

    function weekdays(a, b) {
        var n = 0;

        for (var d = new Date(a + 'T00:00:00Z'), e = new Date(b + 'T00:00:00Z'); d <= e; d.setUTCDate(d.getUTCDate() + 1)) {
            var w = d.getUTCDay();

            if (w && w < 6) {
                n++;
            }
        }

        return n;
    }

    function belumSetahun(e) {
        return !!e.hire && addM(e.hire, 12) > TODAY;
    }

    function autoGrants(e) {
        if (!e.hire) {
            return [];
        }

        var c = S.set;
        var fd = addM(e.hire, 12);

        if (fd > TODAY) {
            return [];
        }

        var out = [
            {
                d: fd,
                amt: c.firstQ,
                exp: addM(fd, c.firstV),
                note: 'Jatah pertama (setelah 1 tahun)',
                used: 0,
                auto: true,
            },
        ];

        for (var y = +fd.slice(0, 4) + 1; y <= +TODAY.slice(0, 4); y++) {
            var d = y + '-01-01';

            out.push({
                d: d,
                amt: c.yearQ,
                exp: addM(d, c.yearV + c.yearX),
                note: 'Jatah awal tahun',
                used: 0,
                auto: true,
            });
        }

        return out;
    }

    function grants(e) {
        var g = (e.hak || []).map(function (x) {
            return {
                d: x.d,
                amt: x.hak,
                exp: x.exp,
                note: x.note || 'Hak cuti',
                used: x.terpakai || 0,
                periode: x.periode,
                id: x.id,
            };
        });
        var auto = !g.length;

        if (auto) {
            g = autoGrants(e);
        }

        var rec = (e.rec || [])
            .filter(function (r) {
                return r.potong == null ? POTONG.indexOf(r.t) !== -1 : +r.potong === 1;
            })
            .sort(function (a, b) {
                return a.d1 < b.d1 ? -1 : 1;
            });

        var over = 0;

        // Alokasi dihitung ulang dari nol, sama seperti perhitungan di server.
        var cap = g.map(function (x) {
            return x.amt;
        });

        rec.forEach(function (r) {
            var avail = 0;

            g.forEach(function (x, i) {
                if (x.d <= r.d1 && r.d1 <= x.exp) {
                    avail += cap[i];
                }
            });

            var alok = Math.min(r.days, Math.max(avail, 0));
            var dipakai = alok;

            g.forEach(function (x, i) {
                if (alok > 0 && x.d <= r.d1 && r.d1 <= x.exp && cap[i] > 0) {
                    var t = Math.min(alok, cap[i]);

                    cap[i] -= t;
                    alok -= t;
                }
            });

            over += r.days - (dipakai - alok);
        });

        g.forEach(function (x, i) {
            x.used = Math.round((x.amt - cap[i]) * 10) / 10;
        });
        g.forEach(function (x) {
            x.active = x.d <= TODAY && TODAY <= x.exp;
        });

        var act = g.filter(function (x) {
            return x.active;
        });

        return {
            g: g.sort(function (a, b) {
                return a.d < b.d ? -1 : 1;
            }),
            total: act.reduce(function (s, x) {
                return s + x.amt;
            }, 0),
            used:
                act.reduce(function (s, x) {
                    return s + x.used;
                }, 0) + over,
            over: over,
            auto: auto,
        };
    }

    function buildSeed() {
        return [
            {
                id: 'p1',
                nik: '2021.01.001',
                nama: 'Ahmad Fauzi',
                departemen: 'Produksi',
                jabatan: 'Operator',
                posisi: 'Operator Produksi',
                hire: '2021-03-01',
                hak: [{ id: 'h1', d: START, hak: 12, exp: END, note: 'Jatah awal tahun', periode: Y }],
                rec: [
                    { id: 'r1', t: 'Cuti Tahunan', d1: YEAR + '-03-09', d2: YEAR + '-03-10', days: 2, potong: 1, jam: '', tujuan: '' },
                    { id: 'r2', t: 'Sakit', d1: YEAR + '-05-04', d2: YEAR + '-05-04', days: 1, potong: 1, jam: '', tujuan: '' },
                ],
            },
            {
                id: 'p2',
                nik: '2020.02.014',
                nama: 'Siti Nurhaliza',
                departemen: 'HR & GA',
                jabatan: 'Supervisor',
                posisi: 'Supervisor Personalia',
                hire: '2020-02-10',
                hak: [{ id: 'h2', d: START, hak: 12, exp: addM(TODAY, 2), note: 'Jatah awal tahun', periode: Y }],
                rec: [
                    { id: 'r3', t: 'Cuti Tahunan', d1: YEAR + '-01-05', d2: YEAR + '-01-16', days: 10, potong: 1, jam: '', tujuan: '' },
                    { id: 'r4', t: 'Sakit', d1: YEAR + '-02-02', d2: YEAR + '-02-02', days: 1, potong: 1, jam: '', tujuan: '' },
                    { id: 'r5', t: 'Cuti Setengah Hari', d1: YEAR + '-03-02', d2: YEAR + '-03-02', days: 0.5, potong: 1, jam: '08:00–12:00', tujuan: '' },
                    { id: 'r6', t: 'Sakit Setengah Hari', d1: YEAR + '-03-03', d2: YEAR + '-03-03', days: 0.5, potong: 1, jam: '13:00–17:00', tujuan: '' },
                ],
            },
            {
                id: 'p3',
                nik: '2019.03.007',
                nama: 'Budi Santoso',
                departemen: 'Logistik',
                jabatan: 'Leader',
                posisi: 'Leader Gudang',
                hire: '2019-03-15',
                hak: [
                    { id: 'h3', d: START, hak: 6, exp: END, note: 'Jatah awal tahun', periode: Y },
                    { id: 'h4', d: YEAR + '-06-01', hak: 8, exp: addM(YEAR + '-06-01', 12), note: 'Jatah tambahan', periode: Y },
                ],
                rec: [
                    { id: 'r7', t: 'Cuti Tahunan', d1: YEAR + '-02-02', d2: YEAR + '-02-03', days: 2, potong: 1, jam: '', tujuan: '' },
                    { id: 'r8', t: 'Sakit', d1: YEAR + '-08-03', d2: YEAR + '-08-05', days: 3, potong: 1, jam: '', tujuan: '' },
                ],
            },
            {
                id: 'p4',
                nik: '2022.04.021',
                nama: 'Dewi Lestari',
                departemen: 'Keuangan',
                jabatan: 'Officer',
                posisi: 'Staff Akuntansi',
                hire: '2022-04-04',
                hak: [{ id: 'h5', d: START, hak: 5, exp: END, note: 'Jatah awal tahun', periode: Y }],
                rec: [
                    { id: 'r9', t: 'Cuti Tahunan', d1: YEAR + '-02-09', d2: YEAR + '-02-13', days: 5, potong: 1, jam: '', tujuan: '' },
                    { id: 'r10', t: 'Sakit', d1: YEAR + '-04-06', d2: YEAR + '-04-07', days: 2, potong: 1, jam: '', tujuan: '' },
                ],
            },
            {
                id: 'p5',
                nik: '2018.05.003',
                nama: 'Rizky Pratama',
                departemen: 'Maintenance',
                jabatan: 'Foreman',
                posisi: 'Foreman Maintenance',
                hire: '2018-05-02',
                hak: [
                    { id: 'h6', d: START, hak: 12, exp: END, note: 'Jatah awal tahun', periode: Y },
                    { id: 'h7', d: YEAR + '-06-01', hak: -2, exp: END, note: 'Pengurangan cuti', periode: Y },
                ],
                rec: [{ id: 'r11', t: 'Cuti Tahunan', d1: YEAR + '-02-16', d2: YEAR + '-02-19', days: 4, potong: 1, jam: '', tujuan: '' }],
            },
            {
                id: 'p6',
                nik: '2017.06.011',
                nama: 'Andi Wijaya',
                departemen: 'Quality Control',
                jabatan: 'Head',
                posisi: 'Head QC',
                hire: '2017-06-12',
                hak: [{ id: 'h8', d: '2025-01-01', hak: 12, exp: '2026-01-01', note: 'Jatah awal tahun', periode: 2025 }],
                rec: [{ id: 'r12', t: 'Cuti Tahunan', d1: '2025-03-10', d2: '2025-03-12', days: 3, potong: 1, jam: '', tujuan: '' }],
            },
            {
                id: 'p7',
                nik: '2026.07.030',
                nama: 'Muhammad Iqbal',
                departemen: 'Umum',
                jabatan: 'Driver',
                posisi: 'Driver Operasional',
                hire: '',
                hak: [],
                rec: [],
            },
            {
                id: 'p8',
                nik: '2026.08.031',
                nama: 'Putri Handayani',
                departemen: 'Marketing',
                jabatan: 'Intern',
                posisi: 'Intern Marketing',
                hire: addM(TODAY, -6),
                hak: [],
                rec: [],
            },
            {
                id: 'p9',
                nik: '2024.09.005',
                nama: 'Agus Setiawan',
                departemen: 'IT',
                jabatan: 'Officer',
                posisi: 'IT Support',
                hire: '2024-09-01',
                hak: [],
                rec: [{ id: 'r13', t: 'Cuti Tahunan', d1: YEAR + '-02-09', d2: YEAR + '-02-11', days: 3, potong: 1, jam: '', tujuan: '' }],
            },
            {
                id: 'p10',
                nik: '2023.10.019',
                nama: 'Nur Aisyah',
                departemen: 'Produksi',
                jabatan: 'Operator',
                posisi: 'Operator Packing',
                hire: '2023-10-10',
                hak: [{ id: 'h9', d: START, hak: 12, exp: END, note: 'Jatah awal tahun', periode: Y }],
                rec: [
                    { id: 'r14', t: 'Cuti Tahunan', d1: YEAR + '-03-16', d2: YEAR + '-03-16', days: 1, potong: 1, jam: '', tujuan: '' },
                    { id: 'r15', t: 'Sakit Setengah Hari', d1: YEAR + '-05-18', d2: YEAR + '-05-18', days: 0.5, potong: 1, jam: '08:00–12:00', tujuan: '' },
                ],
            },
            {
                id: 'p11',
                nik: '2020.11.002',
                nama: 'Hendra Gunawan',
                departemen: 'Gudang',
                jabatan: 'Supervisor',
                posisi: 'Supervisor Gudang',
                hire: '2020-11-02',
                hak: [{ id: 'h10', d: START, hak: 12, exp: END, note: 'Jatah awal tahun', periode: Y }],
                rec: [],
            },
            {
                id: 'p12',
                nik: '2022.12.026',
                nama: 'Maya Sari',
                departemen: 'Keuangan',
                jabatan: 'Manager',
                posisi: 'Manager Keuangan',
                hire: '2022-12-05',
                hak: [{ id: 'h11', d: START, hak: 12, exp: END, note: 'Jatah awal tahun', periode: Y }],
                rec: [{ id: 'r16', t: 'Cuti Tahunan', d1: YEAR + '-04-06', d2: YEAR + '-04-15', days: 8, potong: 1, jam: '', tujuan: '' }],
            },
        ];
    }

    var EMPS = buildSeed();

    function filtered() {
        var q = S.q.toLowerCase();

        if (!q) {
            return EMPS;
        }

        return EMPS.filter(function (e) {
            return (e.nama + ' ' + e.nik + ' ' + (e.departemen || '')).toLowerCase().indexOf(q) !== -1;
        });
    }

    function cell(b, e) {
        if (!b.g.length) {
            return belumSetahun(e)
                ? ['<small>Belum ada hak cuti</small>', '', '']
                : ['<div class="it"><span class="bal">0/0</span></div>', '', ''];
        }

        var act = b.g.filter(function (x) {
            return x.active;
        });

        if (!act.length) {
            return ['<div class="it"><span class="bal">0/0</span></div>', '', ''];
        }

        var soon = function (x) {
            return x.exp <= addM(TODAY, 3);
        };
        var over = b.over > 0 ? '<div class="it over">Kurang ' + num(b.over) + ' hari</div>' : '';

        if (
            act.some(function (x) {
                return x.amt < 0;
            })
        ) {
            // Ada baris pengurangan cuti: tampilkan total bersih terpakai/hak.
            var pos = act.filter(function (x) {
                return x.amt > 0;
            });
            var r =
                pos.filter(function (x) {
                    return x.used < x.amt;
                })[0] ||
                pos[pos.length - 1] ||
                act[0];

            return [
                '<div class="it"><span class="bal' + (b.used >= b.total ? ' low' : '') + '">' + num(b.used) + '/' + num(b.total) + '</span></div>' + over,
                r ? '<div class="it">Tahun ' + (r.periode || r.d.slice(0, 4)) + '</div>' : '',
                r ? '<div class="it"><span' + (soon(r) ? ' class="bad"' : '') + '>' + fmt(r.exp) + '</span></div>' : '',
            ];
        }

        var v = act.filter(function (x) {
            return x.used < x.amt;
        });

        if (!v.length) {
            v = [act[act.length - 1]];
        }

        var w = function (f) {
            return v
                .map(function (x) {
                    return '<div class="it">' + f(x) + '</div>';
                })
                .join('');
        };

        return [
            w(function (x) {
                return '<span class="bal' + (x.used >= x.amt ? ' low' : '') + '">' + num(x.used) + '/' + num(x.amt) + '</span>';
            }) + over,
            w(function (x) {
                return 'Tahun ' + (x.periode || x.d.slice(0, 4));
            }),
            w(function (x) {
                return '<span' + (soon(x) ? ' class="bad"' : '') + '>' + fmt(x.exp) + '</span>';
            }),
        ];
    }

    function rowHtml(e) {
        var b = grants(e);
        var c = cell(b, e);
        var checked = sel.has(e.id);

        return (
            '<tr data-id="' +
            esc(e.id) +
            '" class="' +
            (checked ? 'sel' : '') +
            '">' +
            '<td class="c"><input type="checkbox" data-c="' +
            esc(e.id) +
            '"' +
            (checked ? ' checked' : '') +
            ' aria-label="Pilih ' +
            esc(e.nama) +
            '"></td>' +
            '<td class="nik">' +
            esc(e.nik) +
            '</td>' +
            '<td class="nm">' +
            esc(e.nama) +
            '</td>' +
            '<td class="dp">' +
            esc(e.departemen || '') +
            '</td>' +
            '<td class="jb">' +
            esc(e.jabatan || '') +
            '</td>' +
            '<td class="ps">' +
            esc(e.posisi || '') +
            '</td>' +
            '<td class="bal">' +
            c[0] +
            '</td>' +
            '<td class="prd">' +
            c[1] +
            '</td>' +
            '<td class="exp">' +
            c[2] +
            '</td>' +
            '</tr>'
        );
    }

    function render() {
        var list = filtered();
        var last = Math.max(1, Math.ceil(list.length / SIZE));

        if (S.page > last) {
            S.page = last;
        }

        if (S.page < 1) {
            S.page = 1;
        }

        S.last = last;
        S.total = list.length;

        var from = (S.page - 1) * SIZE;
        var page = list.slice(from, from + SIZE);

        $('rows').innerHTML = page.map(rowHtml).join('');
        $('empty').hidden = page.length > 0;
        $('tw').hidden = page.length === 0;

        var all = $('all');
        var every = page.length > 0 && page.every(function (e) { return sel.has(e.id); });
        var some = page.some(function (e) { return sel.has(e.id); });

        all.checked = every;
        all.indeterminate = !every && some;

        $('bAdd').disabled = sel.size === 0;
        $('bAddTxt').textContent = 'Tambah jatah cuti (' + sel.size + ' dipilih)';

        $('bPrev').disabled = S.page <= 1;
        $('bNext').disabled = S.page >= S.last;
        $('pTxt').textContent = 'Halaman ' + S.page + ' dari ' + S.last + ' · ' + S.total + ' karyawan';
    }

    function pilih(e, on) {
        if (on) {
            sel.add(e.id);
            selData.set(e.id, e);
        } else {
            sel.delete(e.id);
            selData.delete(e.id);
        }
    }

    function openModal(id) {
        $(id).hidden = false;
    }

    function closeModal(id) {
        $(id).hidden = true;
    }

    function balBox() {
        var b = grants(cur);
        var auto = b.g.some(function (x) {
            return x.auto;
        });
        var kosong = b.g.length
            ? ''
            : belumSetahun(cur)
              ? '<div class="note">Belum ada hak cuti — belum 1 tahun sejak tanggal masuk' +
                (cur.hire ? ' (berhak setelah ' + fmt(addM(cur.hire, 12)) + ')' : '') +
                '. Bisa ditambah manual lewat “+ Tambah jatah cuti”.</div>'
              : '<div class="note">Belum ada hak cuti — <b>0/0</b> (tidak ada tanggal masuk, di luar logika perhitungan). Tambah manual lewat “+ Tambah jatah cuti”.</div>';

        $('inBal').innerHTML =
            '<div class="bx"><b>Hak cuti: terpakai ' +
            num(b.used) +
            ' / hak ' +
            num(b.total) +
            ' · sisa ' +
            num(b.total - b.used) +
            ' hari</b>' +
            (auto ? '<div class="note">Perhitungan otomatis dari tanggal masuk (belum disimpan di database).</div>' : '') +
            (b.g.length
                ? '<table><tr><th>Diberikan</th><th>Hak</th><th>Terpakai</th><th>Kadaluarsa</th><th></th></tr>' +
                  b.g
                      .map(function (x) {
                          return (
                              '<tr><td>' +
                              fmt(x.d) +
                              '<br><small>' +
                              esc(x.note) +
                              '</small></td><td' +
                              (x.amt < 0 ? ' class="bad"' : '') +
                              '>' +
                              num(x.amt) +
                              '</td><td>' +
                              num(x.used) +
                              '</td><td>' +
                              fmt(x.exp) +
                              '</td><td><span class="tag ' +
                              (x.active ? 'ok' : 'x') +
                              '">' +
                              (x.active ? 'aktif' : 'habis masa') +
                              '</span></td></tr>'
                          );
                      })
                      .join('') +
                  '</table>'
                : kosong) +
            '</div>';
    }

    function riwayat() {
        var cut = (cur.rec || []).slice().sort(function (a, b) {
            return a.d1 < b.d1 ? 1 : -1;
        });

        var h = '<div class="bx"><b>Riwayat cuti &amp; sakit</b>';

        h += cut.length
            ? '<table><tr><th>Jenis</th><th>Tanggal</th><th>Hari</th><th></th></tr>' +
              cut
                  .map(function (r) {
                      return (
                          '<tr><td>' +
                          esc(r.t) +
                          (r.jam ? '<br><small>' + esc(r.jam) + '</small>' : '') +
                          (r.tujuan ? '<br><small>' + esc(r.tujuan) + '</small>' : '') +
                          '</td><td>' +
                          fmt(r.d1) +
                          (r.d2 && r.d2 !== r.d1 ? ' – ' + fmt(r.d2) : '') +
                          '</td><td>' +
                          num(r.days) +
                          '</td><td class="ac"><button type="button" class="btn del" data-hl="cuti" data-id="' +
                          esc(r.id) +
                          '">Hapus</button></td></tr>'
                      );
                  })
                  .join('') +
              '</table>'
            : '<div class="note">Belum ada riwayat cuti/sakit.</div>';

        $('inRiwayat').innerHTML = h + '</div>';
    }

    function openIn(id) {
        cur =
            EMPS.filter(function (e) {
                return e.id === id;
            })[0] || null;

        if (!cur) {
            return;
        }

        $('inT').textContent = cur.nama + ' · ' + cur.nik;
        $('jenis').selectedIndex = 0;
        $('d1').value = TODAY;
        $('d2').value = TODAY;
        $('tuj').value = '';
        $('j1').value = '';
        $('j2').value = '';

        balBox();
        form();
        riwayat();
        openModal('mIn');
    }

    function dur() {
        var j = $('jenis').value;

        if (j === 'Izin Keluar Kantor') {
            return 0;
        }

        if (HALF.indexOf(j) !== -1) {
            return 0.5;
        }

        return $('d2').value >= $('d1').value
            ? j === 'Cuti Tahunan' || j === 'Cuti Biasa'
                ? weekdays($('d1').value, $('d2').value)
                : Math.round((new Date($('d2').value) - new Date($('d1').value)) / 864e5) + 1
            : 0;
    }

    function form() {
        var j = $('jenis').value;
        var one = HALF.indexOf(j) !== -1;
        var noEnd = one || HAID.indexOf(j) !== -1;

        $('wD2').hidden = noEnd;
        $('wJ1').hidden = !one;
        $('wJ2').hidden = !one;
        $('lJ1').textContent = j === 'Izin Keluar Kantor' ? 'Jam keluar' : 'Jam mulai';
        $('lJ2').textContent = j === 'Izin Keluar Kantor' ? 'Jam kembali' : 'Jam selesai';
        $('wTuj').hidden = j.indexOf('Dinas') !== 0;
        $('lD1').textContent = noEnd ? 'Tanggal' : 'Tanggal mulai';

        if (noEnd) {
            $('d2').value = $('d1').value;
        }

        if (!cur) {
            return;
        }

        var d = dur();
        var pot = POTONG.indexOf(j) !== -1;
        var b = grants(cur);
        var sisa = b.total - b.used;
        var hariKerja = j === 'Cuti Tahunan' || j === 'Cuti Biasa';
        var t = pot
            ? 'Memotong jatah: <b>' +
              num(d) +
              ' hari</b>' +
              (hariKerja ? ' (Sabtu–Minggu tidak dihitung)' : '') +
              '. Sisa setelah ini: <b>' +
              num(sisa - d) +
              ' hari</b>.'
            : j === 'Izin Keluar Kantor'
              ? 'Tidak memotong jatah cuti.'
              : 'Durasi: <b>' + d + ' hari</b>. Tidak memotong jatah cuti.';

        if (pot && sisa - d < 0) {
            t += '<br><b class="bad">⚠ Melebihi sisa jatah aktif.</b>';
        }

        $('calc').innerHTML = t;
    }

    $('q').oninput = function () {
        clearTimeout($('q')._t);
        $('q')._t = setTimeout(function () {
            S.q = $('q').value.trim();
            S.page = 1;
            render();
        }, 300);
    };

    $('all').onchange = function (e) {
        var list = filtered();
        var from = (S.page - 1) * SIZE;

        list.slice(from, from + SIZE).forEach(function (x) {
            pilih(x, e.target.checked);
        });

        render();
    };

    $('rows').onclick = function (e) {
        var c = e.target.closest('[data-c]');

        if (c) {
            var emp = EMPS.filter(function (x) {
                return x.id === c.getAttribute('data-c');
            })[0];

            if (emp) {
                pilih(emp, c.checked);
            }

            render();
            return;
        }

        var tr = e.target.closest('tr[data-id]');

        if (tr) {
            openIn(tr.getAttribute('data-id'));
        }
    };

    $('bPrev').onclick = function () {
        if (S.page > 1) {
            S.page--;
            render();
        }
    };

    $('bNext').onclick = function () {
        if (S.page < S.last) {
            S.page++;
            render();
        }
    };

    root.querySelectorAll('[data-x]').forEach(function (b) {
        b.onclick = function () {
            b.closest('.ov').hidden = true;
        };
    });

    $('jenis').oninput = form;
    $('d1').oninput = form;
    $('d2').oninput = form;

    $('bSave').onclick = function () {
        if (!cur) {
            return;
        }

        var j = $('jenis').value;
        var pot = POTONG.indexOf(j) !== -1;
        var d = dur();

        if (!$('d1').value || (j !== 'Izin Keluar Kantor' && d <= 0)) {
            alert('Tanggal belum valid / tidak ada hari kerja.');
            return;
        }

        if (HAID.indexOf(j) !== -1 && $('d2').value !== $('d1').value) {
            alert('Cuti Haid maksimal 1 hari.');
            return;
        }

        if (HALF.indexOf(j) !== -1 && (!$('j1').value || !$('j2').value || $('j2').value <= $('j1').value)) {
            alert('Isi jam mulai dan selesai dengan benar.');
            return;
        }

        if (j.indexOf('Dinas') === 0 && !$('tuj').value.trim()) {
            alert('Isi tujuan dinas.');
            return;
        }

        var b = grants(cur);

        if (pot && b.total - b.used - d < 0 && !confirm('Jatah cuti tidak cukup. Tetap simpan?')) {
            return;
        }

        var one = HALF.indexOf(j) !== -1;
        var noEnd = one || HAID.indexOf(j) !== -1;

        cur.rec = cur.rec || [];
        cur.rec.push({
            id: 'r' + ++uid,
            t: j,
            d1: $('d1').value,
            d2: noEnd ? $('d1').value : $('d2').value,
            days: d,
            potong: pot ? 1 : 0,
            jam: one ? $('j1').value + '–' + $('j2').value : '',
            tujuan: j.indexOf('Dinas') === 0 ? $('tuj').value.trim() : '',
        });

        render();
        closeModal('mIn');
    };

    $('inRiwayat').onclick = function (ev) {
        var b = ev.target.closest('[data-hl]');

        if (!b || !cur) {
            return;
        }

        if (!confirm('Hapus data ini?')) {
            return;
        }

        var id = b.getAttribute('data-id');

        cur.rec = (cur.rec || []).filter(function (x) {
            return String(x.id) !== String(id);
        });

        balBox();
        riwayat();
        render();
    };

    $('bAdd').onclick = function () {
        var n = Array.from(selData.values());

        if (!n.length) {
            return;
        }

        $('addWho').innerHTML =
            'Untuk <b>' +
            n.length +
            ' karyawan</b>: ' +
            esc(
                n
                    .slice(0, 4)
                    .map(function (e) {
                        return e.nama;
                    })
                    .join(', '),
            ) +
            (n.length > 4 ? ' dst.' : '');

        $('aOp').value = 'tambah';
        $('aVal').value = 12;
        $('aAmt').value = 1;
        $('aNote').value = '';
        openModal('mAdd');
    };

    $('aSave').onclick = function () {
        var amt = +$('aAmt').value;
        var val = +$('aVal').value;

        if (!(amt > 0 && val > 0)) {
            alert('Isi jumlah dan masa berlaku.');
            return;
        }

        var jumlah = $('aOp').value === 'kurang' ? -Math.abs(amt) : Math.abs(amt);
        var note = $('aNote').value.trim() || (jumlah < 0 ? 'Pengurangan cuti' : 'Hak cuti');

        Array.from(selData.values()).forEach(function (e) {
            e.hak = e.hak || [];
            e.hak.push({
                id: 'h' + ++uid,
                d: TODAY,
                hak: jumlah,
                exp: addM(TODAY, val),
                note: note,
                periode: +TODAY.slice(0, 4),
                terpakai: 0,
            });
        });

        render();
        closeModal('mAdd');
    };

    var SF = { sWait: 'wait', sFQ: 'firstQ', sFV: 'firstV', sYQ: 'yearQ', sYV: 'yearV', sYX: 'yearX' };

    function example() {
        var v = function (k) {
            return +$(k).value;
        };
        var d = addM('2026-01-01', v('sWait'));

        $('sEx').innerHTML =
            'Contoh karyawan masuk <b>01/01/2026</b>: jatah pertama <b>' +
            v('sFQ') +
            ' hari</b> pada <b>' +
            fmt(d) +
            '</b>, kadaluarsa <b>' +
            fmt(addM(d, v('sFV'))) +
            '</b>. Lalu tiap 1 Januari dapat <b>' +
            v('sYQ') +
            ' hari</b>, berlaku <b>' +
            v('sYV') +
            '+' +
            v('sYX') +
            ' bulan</b> (mis. jatah 01/01/2027 kadaluarsa ' +
            fmt(addM('2027-01-01', v('sYV') + v('sYX'))) +
            ').';
    }

    $('bSet').onclick = function () {
        for (var k in SF) {
            $(k).value = S.set[SF[k]];
        }

        $('sEff').value = S.set.eff || '';
        example();
        openModal('mSet');
    };

    for (var k in SF) {
        $(k).oninput = example;
    }

    $('sSave').onclick = function () {
        var n = {};
        var bad = false;

        for (var k in SF) {
            n[SF[k]] = +$(k).value;

            if (isNaN(n[SF[k]]) || n[SF[k]] < 0) {
                bad = true;
            }
        }

        if (bad || n.firstV < 1 || n.yearV < 1) {
            alert('Nilai belum valid.');
            return;
        }

        n.eff = ($('sEff').value || '').trim();

        if (n.eff && !/^\d{4}-\d{2}-\d{2}$/.test(n.eff)) {
            alert('Tanggal mulai berlaku belum valid.');
            return;
        }

        S.set = n;
        render();
        closeModal('mSet');
    };

    $('bImp').onclick = function () {
        $('impFile').value = '';
        $('impPesan').innerHTML = '';
        $('pesImp').innerHTML = '';
        openModal('mImp');
    };

    $('impGo').onclick = function () {
        if (!$('impFile').files.length) {
            $('impPesan').innerHTML = '<div class="info bad">Pilih file Excel dulu.</div>';
        }
    };

    function onKey(ev) {
        if (ev.key !== 'Escape') {
            return;
        }

        Array.prototype.forEach.call(root.querySelectorAll('.ov:not([hidden])'), function (ov) {
            ov.hidden = true;
        });
    }

    document.addEventListener('keydown', onKey);

    function onNav() {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('livewire:navigating', onNav);
    }

    document.addEventListener('livewire:navigating', onNav);

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInputCutiDanSakit);
} else {
    initInputCutiDanSakit();
}

document.addEventListener('livewire:navigated', initInputCutiDanSakit);
