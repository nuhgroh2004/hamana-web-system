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

    var q = '',
        filt = '1',
        page = 1,
        SIZE = 10,
        all = [],
        meta = {},
        counts = { aktif: 0, tidak_aktif: 0, semua: 0 },
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

    function params() {
        return {
            search: q.trim(),
            status: filt,
            page: page,
            per_page: SIZE,
        };
    }

    function load() {
        return window.axios
            .get('/api/data-pegawai', { params: params() })
            .then(function (res) {
                all = res.data.data || [];
                meta = res.data.meta || {};
                counts = res.data.counts || counts;

                if (meta.last_page && page > meta.last_page) {
                    page = meta.last_page;
                    return load();
                }

                page = meta.current_page || page;
                render();
            })
            .catch(fail);
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
        hapus: '<path d="M2.5 4.5h11M6.5 4.5V2.5h3v2M4.5 4.5l.6 9h5.8l.6-9M6.5 7v4M9.5 7v4"/>',
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
        mn.innerHTML =
            ITEMS.map(function (it) {
                return (
                    '<a role="menuitem" href="' +
                    (ROUTES[it[0]] || '#') +
                    '?nik=' +
                    encodeURIComponent(nik) +
                    '&from=data-pegawai' +
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
            }).join('') +
            '<div class="sep" role="separator"></div>' +
            '<button type="button" role="menuitem" class="dg" data-aksi="hapus" data-nik="' +
            esc(nik) +
            '"><svg class="i" viewBox="0 0 16 16">' +
            IC.hapus +
            '</svg>Hapus Pegawai</button>';
        place(btn, 230);
    }

    // ---- hapus pegawai ----
    function confirmDelete(p) {
        open(
            'Hapus data pegawai?',
            '<p>Pegawai <b>' +
                esc(p.nama) +
                '</b> (' +
                esc(p.nik) +
                ') akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>',
            '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn dgb" id="ok">Hapus</button>',
        );

        document.getElementById('ok').onclick = function () {
            window.axios
                .delete('/api/data-pegawai/' + p.id)
                .then(function () {
                    close();
                    return load();
                })
                .then(function () {
                    emit('pegawai-hapus', p);
                    say('Pegawai ' + p.nama + ' berhasil dihapus.');
                })
                .catch(fail);
        };
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

            closeMenu();

            if (p && a.dataset.aksi === 'hapus') {
                confirmDelete(p);
                return;
            }

            emit('pegawai-aksi', { aksi: a.dataset.aksi, pegawai: p });
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
    function render() {
        document.getElementById('n1').textContent = counts.aktif;
        document.getElementById('n0').textContent = counts.tidak_aktif;
        document.getElementById('nall').textContent = counts.semua;
        root.querySelectorAll('.sc').forEach(function (b) {
            b.classList.toggle('on', b.dataset.f === filt);
        });

        var total = meta.total || 0,
            current = meta.current_page || 1,
            pages = Math.max(1, meta.last_page || 1);

        tb.innerHTML = all
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

        document.getElementById('empty').hidden = total > 0;
        document.getElementById('cnt').textContent = total
            ? 'Menampilkan ' + meta.from + '–' + meta.to + ' dari ' + total + ' pegawai'
            : '0 pegawai';

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

    // ---- filter ----
    dd('st', [['1', 'Aktif'], ['0', 'Tidak Aktif'], ['all', 'Semua']], '1', function (v) {
        filt = v;
        page = 1;
        load();
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
        load();
    });

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

    // ---- export (XLSX) ----
    document.getElementById('exp').onclick = function () {
        var p = new URLSearchParams({ search: q.trim(), status: filt });
        window.location.href = '/api/data-pegawai/export?' + p.toString();
        emit('pegawai-export', params());
        say('Data pegawai sedang diekspor ke Excel.');
    };

    // ---- import (XLSX / CSV) ----
    document.getElementById('imp').onclick = function () {
        open(
            'Import Data Pegawai',
            '<p>Unggah file Excel <b>.xlsx</b> (atau CSV) sesuai template. Baris dengan NIK yang sudah ada akan diperbarui, dan baris tanpa NIK atau Nama Lengkap dilewati.</p>' +
                '<p class="hint">Template memuat seluruh kolom data pegawai, pendidikan, keluarga, dan ciri fisik.</p>' +
                '<input type="file" id="i-file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" hidden>',
            '<button type="button" class="btn" id="i-tpl" style="margin-right:auto">Unduh template XLSX</button><button type="button" class="btn" data-close>Batal</button><button type="button" class="btn go" id="i-pick">Pilih file Excel</button>',
        );

        document.getElementById('i-tpl').onclick = function () {
            window.location.href = '/api/data-pegawai/template';
            say('Template import sedang diunduh.');
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
                .post('/api/data-pegawai/import', body)
                .then(function (res) {
                    var h = res.data.hasil || {};

                    close();
                    page = 1;
                    return load().then(function () {
                        emit('pegawai-import', h);
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
    document.addEventListener('DOMContentLoaded', initDataPegawai);
} else {
    initDataPegawai();
}

document.addEventListener('livewire:navigated', initDataPegawai);
