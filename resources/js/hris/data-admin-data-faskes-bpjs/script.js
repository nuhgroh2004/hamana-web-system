const initializedRoots = new WeakSet();

function initDataAdminFaskesBpjs() {
    const root = document.getElementById('data-admin-data-faskes-bpjs');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    var FIELDS = [
        ['nama_provinsi', 'Nama Provinsi', 1],
        ['kantor_regional', 'Kantor Regional', 0],
        ['kantor_cabang', 'Kantor Cabang', 0],
        ['kabupaten_kota', 'Kabupaten/Kota', 1],
        ['kode_ppk', 'Kode PPK', 0],
        ['nama_ppk', 'Nama PPK', 1],
        ['alamat_ppk', 'Alamat PPK', 0],
        ['telp_ppk', 'Telp PPK', 0],
    ];
    var UP = ['nama_provinsi', 'kantor_regional', 'kantor_cabang', 'kabupaten_kota', 'kode_ppk', 'nama_ppk'];
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

    var SIZE = 10,
        q = '',
        prov = 'all',
        kab = 'all',
        noKode = false,
        page = 1,
        all = [],
        meta = {},
        counts = { total: 0, tanpa_kode: 0 },
        options = { provinsi: [], kabupaten: [] },
        searchTimer = null;

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

    function fail(e) {
        var errors = e && e.response && e.response.data && e.response.data.errors;
        var first = errors ? Object.keys(errors)[0] : null;

        say(first ? errors[first][0] : (e && e.response && e.response.data && e.response.data.message) || 'Data gagal diproses.');
    }

    function emit(n, d) {
        document.dispatchEvent(new CustomEvent(n, { detail: d }));
    }

    function byId(id) {
        return all.filter(function (r) {
            return String(r.id) === String(id);
        })[0];
    }

    function params() {
        return {
            search: q.trim(),
            provinsi: prov === 'all' ? '' : prov,
            kabupaten: kab === 'all' ? '' : kab,
            tanpa_kode: noKode ? 1 : '',
            page: page,
            per_page: SIZE,
        };
    }

    function load() {
        return window.axios
            .get('/api/data-admin/faskes', { params: params() })
            .then(function (res) {
                all = res.data.data || [];
                meta = res.data.meta || {};
                counts = res.data.counts || counts;
                options = res.data.options || { provinsi: [], kabupaten: [] };

                if (meta.last_page && page > meta.last_page) {
                    page = meta.last_page;
                    return load();
                }

                page = meta.current_page || page;
                syncFilters();
                render();
            })
            .catch(fail);
    }

    // ---- dropdown kustom ----
    var DD = {},
        CK = '<svg class="i ck" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>',
        curBtn = null,
        curDD = null,
        curAct = null;

    function paint(id) {
        var d = DD[id];

        if (!d) {
            return;
        }

        var o = d.opts.filter(function (x) {
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
        if (prov !== 'all' && options.provinsi.indexOf(prov) < 0) {
            prov = 'all';
        }

        DD.prov = {
            opts: opts(options.provinsi),
            val: prov,
            cb: function (v) {
                prov = v;
                kab = 'all';
                page = 1;
                load();
            },
        };

        if (kab !== 'all' && options.kabupaten.indexOf(kab) < 0) {
            kab = 'all';
        }

        DD.kab = {
            opts: opts(options.kabupaten),
            val: kab,
            cb: function (v) {
                kab = v;
                page = 1;
                load();
            },
        };

        paint('prov');
        paint('kab');
    }

    // ---- render ----
    function render() {
        document.getElementById('nall').textContent = counts.total || 0;
        document.getElementById('nno').textContent = counts.tanpa_kode || 0;
        root.querySelectorAll('.sc').forEach(function (b) {
            b.classList.toggle('on', b.dataset.s === 'nokode' && noKode);
        });

        var total = meta.total || 0,
            current = meta.current_page || 1,
            pages = Math.max(1, meta.last_page || 1),
            from = meta.from || 0;

        tb.innerHTML = all
            .map(function (r) {
                return (
                    '<tr><td class="c1"><button type="button" class="btn sm" data-act="' +
                    r.id +
                    '" aria-haspopup="menu">Aksi<svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg></button></td>' +
                    '<td>' +
                    esc(r.nama_provinsi) +
                    '</td><td>' +
                    esc(r.kantor_regional) +
                    '</td><td>' +
                    esc(r.kantor_cabang) +
                    '</td><td>' +
                    esc(r.kabupaten_kota) +
                    '</td>' +
                    '<td class="nw">' +
                    (r.kode_ppk ? esc(r.kode_ppk) : '<span class="bdg">Belum ada</span>') +
                    '</td><td class="nm">' +
                    esc(r.nama_ppk) +
                    '</td><td>' +
                    esc(r.alamat_ppk) +
                    '</td><td class="nw">' +
                    esc(r.telp_ppk) +
                    '</td></tr>'
                );
            })
            .join('');

        document.getElementById('empty').hidden = total > 0;
        document.getElementById('cnt').textContent = total
            ? 'Menampilkan ' + meta.from + '–' + meta.to + ' dari ' + total + ' faskes'
            : '0 faskes';

        var h =
                '<button type="button" data-p="' +
                (current - 1) +
                '"' +
                (current <= 1 ? ' disabled' : '') +
                '>Previous</button>',
            last = 0;

        for (var n = 1; n <= pages; n++) {
            if (!(n === 1 || n === pages || Math.abs(n - current) <= 1)) {
                continue;
            }

            if (last && n - last > 1) {
                h += '<span>…</span>';
            }

            h +=
                '<button type="button" data-p="' +
                n +
                '"' +
                (n === current ? ' class="on" aria-current="page"' : '') +
                '>' +
                n +
                '</button>';
            last = n;
        }

        h +=
            '<button type="button" data-p="' +
            (current + 1) +
            '"' +
            (current >= pages ? ' disabled' : '') +
            '>Next</button>';

        document.getElementById('pn').innerHTML = h;
    }

    // ---- filter & pencarian ----
    document.getElementById('q').addEventListener('input', function () {
        q = this.value;
        page = 1;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(load, 300);
    });

    document.getElementById('pn').addEventListener('click', function (e) {
        var b = e.target.closest('[data-p]');

        if (b && !b.disabled) {
            page = +b.dataset.p;
            load();
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
        }

        page = 1;
        load();
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
            var wide = f[0] === 'alamat_ppk' ? ' wide' : '';

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

    function validate(v) {
        var first = null;

        FIELDS.forEach(function (f) {
            var m = f[2] && !v[f[0]] ? f[1] + ' wajib diisi.' : '';

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

    function showErrors(e) {
        var errors = e && e.response && e.response.data && e.response.data.errors;

        if (!errors) {
            fail(e);
            return;
        }

        var first = null;

        Object.keys(errors).forEach(function (key) {
            var field = document.getElementById('f-' + key),
                box = document.getElementById('e-' + key);

            if (box) {
                box.textContent = errors[key][0];
            }

            if (field) {
                field.classList.add('bad');

                if (!first) {
                    first = field;
                }
            }
        });

        if (first) {
            first.focus();
        } else {
            fail(e);
        }
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
        document.getElementById('f-nama_provinsi').focus();
        document.getElementById('sv').onclick = function () {
            var v = read();

            if (!validate(v)) {
                return;
            }

            window.axios
                .post('/api/data-admin/faskes', v)
                .then(function (res) {
                    close();
                    noKode = false;
                    q = '';
                    document.getElementById('q').value = '';
                    prov = 'all';
                    kab = 'all';
                    page = 1;
                    return load().then(function () {
                        emit('faskes-tambah', res.data.data);
                        say('Data faskes berhasil ditambahkan.');
                    });
                })
                .catch(showErrors);
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
        document.getElementById('f-nama_ppk').focus();
        document.getElementById('sv').onclick = function () {
            var v = read();

            if (!validate(v)) {
                return;
            }

            window.axios
                .put('/api/data-admin/faskes/' + r.id, v)
                .then(function (res) {
                    close();
                    return load().then(function () {
                        emit('faskes-edit', res.data.data);
                        say('Data faskes berhasil diperbarui.');
                    });
                })
                .catch(showErrors);
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
                esc(d.nama_ppk) +
                '</b>' +
                (d.kode_ppk ? ' (' + esc(d.kode_ppk) + ')' : '') +
                ' akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>',
            '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn dgb" id="ok">Hapus</button>',
        );
        document.getElementById('ok').onclick = function () {
            window.axios
                .delete('/api/data-admin/faskes/' + d.id)
                .then(function () {
                    close();
                    return load().then(function () {
                        emit('faskes-hapus', d);
                        say('Data faskes berhasil dihapus.');
                    });
                })
                .catch(fail);
        };
    }

    // ---- export (CSV) ----
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
        var p = new URLSearchParams();

        if (q.trim()) {
            p.set('search', q.trim());
        }

        if (prov !== 'all') {
            p.set('provinsi', prov);
        }

        if (kab !== 'all') {
            p.set('kabupaten', kab);
        }

        if (noKode) {
            p.set('tanpa_kode', '1');
        }

        window.location.href = '/api/data-admin/faskes/export?' + p.toString();
        emit('faskes-export', params());
        say('Data faskes sedang diekspor.');
    };

    // ---- import (CSV) ----
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

            var body = new FormData();
            body.append('file', f);

            window.axios
                .post('/api/data-admin/faskes/import', body)
                .then(function (res) {
                    var h = res.data.hasil || {};

                    close();
                    page = 1;
                    return load().then(function () {
                        emit('faskes-import', h);
                        say(
                            (h.ditambah || 0) +
                                ' ditambahkan, ' +
                                (h.diperbarui || 0) +
                                ' diperbarui' +
                                (h.dilewati ? ', ' + h.dilewati + ' dilewati' : '') +
                                '.',
                        );
                    });
                })
                .catch(fail);
        };
    };

    load();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataAdminFaskesBpjs);
} else {
    initDataAdminFaskesBpjs();
}

document.addEventListener('livewire:navigated', initDataAdminFaskesBpjs);
