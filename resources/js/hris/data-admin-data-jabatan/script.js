const initializedRoots = new WeakSet();

function initDataAdminJabatan() {
    const root = document.getElementById('data-admin-data-jabatan');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    // Data awal (ganti dengan data dari server)
    var SEED = ['Intern', 'Driver', 'Assistant General Manager', 'General Manager', 'Operator', 'Officer', 'Leader', 'Head', 'Foreman', 'Supervisor'].map(
        function (n, i) {
            return { id: 'j' + (i + 1), nama: n };
        },
    );
    var KEY = 'data-jabatan-v1',
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
            return !s || r.nama.toLowerCase().indexOf(s) >= 0;
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
            .map(function (r, i) {
                return (
                    '<tr><td class="c1"><button type="button" class="btn sm" data-act="' +
                    r.id +
                    '" aria-haspopup="menu">Aksi<svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg></button></td>' +
                    '<td class="c2">' +
                    (from + i + 1) +
                    '</td><td>' +
                    esc(r.nama) +
                    '</td></tr>'
                );
            })
            .join('');

        $('empty').hidden = L.length > 0;
        $('cnt').textContent = L.length
            ? 'Menampilkan ' + (from + 1) + '–' + (from + rows.length) + ' dari ' + L.length + ' jabatan'
            : '0 jabatan';

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
            '<div class="f"><label for="f-nama">Jabatan <span class="rq">*</span></label><input class="fld" id="f-nama" autocomplete="off" value="' +
            esc(r ? r.nama : '') +
            '"><p class="er" id="e-nama"></p></div>'
        );
    }

    function validate(v, self) {
        var m = '';

        if (!v) {
            m = 'Jabatan wajib diisi.';
        } else if (
            all.some(function (r) {
                return r !== self && r.nama.toLowerCase() === v.toLowerCase();
            })
        ) {
            m = 'Jabatan sudah ada.';
        }

        $('e-nama').textContent = m;
        $('f-nama').classList.toggle('bad', !!m);

        if (m) {
            $('f-nama').focus();
        }

        return !m;
    }

    var SAVE = '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn go" id="sv">Simpan</button>';

    function bindEnter() {
        $('f-nama').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                $('sv').click();
            }
        });
    }

    $('add').onclick = function () {
        open('Tambah Data Jabatan', form(), SAVE);
        $('f-nama').focus();
        bindEnter();
        $('sv').onclick = function () {
            var v = $('f-nama').value.trim();

            if (!validate(v, null)) {
                return;
            }

            var r = { id: 'n' + uid++, nama: v };

            all.push(r);
            persist();
            q = '';
            $('q').value = '';
            close();
            page = Math.ceil(all.length / SIZE);
            render();
            emit('jabatan-tambah', r);
            say('Data jabatan berhasil ditambahkan.');
        };
    };

    function editRow(id) {
        var r = byId(id);

        if (!r) {
            return;
        }

        open('Edit Data Jabatan', form(r), SAVE);
        $('f-nama').focus();
        bindEnter();
        $('sv').onclick = function () {
            var v = $('f-nama').value.trim();

            if (!validate(v, r)) {
                return;
            }

            r.nama = v;
            persist();
            close();
            render();
            emit('jabatan-edit', r);
            say('Data jabatan berhasil diperbarui.');
        };
    }

    function delRow(id) {
        var d = byId(id);

        if (!d) {
            return;
        }

        open(
            'Hapus data jabatan?',
            '<p>Jabatan <b style="color:var(--fg)">' +
                esc(d.nama) +
                '</b> akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>',
            '<button type="button" class="btn" data-close>Batal</button><button type="button" class="btn dgb" id="ok">Hapus</button>',
        );
        $('ok').onclick = function () {
            all = all.filter(function (x) {
                return x !== d;
            });
            persist();
            close();
            render();
            emit('jabatan-hapus', d);
            say('Data jabatan berhasil dihapus.');
        };
    }

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataAdminJabatan);
} else {
    initDataAdminJabatan();
}

document.addEventListener('livewire:navigated', initDataAdminJabatan);
