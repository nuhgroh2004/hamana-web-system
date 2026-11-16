const initializedRoots = new WeakSet();

function initListSatpam() {
    const root = document.getElementById('list-satpam');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    // Data contoh (ganti dengan data dari server)
    var SEED = [
        { id: 's1', email: 'joko.susilo@contoh.id', nama: 'Joko Susilo', aktif: true },
        { id: 's2', email: 'slamet.riyadi@contoh.id', nama: 'Slamet Riyadi', aktif: true },
        { id: 's3', email: 'eko.prasetyo@contoh.id', nama: 'Eko Prasetyo', aktif: false },
    ];
    var KEY = 'user-satpam-v1',
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
            return root.querySelector('#' + id);
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
            return !s || r.email.toLowerCase().indexOf(s) >= 0 || r.nama.toLowerCase().indexOf(s) >= 0;
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
                    '<tr><td class="ak c1"><button type="button" class="btn sm" data-act="' +
                    r.id +
                    '" aria-haspopup="menu">Aksi<svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg></button></td>' +
                    '<td class="un em">' +
                    esc(r.email) +
                    '</td><td class="nm">' +
                    esc(r.nama) +
                    '</td><td class="st">' +
                    bdg(r.aktif) +
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
            w = Math.max(mn.offsetWidth, r.width),
            top = r.bottom + 4;

        mn.style.width = w + 'px';

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

    var EYE = '<svg class="i" viewBox="0 0 16 16"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>',
        EYX = '<svg class="i" viewBox="0 0 16 16"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8zM3 3l10 10"/></svg>';

    ov.addEventListener('click', function (e) {
        if (e.target === ov || e.target.closest('[data-close]')) {
            close();
            return;
        }

        var t = e.target.closest('.pwt');

        if (t) {
            var i = t.previousElementSibling,
                show = i.type === 'password';

            i.type = show ? 'text' : 'password';
            t.innerHTML = show ? EYX : EYE;
            t.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password');
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

        var field =
            '<input class="fld" id="f-' +
            id +
            '" type="' +
            (o.type || 'text') +
            '" autocomplete="' +
            (o.ac || 'off') +
            '" value="' +
            esc(val) +
            '">';

        if (o.pw) {
            field = '<div class="pw">' + field + '<button type="button" class="pwt" aria-label="Tampilkan password">' + EYE + '</button></div>';
        }

        return (
            '<div class="f' +
            (o.wide ? ' wide' : '') +
            '"><label for="f-' +
            id +
            '">' +
            label +
            (o.req ? ' <span class="rq">*</span>' : '') +
            '</label>' +
            field +
            (o.hint ? '<p class="hint">' + o.hint + '</p>' : '') +
            '<p class="er" id="e-' +
            id +
            '"></p></div>'
        );
    }

    function form(r, isNew) {
        r = r || { aktif: true };

        return (
            inp('email', 'Email', r.email, { req: 1, type: 'email', ac: 'off' }) +
            inp('nama', 'Nama', r.nama, { req: 1 }) +
            inp('password', 'Password', '', {
                req: isNew,
                pw: 1,
                type: 'password',
                ac: 'new-password',
                hint: isNew ? 'Minimal 8 karakter.' : 'Kosongkan jika tidak diubah.',
            }) +
            sel('akun', 'Status', r.aktif)
        );
    }

    function read() {
        return {
            email: $('f-email').value.trim().toLowerCase(),
            nama: $('f-nama').value.trim(),
            password: $('f-password').value,
            aktif: $('f-akun').value === '1',
        };
    }

    function validate(v, self, isNew) {
        var E = {};

        if (!v.email) {
            E.email = 'Email wajib diisi.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
            E.email = 'Format email tidak valid.';
        } else if (
            all.some(function (r) {
                return r.email === v.email && r !== self;
            })
        ) {
            E.email = 'Email sudah digunakan.';
        }

        if (!v.nama) {
            E.nama = 'Nama wajib diisi.';
        }

        if (isNew && !v.password) {
            E.password = 'Password wajib diisi.';
        } else if (v.password && v.password.length < 8) {
            E.password = 'Password minimal 8 karakter.';
        }

        var first = null;

        ['email', 'nama', 'password'].forEach(function (k) {
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
        open('Tambah Akun Satpam', form(null, true), SAVE, 'w', 'g2');
        $('f-email').focus();
        $('sv').onclick = function () {
            var v = read();

            if (!validate(v, null, true)) {
                return;
            }

            all.push({ id: 'n' + uid++, email: v.email, nama: v.nama, aktif: v.aktif });
            persist();
            q = '';
            $('q').value = '';
            close();
            page = Math.ceil(all.length / SIZE);
            render();
            emit('satpam-tambah', v);
            say('Akun satpam berhasil ditambahkan.');
        };
    };

    function editRow(id) {
        var r = byId(id);

        if (!r) {
            return;
        }

        open('Edit Akun Satpam', form(r, false), SAVE, 'w', 'g2');
        $('f-nama').focus();
        $('sv').onclick = function () {
            var v = read();

            if (!validate(v, r, false)) {
                return;
            }

            r.email = v.email;
            r.nama = v.nama;
            r.aktif = v.aktif;
            persist();
            close();
            render();
            emit('satpam-edit', {
                id: r.id,
                email: v.email,
                nama: v.nama,
                aktif: v.aktif,
                password: v.password || null,
            });
            say('Akun satpam berhasil diperbarui.');
        };
    }

    function delRow(id) {
        var d = byId(id);

        if (!d) {
            return;
        }

        open(
            'Hapus akun satpam?',
            '<p>Akun <b style="color:var(--fg)">' +
                esc(d.nama) +
                '</b> (' +
                esc(d.email) +
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
            emit('satpam-hapus', d);
            say('Akun satpam berhasil dihapus.');
        };
    }

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListSatpam);
} else {
    initListSatpam();
}

document.addEventListener('livewire:navigated', initListSatpam);
