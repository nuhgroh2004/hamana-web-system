const initializedRoots = new WeakSet();

function initDataAdminListAdmin() {
    const root = document.getElementById('data-admin-list-admin');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    // Data contoh (ganti dengan data dari server)
    var SEED = [
        { id: 'a1', username: 'admin.utama', nama: 'Budi Santoso', nik: '1026.29.01.04', akun: true, kary: true },
        { id: 'a2', username: 'siti.rahma', nama: 'Siti Rahmawati', nik: '1026.29.01.05', akun: true, kary: true },
        { id: 'a3', username: 'andi.pratama', nama: 'Andi Pratama', nik: '1027.30.02.11', akun: false, kary: false },
    ];
    var KEY = 'user-admin-v2',
        SIZE = 10,
        page = 1,
        q = '',
        uid = Date.now(),
        all = SEED,
        curBtn = null,
        curId = null;

    try {
        var sv = JSON.parse(localStorage.getItem(KEY));

        if (sv && sv.length) {
            all = sv;
        }
    } catch (e) {
        // abaikan data lokal yang rusak
    }

    function persist() {
        try {
            localStorage.setItem(KEY, JSON.stringify(all));
        } catch (e) {
            // abaikan bila penyimpanan lokal penuh
        }
    }

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
            return !s || r.username.toLowerCase().indexOf(s) >= 0 || r.nama.toLowerCase().indexOf(s) >= 0;
        });
    }

    function bdg(on) {
        return '<span class="bdg ' + (on ? 'ok' : 'off') + '">' + (on ? 'Aktif' : 'Tidak Aktif') + '</span>';
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
                    '<tr><td class="c1"><button type="button" class="btn sm" data-act="' +
                    r.id +
                    '" aria-haspopup="menu">Aksi<svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg></button></td>' +
                    '<td class="un">' +
                    esc(r.username) +
                    '</td><td class="nw">' +
                    esc(r.nik) +
                    '</td><td>' +
                    esc(r.nama) +
                    '</td><td>' +
                    bdg(r.akun) +
                    '</td><td>' +
                    bdg(r.kary) +
                    '</td></tr>'
                );
            })
            .join('');

        $('empty').hidden = L.length > 0;
        $('cnt').textContent = L.length
            ? 'Menampilkan ' + (from + 1) + '–' + (from + rows.length) + ' dari ' + L.length + ' akun'
            : '0 akun';

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
        r = r || { akun: true, kary: true };

        return (
            inp('username', 'Username', r.username, { req: 1 }) +
            inp('nik', 'NIK Pemegang Akses', r.nik, { req: 1, hint: 'Contoh: 1026.29.01.04' }) +
            inp('nama', 'Nama Pemegang Akses', r.nama, { req: 1 }) +
            inp('password', 'Password', '', {
                req: isNew,
                type: 'password',
                ac: 'new-password',
                hint: isNew ? 'Minimal 8 karakter.' : 'Kosongkan jika tidak diubah.',
            }) +
            sel('akun', 'Status Akun Admin', r.akun) +
            sel('kary', 'Status Karyawan', r.kary)
        );
    }

    function read() {
        return {
            nik: $('f-nik').value.trim(),
            nama: $('f-nama').value.trim(),
            username: $('f-username').value.trim().toLowerCase(),
            password: $('f-password').value,
            akun: $('f-akun').value === '1',
            kary: $('f-kary').value === '1',
        };
    }

    function validate(v, self, isNew) {
        var E = {};

        if (!v.nik) {
            E.nik = 'NIK wajib diisi.';
        } else if (!/^\d+(\.\d+)*$/.test(v.nik)) {
            E.nik = 'NIK hanya boleh angka dan titik, contoh 1026.29.01.04.';
        } else if (
            all.some(function (r) {
                return r.nik === v.nik && r !== self;
            })
        ) {
            E.nik = 'NIK sudah terdaftar.';
        }

        if (!v.nama) {
            E.nama = 'Nama wajib diisi.';
        }

        if (!v.username) {
            E.username = 'Username wajib diisi.';
        } else if (!/^[a-z0-9._-]{3,}$/.test(v.username)) {
            E.username = 'Minimal 3 karakter: huruf, angka, titik, minus, atau garis bawah.';
        } else if (
            all.some(function (r) {
                return r.username === v.username && r !== self;
            })
        ) {
            E.username = 'Username sudah digunakan.';
        }

        if (isNew && !v.password) {
            E.password = 'Password wajib diisi.';
        } else if (v.password && v.password.length < 8) {
            E.password = 'Password minimal 8 karakter.';
        }

        var first = null;

        ['username', 'nik', 'nama', 'password'].forEach(function (k) {
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

    var SAVE = '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn go" id="sv">Simpan</button>';

    $('add').onclick = function () {
        open('Tambah Akun Admin', form(null, true), SAVE, 'w', 'g2');
        $('f-username').focus();
        $('sv').onclick = function () {
            var v = read();

            if (!validate(v, null, true)) {
                return;
            }

            var r = { id: 'n' + uid++, nik: v.nik, nama: v.nama, username: v.username, akun: v.akun, kary: v.kary };

            all.push(r);
            persist();
            q = '';
            $('q').value = '';
            close();
            page = Math.ceil(all.length / SIZE);
            render();
            emit('admin-tambah', v);
            say('Akun admin berhasil ditambahkan.');
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

            if (!validate(v, r, false)) {
                return;
            }

            r.nik = v.nik;
            r.nama = v.nama;
            r.username = v.username;
            r.akun = v.akun;
            r.kary = v.kary;
            persist();
            close();
            render();
            emit('admin-edit', {
                id: r.id,
                nik: v.nik,
                nama: v.nama,
                username: v.username,
                akun: v.akun,
                kary: v.kary,
                password: v.password || null,
            });
            say('Akun admin berhasil diperbarui.');
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
                esc(d.username) +
                '</b> (' +
                esc(d.nama) +
                ') akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>',
            '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn dgb" id="ok">Hapus</button>',
        );
        $('ok').onclick = function () {
            all = all.filter(function (x) {
                return x !== d;
            });
            persist();
            close();
            render();
            emit('admin-hapus', d);
            say('Akun admin berhasil dihapus.');
        };
    }

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataAdminListAdmin);
} else {
    initDataAdminListAdmin();
}

document.addEventListener('livewire:navigated', initDataAdminListAdmin);
