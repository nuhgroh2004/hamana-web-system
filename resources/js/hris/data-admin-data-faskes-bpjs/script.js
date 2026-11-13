const initializedRoots = new WeakSet();

function initDataAdminFaskesBpjs() {
    const root = document.getElementById('data-admin-data-faskes-bpjs');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    var FIELDS = [
        ['prov', 'Nama Provinsi', 1],
        ['reg', 'Kantor Regional', 0],
        ['cab', 'Kantor Cabang', 0],
        ['kab', 'Kabupaten/Kota', 1],
        ['kode', 'Kode PPK', 0],
        ['nama', 'Nama PPK', 1],
        ['alamat', 'Alamat PPK', 0],
        ['telp', 'Telp PPK', 0],
    ];
    var UP = ['prov', 'reg', 'cab', 'kab', 'kode', 'nama'];
    // Data contoh (ganti dengan data dari server)
    var SEED = [
        {
            id: 's0',
            prov: 'SULAWESI SELATAN',
            reg: 'REGIONAL IX - MAKASSAR',
            cab: 'PALOPO',
            kab: 'KAB. TORAJA UTARA',
            kode: '0508U008',
            nama: 'AGNES TJUNGADI (JSP)',
            alamat: 'DIPONEGORO 13',
            telp: '81342594689',
        },
    ];

    var KEY = 'data-faskes-bpjs-v2',
        all = SEED,
        saved = null,
        uid = Date.now();

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
        prov = 'all',
        kab = 'all',
        noKode = false,
        page = 1,
        SIZE = 10;
    var tb = document.getElementById('tb'),
        mn = document.getElementById('mn'),
        ov = document.getElementById('ov'),
        toast = document.getElementById('toast');

    function esc(v) {
        return String(v == null ? '' : v)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
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

    function byId(id) {
        return all.filter(function (r) {
            return r.id === id;
        })[0];
    }

    function list() {
        var s = q.trim().toLowerCase();

        return all.filter(function (r) {
            if (prov !== 'all' && r.prov !== prov) {
                return false;
            }

            if (kab !== 'all' && r.kab !== kab) {
                return false;
            }

            if (noKode && r.kode) {
                return false;
            }

            return (
                !s ||
                r.nama.toLowerCase().indexOf(s) >= 0 ||
                r.kode.toLowerCase().indexOf(s) >= 0 ||
                r.alamat.toLowerCase().indexOf(s) >= 0
            );
        });
    }

    function uniq(key, where) {
        var o = {};

        all.forEach(function (r) {
            if ((!where || where(r)) && r[key]) {
                o[r[key]] = 1;
            }
        });

        return Object.keys(o).sort();
    }

    // ---- dropdown kustom ----
    var curAct = null,
        DD = {},
        CK = '<svg class="i ck" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>',
        curBtn = null,
        curDD = null;

    function paint(id) {
        var d = DD[id],
            o = d.opts.filter(function (x) {
                return x[0] === d.val;
            })[0];

        root.querySelectorAll('[data-dd="' + id + '"] .l').forEach(function (el) {
            el.textContent = o ? o[1] : '';
        });
    }

    function closeMenu() {
        mn.hidden = true;
        curBtn = null;
        curDD = null;
        curAct = null;
    }

    var PEN = '<svg class="i" viewBox="0 0 16 16"><path d="M11 2.5l2.5 2.5L5.5 13H3v-2.5L11 2.5z"/></svg>',
        TRS = '<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5"/></svg>';

    function place(btn, width) {
        mn.style.width = width + 'px';
        mn.hidden = false;

        var r = btn.getBoundingClientRect(),
            h = mn.offsetHeight,
            top = r.bottom + 4;

        if (top + h > innerHeight - 8) {
            top = Math.max(8, r.top - h - 4);
        }

        mn.style.top = top + 'px';
        mn.style.left = Math.max(8, Math.min(innerWidth - width - 8, r.left)) + 'px';
        curBtn = btn;
    }

    function openAct(btn) {
        mn.innerHTML =
            '<button type="button" role="menuitem" data-do="edit">' +
            PEN +
            'Edit</button><button type="button" role="menuitem" data-do="del" style="color:var(--err)">' +
            TRS +
            'Hapus</button>';
        place(btn, 140);
        curAct = btn.dataset.act;
    }

    function openDD(btn) {
        var id = btn.dataset.dd,
            d = DD[id];

        if (!d) {
            return;
        }

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
        place(btn, Math.max(btn.offsetWidth, 220));
        curDD = id;
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

        var a = e.target.closest('[data-act]');

        if (a) {
            if (curBtn === a) {
                closeMenu();
                return;
            }

            closeMenu();
            openAct(a);
            return;
        }

        if (!mn.hidden && !mn.contains(e.target)) {
            closeMenu();
        }
    });

    mn.addEventListener('click', function (e) {
        var k = e.target.closest('[data-do]');

        if (k && curAct) {
            var rid = curAct,
                what = k.dataset.do;

            closeMenu();

            if (what === 'edit') {
                editRow(rid);
            } else {
                delRow(rid);
            }

            return;
        }

        var o = e.target.closest('[data-opt]');

        if (o && curDD) {
            var id = curDD,
                d = DD[id];

            d.val = o.dataset.opt;
            paint(id);
            closeMenu();
            d.cb(d.val);
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

    function opts(arr) {
        return [['all', 'Semua']].concat(
            arr.map(function (v) {
                return [v, v];
            }),
        );
    }

    function syncFilters() {
        // provinsi
        if (prov !== 'all' && uniq('prov').indexOf(prov) < 0) {
            prov = 'all';
        }

        DD.prov = {
            opts: opts(uniq('prov')),
            val: prov,
            cb: function (v) {
                prov = v;
                kab = 'all';
                syncFilters();
                page = 1;
                render();
            },
        };

        // kabupaten/kota mengikuti provinsi terpilih
        var kl = uniq('kab', function (r) {
            return prov === 'all' || r.prov === prov;
        });

        if (kab !== 'all' && kl.indexOf(kab) < 0) {
            kab = 'all';
        }

        DD.kab = {
            opts: opts(kl),
            val: kab,
            cb: function (v) {
                kab = v;
                page = 1;
                render();
            },
        };

        paint('prov');
        paint('kab');
    }

    // ---- render ----
    function render() {
        var nokode = all.filter(function (r) {
            return !r.kode;
        }).length;

        document.getElementById('nall').textContent = all.length;
        document.getElementById('nno').textContent = nokode;
        root.querySelectorAll('.sc').forEach(function (b) {
            b.classList.toggle('on', b.dataset.s === 'nokode' && noKode);
        });

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
                    '<tr><td class="c1"><button type="button" class="btn sm" data-act="' +
                    r.id +
                    '" aria-haspopup="menu">Aksi<svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg></button></td>' +
                    '<td>' +
                    esc(r.prov) +
                    '</td><td>' +
                    esc(r.reg) +
                    '</td><td>' +
                    esc(r.cab) +
                    '</td><td>' +
                    esc(r.kab) +
                    '</td>' +
                    '<td class="nw">' +
                    (r.kode ? esc(r.kode) : '<span class="bdg">Belum ada</span>') +
                    '</td><td class="nm">' +
                    esc(r.nama) +
                    '</td><td>' +
                    esc(r.alamat) +
                    '</td><td class="nw">' +
                    esc(r.telp) +
                    '</td></tr>'
                );
            })
            .join('');

        document.getElementById('empty').hidden = L.length > 0;
        document.getElementById('cnt').textContent = L.length
            ? 'Menampilkan ' + (from + 1) + '–' + (from + rows.length) + ' dari ' + L.length + ' faskes'
            : '0 faskes';

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

    // ---- filter & pencarian ----
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

    document.getElementById('sum').addEventListener('click', function (e) {
        var b = e.target.closest('[data-s]');

        if (!b) {
            return;
        }

        if (b.dataset.s === 'nokode') {
            noKode = !noKode;
        } else {
            noKode = false;
            prov = 'all';
            kab = 'all';
            q = '';
            document.getElementById('q').value = '';
            syncFilters();
        }

        page = 1;
        render();
    });

    // ---- modal ----
    function open(title, body, foot, cls, bcls) {
        ov.innerHTML =
            '<div class="dlg' +
            (cls ? ' ' + cls : '') +
            '" role="dialog" aria-modal="true" aria-label="' +
            esc(title) +
            '"><div class="dh"><span>' +
            esc(title) +
            '</span><button type="button" class="x" data-close aria-label="Tutup"><svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div><div class="db' +
            (bcls ? ' ' + bcls : '') +
            '">' +
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
            closeMenu();
            close();
        }
    });

    function form(r) {
        r = r || {};

        return FIELDS.map(function (f) {
            var wide = f[0] === 'alamat' ? ' wide' : '';

            return (
                '<div class="f' +
                wide +
                '"><label for="f-' +
                f[0] +
                '">' +
                f[1] +
                (f[2] ? ' <span class="rq">*</span>' : '') +
                '</label><input class="fld' +
                (UP.indexOf(f[0]) >= 0 ? ' up' : '') +
                '" id="f-' +
                f[0] +
                '" autocomplete="off" value="' +
                esc(r[f[0]]) +
                '"><p class="er" id="e-' +
                f[0] +
                '"></p></div>'
            );
        }).join('');
    }

    function read() {
        var v = {};

        FIELDS.forEach(function (f) {
            var x = document.getElementById('f-' + f[0]).value.trim();

            v[f[0]] = UP.indexOf(f[0]) >= 0 ? x.toUpperCase() : x;
        });

        return v;
    }

    function validate(v, self) {
        var first = null;

        FIELDS.forEach(function (f) {
            var m = f[2] && !v[f[0]] ? f[1] + ' wajib diisi.' : '';

            if (
                f[0] === 'kode' &&
                v.kode &&
                all.some(function (r) {
                    return r.kode === v.kode && r !== self;
                })
            ) {
                m = 'Kode PPK sudah terdaftar.';
            }

            document.getElementById('e-' + f[0]).textContent = m;
            document.getElementById('f-' + f[0]).classList.toggle('bad', !!m);

            if (m && !first) {
                first = 'f-' + f[0];
            }
        });

        if (first) {
            document.getElementById(first).focus();
        }

        return !first;
    }

    function afterChange() {
        syncFilters();
        render();
    }

    // tambah manual
    document.getElementById('add').onclick = function () {
        open(
            'Tambah Data Faskes',
            form(),
            '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn go" id="sv">Simpan</button>',
            'w',
            'g2',
        );
        document.getElementById('f-prov').focus();
        document.getElementById('sv').onclick = function () {
            var v = read();

            if (!validate(v, null)) {
                return;
            }

            v.id = 'n' + uid++;
            all.push(v);
            persist();
            noKode = false;
            q = '';
            document.getElementById('q').value = '';
            prov = 'all';
            kab = 'all';
            close();
            syncFilters();
            page = Math.ceil(list().length / SIZE);
            render();
            emit('faskes-tambah', v);
            say('Data faskes berhasil ditambahkan.');
        };
    };

    // edit & hapus
    function editRow(id) {
        var r = byId(id);

        if (!r) {
            return;
        }

        open(
            'Edit Data Faskes',
            form(r),
            '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn go" id="sv">Simpan</button>',
            'w',
            'g2',
        );
        document.getElementById('f-nama').focus();
        document.getElementById('sv').onclick = function () {
            var v = read();

            if (!validate(v, r)) {
                return;
            }

            FIELDS.forEach(function (f) {
                r[f[0]] = v[f[0]];
            });
            persist();
            close();
            afterChange();
            emit('faskes-edit', r);
            say('Data faskes berhasil diperbarui.');
        };
    }

    function delRow(id) {
        var d = byId(id);

        if (!d) {
            return;
        }

        open(
            'Hapus data faskes?',
            '<p>Data <b style="color:var(--fg)">' +
                esc(d.nama) +
                '</b>' +
                (d.kode ? ' (' + esc(d.kode) + ')' : '') +
                ' akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>',
            '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn dgb" id="ok">Hapus</button>',
        );
        document.getElementById('ok').onclick = function () {
            all = all.filter(function (x) {
                return x !== d;
            });
            persist();
            close();
            afterChange();
            emit('faskes-hapus', d);
            say('Data faskes berhasil dihapus.');
        };
    }

    // ---- export (CSV) ----
    function cell(v) {
        return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
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

    var HEAD = [
        'Nama Provinsi',
        'Kantor Regional',
        'Kantor Cabang',
        'Kabupaten/Kota',
        'Kode PPK',
        'Nama PPK',
        'Alamat PPK',
        'Telp PPK',
    ];

    document.getElementById('exp').onclick = function () {
        var L = list();
        var csv = [['No'].concat(HEAD).join(',')]
            .concat(
                L.map(function (r, i) {
                    return [i + 1]
                        .concat(
                            FIELDS.map(function (f) {
                                return r[f[0]];
                            }),
                        )
                        .map(cell)
                        .join(',');
                }),
            )
            .join('\r\n');

        download('data-faskes-bpjs.csv', csv);
        emit('faskes-export', L);
        say(L.length + ' data faskes diekspor.');
    };

    // ---- import (CSV) ----
    function parseCSV(t) {
        t = t.replace(/^\uFEFF/, '');

        var first = t.split(/\r?\n/)[0] || '',
            d = [',', ';', '\t'].sort(function (x, y) {
                return first.split(y).length - first.split(x).length;
            })[0];
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

    function norm(h) {
        return h.toLowerCase().replace(/[^a-z]/g, '');
    }

    function doImport(text) {
        var R = parseCSV(text);

        if (R.length < 2) {
            say('File kosong atau format tidak sesuai.');
            return;
        }

        var H = R[0].map(norm),
            idx = {};

        FIELDS.forEach(function (f) {
            idx[f[0]] = H.indexOf(norm(f[1]));
        });

        if (idx.nama < 0) {
            say('Kolom Nama PPK tidak ditemukan di baris pertama.');
            return;
        }

        var add = 0,
            upd = 0,
            skip = 0;

        R.slice(1).forEach(function (r) {
            var v = {};

            FIELDS.forEach(function (f) {
                var x = idx[f[0]] >= 0 ? (r[idx[f[0]]] || '').trim() : '';

                v[f[0]] = UP.indexOf(f[0]) >= 0 ? x.toUpperCase() : x;
            });

            if (!v.nama) {
                skip++;
                return;
            }

            var ex = v.kode
                ? all.filter(function (x) {
                      return x.kode === v.kode;
                  })[0]
                : null;

            if (ex) {
                FIELDS.forEach(function (f) {
                    if (v[f[0]]) {
                        ex[f[0]] = v[f[0]];
                    }
                });
                upd++;
            } else {
                v.id = 'i' + uid++;
                all.push(v);
                add++;
            }
        });

        persist();
        page = 1;
        syncFilters();
        render();
        emit('faskes-import', { ditambah: add, diperbarui: upd, dilewati: skip });
        say(add + ' ditambahkan, ' + upd + ' diperbarui' + (skip ? ', ' + skip + ' dilewati' : '') + '.');
    }

    document.getElementById('imp').onclick = function () {
        open(
            'Import Data Faskes',
            '<p>Unggah file CSV dengan kolom: <b style="color:var(--fg)">' +
                HEAD.join(', ') +
                '</b>. Baris dengan Kode PPK yang sudah ada akan diperbarui. Baris tanpa Nama PPK dilewati, dan baris tanpa Kode PPK tetap ditambahkan serta ditandai.</p><input type="file" id="i-file" accept=".csv,text/csv" hidden>',
            '<button type="button" class="btn" id="i-tpl" style="margin-right:auto">Unduh template</button><button type="button" class="btn" data-close>Batal</button><button type="button" class="btn go" id="i-pick">Pilih file CSV</button>',
        );

        document.getElementById('i-tpl').onclick = function () {
            download(
                'template-data-faskes-bpjs.csv',
                HEAD.join(',') +
                    '\r\nSULAWESI SELATAN,REGIONAL IX - MAKASSAR,PALOPO,KAB. TORAJA UTARA,0508U008,AGNES TJUNGADI (JSP),DIPONEGORO 13,81342594689',
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

    syncFilters();
    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataAdminFaskesBpjs);
} else {
    initDataAdminFaskesBpjs();
}

document.addEventListener('livewire:navigated', initDataAdminFaskesBpjs);
