const initializedRoots = new WeakSet();

function initDataAdminListAdmin() {
    const root = document.getElementById('data-admin-list-admin');

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
            .get('/api/data-admin/admin', {
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

    function bdg(on) {
        return '<span class="bdg ' + (on ? 'ok' : 'off') + '">' + (on ? 'Aktif' : 'Tidak Aktif') + '</span>';
    }

    function render() {
        var total = meta.total || 0,
            current = meta.current_page || 1,
            pages = Math.max(1, meta.last_page || 1);

        tb.innerHTML = all
            .map(function (r) {
                return (
                    '<tr><td class="c1"><button type="button" class="btn sm" data-act="' +
                    r.id +
                    '" aria-haspopup="menu">Aksi<svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg></button></td>' +
                    '<td class="un">' +
                    esc(r.email) +
                    '</td><td class="nw">' +
                    esc(r.nik) +
                    '</td><td>' +
                    esc(r.nama) +
                    '</td><td>' +
                    bdg(r.aktif) +
                    '</td><td>' +
                    bdg(r.karyawan_aktif) +
                    '</td></tr>'
                );
            })
            .join('');

        $('empty').hidden = total > 0;
        $('cnt').textContent = total
            ? 'Menampilkan ' + meta.from + '–' + meta.to + ' dari ' + total + ' akun'
            : '0 akun';

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

    function sel(id, label, on) {
        return (
            '<div class="f"><label for="f-' +
            id +
            '">' +
            label +
            '</label><select class="fld" id="f-' +
            id +
            '"><option value="1"' +
            (on ? ' selected' : '') +
            '>Aktif</option><option value="0"' +
            (on ? '' : ' selected') +
            '>Tidak Aktif</option></select></div>'
        );
    }

    function inp(id, label, val, o) {
        o = o || {};

        return (
            '<div class="f' +
            (o.wide ? ' wide' : '') +
            '"><label for="f-' +
            id +
            '">' +
            label +
            (o.req ? ' <span class="rq">*</span>' : '') +
            '</label><input class="fld" id="f-' +
            id +
            '" type="' +
            (o.type || 'text') +
            '" autocomplete="' +
            (o.ac || 'off') +
            '" value="' +
            esc(val) +
            '">' +
            (o.hint ? '<p class="hint">' + o.hint + '</p>' : '') +
            '<p class="er" id="e-' +
            id +
            '"></p></div>'
        );
    }

    function form(r, isNew) {
        r = r || { aktif: true, karyawan_aktif: true };

        return (
            inp('email', 'Username (Email)', r.email, { req: 1, type: 'email' }) +
            inp('nik', 'NIK Pemegang Akses', r.nik, { req: 1, hint: 'Contoh: 1026.29.01.04' }) +
            inp('nama', 'Nama Pemegang Akses', r.nama, { req: 1 }) +
            inp('password', 'Password', '', {
                req: isNew,
                type: 'password',
                ac: 'new-password',
                hint: isNew ? 'Minimal 6 karakter.' : 'Kosongkan jika tidak diubah.',
            }) +
            sel('aktif', 'Status Akun Admin', r.aktif) +
            sel('karyawan_aktif', 'Status Karyawan', r.karyawan_aktif)
        );
    }

    function read() {
        return {
            email: $('f-email').value.trim().toLowerCase(),
            nik: $('f-nik').value.trim(),
            nama: $('f-nama').value.trim(),
            password: $('f-password').value,
            aktif: $('f-aktif').value === '1',
            karyawan_aktif: $('f-karyawan_aktif').value === '1',
        };
    }

    function validate(v, isNew) {
        var E = {};

        if (!v.email) {
            E.email = 'Username wajib diisi.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
            E.email = 'Format email tidak valid.';
        }

        if (!v.nik) {
            E.nik = 'NIK wajib diisi.';
        } else if (!/^\d+(\.\d+)*$/.test(v.nik)) {
            E.nik = 'NIK hanya boleh angka dan titik, contoh 1026.29.01.04.';
        }

        if (!v.nama) {
            E.nama = 'Nama wajib diisi.';
        }

        if (isNew && !v.password) {
            E.password = 'Password wajib diisi.';
        } else if (v.password && v.password.length < 6) {
            E.password = 'Password minimal 6 karakter.';
        }

        var first = null;

        ['email', 'nik', 'nama', 'password'].forEach(function (k) {
            $('e-' + k).textContent = E[k] || '';
            $('f-' + k).classList.toggle('bad', !!E[k]);

            if (E[k] && !first) {
                first = 'f-' + k;
            }
        });

        if (first) {
            $(first).focus();
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

    var SAVE = '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn go" id="sv">Simpan</button>';

    $('add').onclick = function () {
        open('Tambah Akun Admin', form(null, true), SAVE, 'w', 'g2');
        $('f-email').focus();
        $('sv').onclick = function () {
            var v = read();

            if (!validate(v, true)) {
                return;
            }

            window.axios
                .post('/api/data-admin/admin', v)
                .then(function (res) {
                    close();
                    q = '';
                    $('q').value = '';
                    page = 1;
                    return load().then(function () {
                        emit('admin-tambah', res.data.data);
                        say('Akun admin berhasil ditambahkan.');
                    });
                })
                .catch(showErrors);
        };
    };

    function editRow(id) {
        var r = byId(id);

        if (!r) {
            return;
        }

        open('Edit Akun Admin', form(r, false), SAVE, 'w', 'g2');
        $('f-nama').focus();
        $('sv').onclick = function () {
            var v = read();

            if (!validate(v, false)) {
                return;
            }

            window.axios
                .put('/api/data-admin/admin/' + r.id, v)
                .then(function (res) {
                    close();
                    return load().then(function () {
                        emit('admin-edit', res.data.data);
                        say('Akun admin berhasil diperbarui.');
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
            'Hapus akun admin?',
            '<p>Akun <b style="color:var(--fg)">' +
                esc(d.email) +
                '</b> (' +
                esc(d.nama) +
                ') akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>',
            '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn dgb" id="ok">Hapus</button>',
        );
        $('ok').onclick = function () {
            window.axios
                .delete('/api/data-admin/admin/' + d.id)
                .then(function () {
                    close();
                    return load().then(function () {
                        emit('admin-hapus', d);
                        say('Akun admin berhasil dihapus.');
                    });
                })
                .catch(fail);
        };
    }

    load();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataAdminListAdmin);
} else {
    initDataAdminListAdmin();
}

document.addEventListener('livewire:navigated', initDataAdminListAdmin);
