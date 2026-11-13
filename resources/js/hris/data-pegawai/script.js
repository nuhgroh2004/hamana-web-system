const initializedRoots = new WeakSet();

function initDataPegawai() {
    const root = document.getElementById('data-pegawai');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    // Tujuan tiap menu Aksi (NIK dikirim sebagai ?nik=...)
    var ROUTES = {};

    try {
        ROUTES = JSON.parse(root.dataset.routes || '{}');
    } catch (e) {
        ROUTES = {};
    }

    var JABATAN = [
        'Direktur Utama',
        'Direktur',
        'Manager',
        'Supervisor',
        'Foreman',
        'Head',
        'Leader',
        'Officer',
        'Operator',
        'General Manager',
        'Asisstant General Manager',
        'Driver',
        'Intern',
    ];
    // Data contoh (ganti dengan data dari server)
    var SEED = [
        ['2018001', 'Budi Santoso', 'Direktur Utama', 'Direktur Utama', 1],
        ['2018002', 'Siti Rahmawati', 'Direktur', 'Direktur Keuangan', 1],
        ['2018003', 'Agus Prasetyo', 'General Manager', 'General Manager Operasional', 1],
        ['2019004', 'Dewi Lestari', 'Asisstant General Manager', 'Asisstant GM Produksi', 1],
        ['2019005', 'Rudi Hartono', 'Manager', 'Manager HRD', 1],
        ['2019006', 'Nina Kusumawati', 'Manager', 'Manager Keuangan', 1],
        ['2020007', 'Hendra Wijaya', 'Supervisor', 'Supervisor Produksi', 1],
        ['2020008', 'Fitri Handayani', 'Supervisor', 'Supervisor Gudang', 1],
        ['2020009', 'Joko Susilo', 'Foreman', 'Foreman Line A', 1],
        ['2020010', 'Eko Prabowo', 'Foreman', 'Foreman Line B', 0],
        ['2021011', 'Wahyu Nugroho', 'Head', 'Head Quality Control', 1],
        ['2021012', 'Lina Marlina', 'Leader', 'Leader Packing', 1],
        ['2021013', 'Dimas Aditya', 'Leader', 'Leader Maintenance', 1],
        ['2021014', 'Rina Wulandari', 'Officer', 'Officer Payroll', 1],
        ['2021015', 'Yoga Pratama', 'Officer', 'Officer IT', 1],
        ['2022016', 'Sari Indrawati', 'Officer', 'Officer Pajak', 0],
        ['2022017', 'Tono Sugiarto', 'Operator', 'Operator Mesin', 1],
        ['2022018', 'Slamet Riyadi', 'Operator', 'Operator Forklift', 1],
        ['2022019', 'Bayu Setiawan', 'Driver', 'Driver Direksi', 1],
        ['2023020', 'Candra Kirana', 'Driver', 'Driver Operasional', 0],
        ['2024021', 'Putri Anggraini', 'Intern', 'Intern Administrasi', 1],
        ['2024022', 'Fajar Ramadhan', 'Intern', 'Intern IT', 0],
    ].map(function (r) {
        return { nik: r[0], nama: r[1], jabatan: r[2], posisi: r[3], aktif: r[4] === 1 };
    });

    var KEY = 'data-pegawai',
        all = SEED,
        saved = null;

    try {
        saved = JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
        saved = null;
    }

    if (saved && saved.length) {
        all = saved;
    }

    function persist() {
        try {
            localStorage.setItem(KEY, JSON.stringify(all));
        } catch (e) {
            // abaikan bila penyimpanan lokal penuh
        }
    }

    var q = '',
        filt = '1',
        page = 1,
        SIZE = 10;
    var tb = document.getElementById('tb'),
        mn = document.getElementById('mn'),
        ov = document.getElementById('ov'),
        toast = document.getElementById('toast');

    function esc(v) {
        return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    function say(m) {
        toast.textContent = m;
        toast.classList.add('on');
        clearTimeout(say.t);
        say.t = setTimeout(function () {
            toast.classList.remove('on');
        }, 2600);
    }

    function emit(n, d) {
        document.dispatchEvent(new CustomEvent(n, { detail: d }));
    }

    function list() {
        var s = q.trim().toLowerCase();

        return all.filter(function (p) {
            if (filt !== 'all' && p.aktif !== (filt === '1')) {
                return false;
            }

            return !s || p.nama.toLowerCase().indexOf(s) >= 0 || p.nik.toLowerCase().indexOf(s) >= 0;
        });
    }

    // ---- dropdown kustom (satu komponen untuk semua dropdown) ----
    var DD = {},
        CK = '<svg class="i ck" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>';

    function dd(id, opts, val, cb) {
        DD[id] = { opts: opts, val: val, cb: cb };
        paint(id);
    }

    function paint(id) {
        var d = DD[id],
            o = d.opts.filter(function (x) {
                return x[0] === d.val;
            })[0];

        root.querySelectorAll('[data-dd="' + id + '"] .l').forEach(function (el) {
            el.textContent = o ? o[1] : '';
        });
    }

    // ---- popover ----
    var curBtn = null,
        curDD = null;

    function closeMenu() {
        mn.hidden = true;
        curBtn = null;
        curDD = null;
    }

    function place(btn, w) {
        mn.style.width = w + 'px';
        mn.hidden = false;

        var r = btn.getBoundingClientRect(),
            h = mn.offsetHeight;
        var top = r.bottom + 4;

        if (top + h > innerHeight - 8) {
            top = Math.max(8, r.top - h - 4);
        }

        mn.style.top = top + 'px';
        mn.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + 'px';
        curBtn = btn;
    }

    var IC = {
        profil: '<circle cx="8" cy="5" r="3"/><path d="M2.5 14c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5z"/>',
        pendidikan:
            '<path d="M8 3L1.5 6 8 9l6.5-3zM4 7.5v3c0 1 1.8 2 4 2s4-1 4-2v-3"/>',
        keluarga:
            '<circle cx="6" cy="5" r="2.5"/><path d="M1.5 14c0-3 2-4.5 4.5-4.5s4.5 1.5 4.5 4.5zM10.5 3a2.5 2.5 0 010 4.5M12 9.8c1.6.4 2.5 1.7 2.5 4.2"/>',
        fisik: '<circle cx="8" cy="3" r="1.5"/><path d="M3 6h10M8 6v4M5 14l3-4 3 4"/>',
        file: '<path d="M1.5 3.5h4l1.5 1.5h7.5v8h-13z"/>',
    };
    var ITEMS = [
        ['profil', 'Profil Karyawan'],
        ['pendidikan', 'Riwayat Pendidikan'],
        ['keluarga', 'Data Keluarga'],
        ['fisik', 'Ciri Fisik'],
        ['file', 'File Karyawan'],
    ];

    function openAksi(btn) {
        var nik = btn.dataset.menu;

        mn.setAttribute('role', 'menu');
        mn.innerHTML = ITEMS.map(function (it) {
            return (
                '<a role="menuitem" href="' +
                (ROUTES[it[0]] || '#') +
                '?nik=' +
                encodeURIComponent(nik) +
                '" data-aksi="' +
                it[0] +
                '" data-nik="' +
                esc(nik) +
                '"><svg class="i" viewBox="0 0 16 16">' +
                IC[it[0]] +
                '</svg>' +
                it[1] +
                '</a>'
            );
        }).join('');
        place(btn, 230);
    }

    function openDD(btn) {
        var id = btn.dataset.dd,
            d = DD[id];

        if (!d) {
            return;
        }

        mn.setAttribute('role', 'listbox');
        mn.innerHTML = d.opts
            .map(function (o) {
                return (
                    '<button type="button" role="option" data-opt="' +
                    esc(o[0]) +
                    '" class="' +
                    (o[0] === d.val ? 'on' : '') +
                    '">' +
                    esc(o[1]) +
                    CK +
                    '</button>'
                );
            })
            .join('');
        place(btn, Math.max(btn.offsetWidth, 200));
        curDD = id;
    }

    document.addEventListener('click', function (e) {
        if (!root.isConnected) {
            return;
        }

        var m = e.target.closest('[data-menu]'),
            d = e.target.closest('[data-dd]'),
            b = m || d;

        if (b) {
            if (curBtn === b) {
                closeMenu();
                return;
            }

            closeMenu();

            if (m) {
                openAksi(b);
            } else {
                openDD(b);
            }

            return;
        }

        if (!mn.hidden && !mn.contains(e.target)) {
            closeMenu();
        }
    });

    mn.addEventListener('click', function (e) {
        var a = e.target.closest('[data-aksi]');

        if (a) {
            var p = all.filter(function (x) {
                return x.nik === a.dataset.nik;
            })[0];

            emit('pegawai-aksi', { aksi: a.dataset.aksi, pegawai: p });
            closeMenu();
            return;
        }

        var o = e.target.closest('[data-opt]');

        if (o && curDD) {
            var id = curDD,
                d = DD[id];

            d.val = o.dataset.opt;
            paint(id);
            closeMenu();

            if (d.cb) {
                d.cb(d.val);
            }
        }
    });

    window.addEventListener(
        'scroll',
        function (e) {
            if (root.isConnected && !mn.hidden && !mn.contains(e.target)) {
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

    // ---- render ----
    function counts() {
        var a = all.filter(function (p) {
            return p.aktif;
        }).length;

        document.getElementById('n1').textContent = a;
        document.getElementById('n0').textContent = all.length - a;
        document.getElementById('nall').textContent = all.length;
        root.querySelectorAll('.sc').forEach(function (b) {
            b.classList.toggle('on', b.dataset.f === filt);
        });
    }

    function render() {
        counts();

        var L = list(),
            pages = Math.max(1, Math.ceil(L.length / SIZE));

        if (page > pages) {
            page = pages;
        }

        var from = (page - 1) * SIZE,
            rows = L.slice(from, from + SIZE);

        tb.innerHTML = rows
            .map(function (p) {
                return (
                    '<tr><td class="c1"><button type="button" class="btn sm" data-menu="' +
                    esc(p.nik) +
                    '" aria-haspopup="menu">Aksi <svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg></button></td>' +
                    '<td>' +
                    esc(p.nik) +
                    '</td><td class="nm">' +
                    esc(p.nama) +
                    '</td><td>' +
                    esc(p.jabatan) +
                    '</td><td>' +
                    esc(p.posisi) +
                    '</td>' +
                    '<td><span class="bdg' +
                    (p.aktif ? ' ok' : '') +
                    '">' +
                    (p.aktif ? 'Aktif' : 'Tidak Aktif') +
                    '</span></td></tr>'
                );
            })
            .join('');

        document.getElementById('empty').hidden = L.length > 0;
        document.getElementById('cnt').textContent = L.length
            ? 'Menampilkan ' + (from + 1) + '–' + (from + rows.length) + ' dari ' + L.length + ' pegawai'
            : '0 pegawai';

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

        document.getElementById('pn').innerHTML = h;
    }

    // ---- filter ----
    dd('st', [['1', 'Aktif'], ['0', 'Tidak Aktif'], ['all', 'Semua']], '1', function (v) {
        filt = v;
        page = 1;
        render();
    });

    document.getElementById('sum').addEventListener('click', function (e) {
        var b = e.target.closest('[data-f]');

        if (!b) {
            return;
        }

        filt = b.dataset.f;
        DD.st.val = filt;
        paint('st');
        page = 1;
        render();
    });

    document.getElementById('q').addEventListener('input', function () {
        q = this.value;
        page = 1;
        render();
    });

    document.getElementById('pn').addEventListener('click', function (e) {
        var b = e.target.closest('[data-p]');

        if (b && !b.disabled) {
            page = +b.dataset.p;
            render();
        }
    });

    // ---- modal ----
    function open(title, body, foot) {
        ov.innerHTML =
            '<div class="dlg" role="dialog" aria-modal="true" aria-label="' +
            esc(title) +
            '"><div class="dh"><span>' +
            esc(title) +
            '</span><button type="button" class="x" data-close aria-label="Tutup"><svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div><div class="db">' +
            body +
            '</div><div class="df">' +
            foot +
            '</div></div>';
        ov.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function close() {
        ov.hidden = true;
        ov.innerHTML = '';
        document.body.style.overflow = '';
        closeMenu();
    }

    ov.addEventListener('click', function (e) {
        if (e.target === ov || e.target.closest('[data-close]')) {
            close();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (!root.isConnected || e.key !== 'Escape') {
            return;
        }

        if (!mn.hidden) {
            closeMenu();
        } else if (!ov.hidden) {
            close();
        }
    });

    document.addEventListener('livewire:navigating', function () {
        if (root.isConnected) {
            close();
        }
    });

    // ---- tambah karyawan ----
    var CH = '<svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>';

    document.getElementById('add').onclick = function () {
        open(
            'Tambah Karyawan',
            '<div class="f"><label for="a-nik">NIK <span class="rq">*</span></label><input class="fld" id="a-nik" autocomplete="off"><p class="er" id="e-nik"></p></div>' +
                '<div class="f"><label for="a-nama">Nama Lengkap <span class="rq">*</span></label><input class="fld" id="a-nama" autocomplete="off"><p class="er" id="e-nama"></p></div>' +
                '<div class="f"><label>Jabatan <span class="rq">*</span></label><button type="button" class="fld dd" data-dd="a-jab" id="a-jab" aria-haspopup="listbox"><span class="l"></span>' +
                CH +
                '</button><p class="er" id="e-jab"></p></div>' +
                '<div class="f"><label for="a-pos">Posisi <span class="rq">*</span></label><input class="fld" id="a-pos" autocomplete="off"><p class="er" id="e-pos"></p></div>' +
                '<div class="f"><label>Status</label><button type="button" class="fld dd" data-dd="a-st" aria-haspopup="listbox"><span class="l"></span>' +
                CH +
                '</button></div>',
            '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn go" id="a-save">Simpan</button>',
        );

        dd(
            'a-jab',
            [['', '--Pilih--']].concat(
                JABATAN.map(function (j) {
                    return [j, j];
                }),
            ),
            '',
            function () {
                document.getElementById('a-jab').classList.remove('bad');
                document.getElementById('e-jab').textContent = '';
            },
        );

        dd('a-st', [['1', 'Aktif'], ['0', 'Tidak Aktif']], '1');
        document.getElementById('a-nik').focus();

        document.getElementById('a-save').onclick = function () {
            var v = {
                nik: document.getElementById('a-nik').value.trim(),
                nama: document.getElementById('a-nama').value.trim(),
                jabatan: DD['a-jab'].val,
                posisi: document.getElementById('a-pos').value.trim(),
                aktif: DD['a-st'].val === '1',
            };
            var err = {
                nik: !v.nik
                    ? 'NIK wajib diisi.'
                    : all.some(function (p) {
                          return p.nik === v.nik;
                      })
                      ? 'NIK sudah terdaftar.'
                      : '',
                nama: v.nama ? '' : 'Nama wajib diisi.',
                jab: v.jabatan ? '' : 'Jabatan wajib dipilih.',
                pos: v.posisi ? '' : 'Posisi wajib diisi.',
            };
            var map = { nik: 'a-nik', nama: 'a-nama', jab: 'a-jab', pos: 'a-pos' },
                first = null;

            Object.keys(err).forEach(function (k) {
                document.getElementById('e-' + k).textContent = err[k];
                document.getElementById(map[k]).classList.toggle('bad', !!err[k]);

                if (err[k] && !first) {
                    first = map[k];
                }
            });

            if (first) {
                document.getElementById(first).focus();
                return;
            }

            all.push(v);
            persist();

            if (filt !== 'all' && filt !== (v.aktif ? '1' : '0')) {
                filt = 'all';
                DD.st.val = 'all';
                paint('st');
            }

            q = '';
            document.getElementById('q').value = '';
            page = Math.ceil(list().length / SIZE);
            close();
            render();
            emit('pegawai-tambah', v);
            say('Karyawan ' + v.nama + ' berhasil ditambahkan.');
        };
    };

    // ---- export (CSV) ----
    function cell(v) {
        return '"' + String(v).replace(/"/g, '""') + '"';
    }

    function download(name, text) {
        var a = document.createElement('a');

        a.href = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' }));
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () {
            URL.revokeObjectURL(a.href);
        }, 1000);
    }

    document.getElementById('exp').onclick = function () {
        var L = list();
        var csv = ['No,NIK,Nama,Jabatan,Posisi,Status']
            .concat(
                L.map(function (p, i) {
                    return [i + 1, p.nik, p.nama, p.jabatan, p.posisi, p.aktif ? 'Aktif' : 'Tidak Aktif']
                        .map(cell)
                        .join(',');
                }),
            )
            .join('\r\n');

        download('data-pegawai.csv', csv);
        emit('pegawai-export', L);
        say(L.length + ' data pegawai diekspor.');
    };

    // ---- import (CSV) ----
    function parseCSV(t) {
        t = t.replace(/^\uFEFF/, '');

        var first = t.split(/\r?\n/)[0] || '',
            d = first.split(';').length > first.split(',').length ? ';' : ',';
        var rows = [],
            row = [],
            cur = '',
            inq = false;

        for (var i = 0; i < t.length; i++) {
            var c = t[i];

            if (inq) {
                if (c === '"') {
                    if (t[i + 1] === '"') {
                        cur += '"';
                        i++;
                    } else {
                        inq = false;
                    }
                } else {
                    cur += c;
                }
            } else if (c === '"') {
                inq = true;
            } else if (c === d) {
                row.push(cur);
                cur = '';
            } else if (c === '\n' || c === '\r') {
                if (c === '\r' && t[i + 1] === '\n') {
                    i++;
                }

                row.push(cur);
                cur = '';

                if (
                    row.some(function (x) {
                        return x.trim();
                    })
                ) {
                    rows.push(row);
                }

                row = [];
            } else {
                cur += c;
            }
        }

        row.push(cur);

        if (
            row.some(function (x) {
                return x.trim();
            })
        ) {
            rows.push(row);
        }

        return rows;
    }

    function doImport(text) {
        var R = parseCSV(text);

        if (R.length < 2) {
            say('File kosong atau format tidak sesuai.');
            return;
        }

        var H = R[0].map(function (h) {
            return h.trim().toLowerCase();
        });

        function ix(n) {
            return H.indexOf(n);
        }

        var iN = ix('nik'),
            iM = ix('nama');

        if (iN < 0 || iM < 0) {
            say('Kolom NIK dan Nama wajib ada di baris pertama.');
            return;
        }

        var add = 0,
            upd = 0,
            skip = 0;

        R.slice(1).forEach(function (r) {
            function g(n) {
                var k = ix(n);

                return k >= 0 ? (r[k] || '').trim() : '';
            }

            var v = {
                nik: (r[iN] || '').trim(),
                nama: (r[iM] || '').trim(),
                jabatan: g('jabatan'),
                posisi: g('posisi'),
                aktif: !/tidak|non|^0$|false/i.test(g('status')),
            };

            if (!v.nik || !v.nama) {
                skip++;
                return;
            }

            var ex = all.filter(function (p) {
                return p.nik === v.nik;
            })[0];

            if (ex) {
                ex.nama = v.nama;

                if (v.jabatan) {
                    ex.jabatan = v.jabatan;
                }

                if (v.posisi) {
                    ex.posisi = v.posisi;
                }

                if (g('status')) {
                    ex.aktif = v.aktif;
                }

                upd++;
            } else {
                all.push(v);
                add++;
            }
        });

        persist();
        page = 1;
        render();
        emit('pegawai-import', { ditambah: add, diperbarui: upd, dilewati: skip });
        say(add + ' ditambahkan, ' + upd + ' diperbarui' + (skip ? ', ' + skip + ' dilewati' : '') + '.');
    }

    document.getElementById('imp').onclick = function () {
        open(
            'Import Data Pegawai',
            '<p>Unggah file CSV dengan kolom: <b>NIK, Nama, Jabatan, Posisi, Status</b>. Baris dengan NIK yang sudah ada akan diperbarui, dan baris tanpa NIK atau Nama dilewati.</p>' +
                '<input type="file" id="i-file" accept=".csv,text/csv" hidden>',
            '<button type="button" class="btn" id="i-tpl" style="margin-right:auto">Unduh template</button><button type="button" class="btn" data-close>Batal</button><button type="button" class="btn go" id="i-pick">Pilih file CSV</button>',
        );

        document.getElementById('i-tpl').onclick = function () {
            download(
                'template-data-pegawai.csv',
                'NIK,Nama,Jabatan,Posisi,Status\r\n2025001,Contoh Nama,Officer,Officer Administrasi,Aktif',
            );
        };

        var inp = document.getElementById('i-file');

        document.getElementById('i-pick').onclick = function () {
            inp.click();
        };

        inp.onchange = function () {
            var f = inp.files[0];

            if (!f) {
                return;
            }

            var rd = new FileReader();

            rd.onload = function () {
                close();
                doImport(String(rd.result));
            };

            rd.readAsText(f);
        };
    };

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataPegawai);
} else {
    initDataPegawai();
}

document.addEventListener('livewire:navigated', initDataPegawai);
