const initializedRoots = new WeakSet();

function initDataAdminTingkat() {
    const root = document.getElementById('data-admin-data-tingkat');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    var SIZE = 10,
        q = '',
        page = 1,
        all = [],
        meta = {},
        searchTimer = null,
        curBtn = null,
        curId = null;

    var $ = function (id) {
            return document.getElementById(id);
        },
        tb = $('tb'),
        mn = $('mn'),
        ov = $('ov'),
        toast = $('toast');

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

    function load() {
        return window.axios
            .get('/api/data-admin/tingkat', {
                params: { search: q.trim(), page: page, per_page: SIZE },
            })
            .then(function (res) {
                all = res.data.data || [];
                meta = res.data.meta || {};

                if (meta.last_page && page > meta.last_page) {
                    page = meta.last_page;
                    return load();
                }

                page = meta.current_page || page;
                render();
            })
            .catch(fail);
    }

    function render() {
        var total = meta.total || 0,
            current = meta.current_page || 1,
            pages = Math.max(1, meta.last_page || 1),
            from = meta.from || 0;

        tb.innerHTML = all
            .map(function (r, i) {
                return (
                    '<tr><td class="c1"><button type="button" class="btn sm" data-act="' +
                    r.id +
                    '" aria-haspopup="menu">Aksi<svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg></button></td>' +
                    '<td class="c2">' +
                    (from + i) +
                    '</td><td>' +
                    esc(r.nama) +
                    '</td></tr>'
                );
            })
            .join('');

        $('empty').hidden = total > 0;
        $('cnt').textContent = total
            ? 'Menampilkan ' + meta.from + '–' + meta.to + ' dari ' + total + ' tingkat'
            : '0 tingkat';

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

        $('pn').innerHTML = h;
    }

    $('q').addEventListener('input', function () {
        q = this.value;
        page = 1;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(load, 300);
    });

    $('pn').addEventListener('click', function (e) {
        var b = e.target.closest('[data-p]');

        if (b && !b.disabled) {
            page = +b.dataset.p;
            load();
        }
    });

    // ---- dropdown aksi ----
    var PEN = '<svg class="i" viewBox="0 0 16 16"><path d="M11 2.5l2.5 2.5L5.5 13H3v-2.5L11 2.5z"/></svg>',
        TRS = '<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5"/></svg>';

    function closeMenu() {
        mn.hidden = true;
        curBtn = null;
        curId = null;
    }

    function openAct(btn) {
        mn.innerHTML =
            '<button type="button" role="menuitem" data-do="edit">' +
            PEN +
            'Edit</button><button type="button" role="menuitem" class="dg" data-do="del">' +
            TRS +
            'Hapus</button>';
        mn.hidden = false;

        var r = btn.getBoundingClientRect(),
            h = mn.offsetHeight,
            w = mn.offsetWidth,
            top = r.bottom + 4;

        if (top + h > innerHeight - 8) {
            top = Math.max(8, r.top - h - 4);
        }

        mn.style.top = top + 'px';
        mn.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + 'px';
        curBtn = btn;
        curId = btn.dataset.act;
    }

    document.addEventListener('click', function (e) {
        if (!root.isConnected) {
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

        if (!k || !curId) {
            return;
        }

        var id = curId,
            w = k.dataset.do;

        closeMenu();

        if (w === 'edit') {
            editRow(id);
        } else {
            delRow(id);
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
        return (
            '<div class="f"><label for="f-nama">Tingkat <span class="rq">*</span></label><input class="fld" id="f-nama" autocomplete="off" value="' +
            esc(r ? r.nama : '') +
            '"><p class="er" id="e-nama"></p></div>'
        );
    }

    function validate(v) {
        var m = v ? '' : 'Tingkat wajib diisi.';

        $('e-nama').textContent = m;
        $('f-nama').classList.toggle('bad', !!m);

        if (m) {
            $('f-nama').focus();
        }

        return !m;
    }

    function bindEnter() {
        $('f-nama').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                $('sv').click();
            }
        });
    }

    var SAVE = '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn go" id="sv">Simpan</button>';

    $('add').onclick = function () {
        open('Tambah Data Tingkat', form(), SAVE);
        $('f-nama').focus();
        bindEnter();
        $('sv').onclick = function () {
            var v = $('f-nama').value.trim();

            if (!validate(v)) {
                return;
            }

            window.axios
                .post('/api/data-admin/tingkat', { nama: v })
                .then(function (res) {
                    close();
                    q = '';
                    $('q').value = '';
                    page = 1;
                    return load().then(function () {
                        emit('tingkat-tambah', res.data.data);
                        say('Data tingkat berhasil ditambahkan.');
                    });
                })
                .catch(function (e) {
                    var errors = e && e.response && e.response.data && e.response.data.errors;

                    if (errors && errors.nama) {
                        $('e-nama').textContent = errors.nama[0];
                        $('f-nama').classList.add('bad');
                        $('f-nama').focus();
                        return;
                    }

                    fail(e);
                });
        };
    };

    function editRow(id) {
        var r = byId(id);

        if (!r) {
            return;
        }

        open('Edit Data Tingkat', form(r), SAVE);
        $('f-nama').focus();
        bindEnter();
        $('sv').onclick = function () {
            var v = $('f-nama').value.trim();

            if (!validate(v)) {
                return;
            }

            window.axios
                .put('/api/data-admin/tingkat/' + r.id, { nama: v })
                .then(function (res) {
                    close();
                    return load().then(function () {
                        emit('tingkat-edit', res.data.data);
                        say('Data tingkat berhasil diperbarui.');
                    });
                })
                .catch(function (e) {
                    var errors = e && e.response && e.response.data && e.response.data.errors;

                    if (errors && errors.nama) {
                        $('e-nama').textContent = errors.nama[0];
                        $('f-nama').classList.add('bad');
                        $('f-nama').focus();
                        return;
                    }

                    fail(e);
                });
        };
    }

    function delRow(id) {
        var d = byId(id);

        if (!d) {
            return;
        }

        open(
            'Hapus data tingkat?',
            '<p>Tingkat <b style="color:var(--fg)">' +
                esc(d.nama) +
                '</b> akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>',
            '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn dgb" id="ok">Hapus</button>',
        );
        $('ok').onclick = function () {
            window.axios
                .delete('/api/data-admin/tingkat/' + d.id)
                .then(function () {
                    close();
                    return load().then(function () {
                        emit('tingkat-hapus', d);
                        say('Data tingkat berhasil dihapus.');
                    });
                })
                .catch(fail);
        };
    }

    load();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataAdminTingkat);
} else {
    initDataAdminTingkat();
}

document.addEventListener('livewire:navigated', initDataAdminTingkat);
