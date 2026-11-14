const bukuHamanaRoots = new WeakSet();

function initBukuHamana() {
    const root = document.getElementById('buku-hamana');

    if (!root || bukuHamanaRoots.has(root)) {
        return;
    }

    bukuHamanaRoots.add(root);

    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        LIM = 10 * 1048576;
    var $ = function (id) {
        return root.querySelector('#' + id);
    };

    function esc(v) {
        return String(v == null ? '' : v)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    function sz(n) {
        return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
    }

    function fmt(s) {
        var p = s.slice(0, 10).split('-');

        return +p[2] + ' ' + MON[p[1] - 1] + ' ' + p[0];
    }

    function emit(n, d) {
        document.dispatchEvent(new CustomEvent(n, { detail: d }));
    }

    function S(d) {
        return '<svg class="i" viewBox="0 0 16 16">' + d + '</svg>';
    }

    var I = {
        pdf: '<svg class="i pdf" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M9.5 1.5v3h3M5.5 9h5M5.5 11.5h5"/></svg>',
        img: S(
            '<rect x="2" y="2.5" width="12" height="11" rx="1.5"/><circle cx="6" cy="6.3" r="1.2"/><path d="M2.5 12l3.5-3.5 3 3 2-2 2.5 2.5"/>',
        ),
        eye: S(
            '<path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/>',
        ),
        pen: S('<path d="M11 2.5l2.5 2.5L5.5 13H3v-2.5L11 2.5z"/>'),
        trash: S('<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5"/>'),
        up: S('<path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v3h11v-3"/>'),
        plus: S('<path d="M8 3v10M3 8h10"/>'),
        open: S('<path d="M9 2.5h4.5V7M13.5 2.5L7.5 8.5M12 9.5v4H2.5V4H6.5"/>'),
        x: S('<path d="M4 4l8 8M12 4l-8 8"/>'),
    };

    // ---- penyimpanan (IndexedDB; cadangan di memori). Ganti dengan API server pada produksi ----
    var Store = (function () {
        var DB = 'buku-hamana',
            ST = 'dokumen',
            mem = [],
            db = null;

        function open() {
            return new Promise(function (res) {
                if (db) return res(db);
                if (!window.indexedDB) return res(null);

                var q;

                try {
                    q = indexedDB.open(DB, 1);
                } catch (e) {
                    return res(null);
                }

                q.onupgradeneeded = function () {
                    q.result.createObjectStore(ST, { keyPath: 'id' });
                };
                q.onsuccess = function () {
                    db = q.result;
                    res(db);
                };
                q.onerror = q.onblocked = function () {
                    res(null);
                };
            });
        }

        function run(mode, fn) {
            return open().then(function (d) {
                return new Promise(function (res, rej) {
                    var t = d.transaction(ST, mode),
                        out = fn(t.objectStore(ST));

                    t.oncomplete = function () {
                        res(out && 'result' in out ? out.result : undefined);
                    };
                    t.onerror = t.onabort = function () {
                        rej(t.error);
                    };
                });
            });
        }

        return {
            list: function () {
                return open().then(function (d) {
                    return d
                        ? run('readonly', function (s) {
                              return s.getAll();
                          })
                        : mem.slice();
                });
            },
            put: function (r) {
                return open().then(function (d) {
                    if (d)
                        return run('readwrite', function (s) {
                            return s.put(r);
                        });

                    var i = mem.findIndex(function (x) {
                        return x.id === r.id;
                    });

                    if (i < 0) mem.push(r);
                    else mem[i] = r;
                });
            },
            del: function (id) {
                return open().then(function (d) {
                    if (d)
                        return run('readwrite', function (s) {
                            return s.delete(id);
                        });

                    mem = mem.filter(function (x) {
                        return x.id !== id;
                    });
                });
            },
        };
    })();

    // ---- kartu & modal ----
    var urls = [];

    function url(r) {
        var u = URL.createObjectURL(r.file);

        urls.push(u);
        return u;
    }

    function resetUrls() {
        urls.forEach(function (u) {
            URL.revokeObjectURL(u);
        });
        urls = [];
    }

    function isImg(r) {
        return /^image\//.test(r.file.type);
    }

    function card(r, admin) {
        var id = ' data-id="' + esc(r.id) + '"',
            th = isImg(r) ? '<img src="' + url(r) + '" alt="">' : '<div class="pi">' + I.pdf + '<span>PDF</span></div>';
        var btn = function (a, c, ic, l) {
            return '<button type="button" class="btn sm' + (c ? ' ' + c : '') + '" data-a="' + a + '"' + id + '>' + ic + l + '</button>';
        };

        return (
            '<article class="dc"><div class="th">' +
            th +
            '</div><div class="bd2"><h3 class="jd">' +
            esc(r.judul) +
            '</h3><p class="kt' +
            (r.ket ? '' : ' mu') +
            '">' +
            (r.ket ? esc(r.ket) : 'Tidak ada keterangan.') +
            '</p>' +
            '<p class="mt2">' +
            (admin ? esc(r.file.name) + ' · ' : '') +
            sz(r.file.size) +
            ' · ' +
            fmt(r.dibuat) +
            '</p></div>' +
            '<div class="ac"><div class="ab">' +
            (admin ? btn('edit', '', I.pen, 'Edit') + btn('hapus', 'dg', I.trash, 'Hapus') : '') +
            btn('prev', admin ? '' : 'go', I.eye, 'Preview') +
            '</div></div></article>'
        );
    }

    function mdl(title, body, foot, from, onClose) {
        var ov = document.createElement('div');

        ov.className = 'md-ov';
        ov.innerHTML =
            '<div class="md" role="dialog" aria-modal="true" aria-label="' +
            esc(title) +
            '"><div class="mh"><span>' +
            esc(title) +
            '</span><button type="button" class="mx" data-c aria-label="Tutup">' +
            I.x +
            '</button></div><div class="mb">' +
            body +
            '</div><div class="mf">' +
            foot +
            '</div></div>';
        root.appendChild(ov);
        document.body.style.overflow = 'hidden';

        function close() {
            if (onClose) onClose();
            ov.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', k);

            if (from && from.isConnected) from.focus();
        }

        function k(e) {
            if (!root.isConnected) {
                return;
            }

            if (e.key === 'Escape') close();
        }

        document.addEventListener('keydown', k);
        ov.addEventListener('click', function (e) {
            if (e.target === ov || e.target.closest('[data-c]')) close();
        });

        return { el: ov, close: close };
    }

    function preview(r, from) {
        var u = URL.createObjectURL(r.file);
        var body =
            (isImg(r)
                ? '<img class="pvi" src="' + u + '" alt="' + esc(r.judul) + '">'
                : '<iframe class="pvf" src="' +
                  u +
                  '" title="' +
                  esc(r.judul) +
                  '"></iframe><div class="pva">' +
                  I.pdf +
                  '<p>Pratinjau PDF dibuka di tab baru.</p></div>') +
            (r.ket ? '<p class="pvk">' + esc(r.ket) + '</p>' : '');
        var m = mdl(
            r.judul,
            body,
            '<a class="btn" href="' +
                u +
                '" target="_blank" rel="noopener">' +
                I.open +
                'Buka di Tab Baru</a><button type="button" class="btn go" data-c>Tutup</button>',
            from,
            function () {
                setTimeout(function () {
                    URL.revokeObjectURL(u);
                }, 60000);
            },
        );

        m.el.querySelector('.md').classList.add('wd');
        m.el.querySelector('.go').focus();
        emit('buku-preview', { id: r.id, judul: r.judul });
    }

    function kind(f) {
        var e = (f.name.split('.').pop() || '').toLowerCase();

        if (f.type === 'application/pdf' || e === 'pdf') return 'pdf';
        if (/^image\/(jpeg|png)$/.test(f.type) || /^(jpe?g|png)$/.test(e)) return 'img';
        return '';
    }

    function order(a) {
        return a.sort(function (x, y) {
            return x.dibuat < y.dibuat ? 1 : -1;
        });
    }

    var list = [];

    function get(id) {
        return list.filter(function (r) {
            return r.id === id;
        })[0];
    }

    function render() {
        resetUrls();
        $('cnt').textContent = list.length + ' dokumen';
        $('em').hidden = list.length > 0;
        $('gr').innerHTML = list
            .map(function (r) {
                return card(r, false);
            })
            .join('');
    }

    function load() {
        return Store.list().then(function (a) {
            list = order(a);
            render();
        });
    }

    $('gr').addEventListener('click', function (e) {
        var b = e.target.closest('[data-a="prev"]');

        if (!b) return;

        var r = get(b.dataset.id);

        if (r) preview(r, b);
    });
    window.addEventListener('focus', function () {
        if (root.isConnected) load();
    });
    window.addEventListener('pageshow', function () {
        if (root.isConnected) load();
    });
    load();

    document.addEventListener('livewire:navigating', function () {
        if (!root.isConnected) {
            return;
        }

        root.querySelectorAll('.md-ov').forEach(function (el) {
            el.remove();
        });
        document.body.style.overflow = '';
        resetUrls();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBukuHamana);
} else {
    initBukuHamana();
}

document.addEventListener('livewire:navigated', initBukuHamana);
