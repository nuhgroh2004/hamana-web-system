const initializedRoots = new WeakSet();

function initSlipGaji() {
    const root = document.getElementById('slip-gaji');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    var BULAN = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
    ];
    // Data contoh (ganti dengan data dari server; isi "url" dengan alamat file PDF slip)
    var DUMMY = 'slip-gaji-dummy.pdf',
        all = []; // PDF kosong sebagai contoh; ganti per slip dengan file asli

    [
        [2026, 10],
        [2025, 12],
    ].forEach(function (p) {
        for (var m = p[1]; m >= 1; m--) {
            all.push({ id: p[0] + '-' + m, b: m, t: p[0], url: DUMMY });
        }
    });

    var SIZE = 10,
        page = 1,
        bln = 'all',
        thn = 'all';
    var $ = function (id) {
            return document.getElementById(id);
        },
        tb = $('tb'),
        mn = $('mn');

    function emit(n, d) {
        document.dispatchEvent(new CustomEvent(n, { detail: d }));
    }

    // ---- PIN ----
    var verify =
            window.slipVerifyPin ||
            function (p) {
                return Promise.resolve(p === '0911');
            },
        busy = false,
        pin = $('pin'),
        pe = $('pe');

    function perr(m) {
        pe.textContent = m;
        pin.classList.toggle('bad', !!m);
    }

    function submit() {
        if (busy) {
            return;
        }

        var v = pin.value;

        if (v.length < 4) {
            perr('PIN harus 4 digit.');
            pin.focus();
            return;
        }

        busy = true;
        $('sub').disabled = true;

        Promise.resolve(verify(v))
            .then(
                function (ok) {
                    if (ok) {
                        $('gate').hidden = true;
                        $('pg').hidden = false;
                        emit('slip-buka');
                        render();
                        return;
                    }

                    perr('PIN salah. Silakan coba lagi atau klik Kembali.');
                    pin.focus();
                    pin.select();
                },
                function () {
                    perr('Gagal memverifikasi PIN. Coba lagi.');
                },
            )
            .then(function () {
                busy = false;
                $('sub').disabled = false;
            });
    }

    pin.addEventListener('input', function () {
        var v = pin.value.replace(/\D/g, '').slice(0, 4);

        pin.value = v;

        if (v.length < 4) {
            perr('');
        } else {
            submit();
        }
    });

    pin.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            submit();
        }
    });

    $('sub').onclick = submit;
    $('back').onclick = function () {
        emit('slip-kembali');

        if (history.length > 1) {
            history.back();
        }
    };

    pin.focus();

    // ---- data & render ----
    function list() {
        return all.filter(function (r) {
            return (bln === 'all' || r.b === +bln) && (thn === 'all' || r.t === +thn);
        });
    }

    var ICON =
        '<svg class="i" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M9.5 1.5v3h3M5.5 8h5M5.5 10.5h5"/></svg>';

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
                var n = BULAN[r.b - 1] + ' ' + r.t;

                return (
                    '<tr><td class="c2">' +
                    (from + i + 1) +
                    '</td><td class="c1"><button type="button" class="ib" data-v="' +
                    r.id +
                    '" title="Lihat slip gaji" aria-label="Lihat slip gaji ' +
                    n +
                    '">' +
                    ICON +
                    '</button></td><td>' +
                    BULAN[r.b - 1] +
                    '</td><td>' +
                    r.t +
                    '</td></tr>'
                );
            })
            .join('');

        $('empty').hidden = L.length > 0;
        $('cnt').textContent = L.length
            ? 'Menampilkan ' + (from + 1) + '–' + (from + rows.length) + ' dari ' + L.length + ' slip gaji'
            : '0 slip gaji';

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

    $('pn').addEventListener('click', function (e) {
        var b = e.target.closest('[data-p]');

        if (b && !b.disabled) {
            page = +b.dataset.p;
            render();
        }
    });

    // ---- buka PDF di tab baru ----
    tb.addEventListener('click', function (e) {
        var b = e.target.closest('[data-v]');

        if (!b) {
            return;
        }

        var r = all.filter(function (x) {
            return x.id === b.dataset.v;
        })[0];

        if (!r) {
            return;
        }

        var a = document.createElement('a');

        a.href = r.url;
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        emit('slip-lihat', r);
    });

    // ---- filter dropdown ----
    var CK = '<svg class="i ck" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>',
        curBtn = null,
        curDD = null,
        DD = {};

    function opts(id) {
        if (id === 'bln') {
            return [['all', 'Semua']].concat(
                BULAN.map(function (n, i) {
                    return [String(i + 1), n];
                }),
            );
        }

        var y = {};

        all.forEach(function (r) {
            y[r.t] = 1;
        });

        return [['all', 'Semua']].concat(
            Object.keys(y)
                .sort(function (a, b) {
                    return b - a;
                })
                .map(function (v) {
                    return [v, v];
                }),
        );
    }

    function paint(id) {
        var v = id === 'bln' ? bln : thn,
            o = opts(id).filter(function (x) {
                return x[0] === v;
            })[0];

        root.querySelector('[data-dd="' + id + '"] .l').textContent = o ? o[1] : '';
    }

    function closeMenu() {
        mn.hidden = true;
        curBtn = null;
        curDD = null;
    }

    function openDD(btn) {
        var id = btn.dataset.dd,
            v = id === 'bln' ? bln : thn;

        mn.innerHTML = opts(id)
            .map(function (o) {
                return (
                    '<button type="button" role="option" data-opt="' +
                    o[0] +
                    '" class="' +
                    (o[0] === v ? 'on' : '') +
                    '">' +
                    o[1] +
                    CK +
                    '</button>'
                );
            })
            .join('');

        var w = Math.max(btn.offsetWidth, 180);

        mn.style.width = w + 'px';
        mn.hidden = false;

        var r = btn.getBoundingClientRect(),
            h = mn.offsetHeight,
            top = r.bottom + 4;

        if (top + h > innerHeight - 8) {
            top = Math.max(8, r.top - h - 4);
        }

        mn.style.top = top + 'px';
        mn.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + 'px';
        curBtn = btn;
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

        if (!mn.hidden && !mn.contains(e.target)) {
            closeMenu();
        }
    });

    mn.addEventListener('click', function (e) {
        var o = e.target.closest('[data-opt]');

        if (o && curDD) {
            if (curDD === 'bln') {
                bln = o.dataset.opt;
            } else {
                thn = o.dataset.opt;
            }

            var id = curDD;

            closeMenu();
            paint(id);
            page = 1;
            render();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (root.isConnected && e.key === 'Escape' && !mn.hidden) {
            closeMenu();
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

    paint('bln');
    paint('thn');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlipGaji);
} else {
    initSlipGaji();
}

document.addEventListener('livewire:navigated', initSlipGaji);
