const initializedRoots = new WeakSet();

function initProfilRiwayatPendidikan() {
    const root = document.getElementById('profil-riwayat-pendidikan');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    var KEY = 'riwayat-pendidikan-v2';
    var LEVELS = ['SD', 'SMP', 'SMA/SMK', 'DIPLOMA', 'SARJANA', 'MAGISTER', 'DOKTORAL'];
    // Data awal (ganti dengan data dari server bila perlu)
    var SEED = { SARJANA: [{ kota: 'UNIVERSITAS GAJAH MADA', jurusan: 'D4 TEKNOLOGI REKAYASA PERANGKAT LUNAK', tahun: '2026' }] };
    var saved = null;

    try {
        saved = JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
        saved = null;
    }

    function blank() {
        return { kota: '', jurusan: '', tahun: '', on: true };
    }

    var G = LEVELS.map(function (l) {
        var src = (saved && saved[l]) || SEED[l] || [blank()];
        var items = src.length ? src : [blank()];

        return {
            j: l,
            items: items.map(function (s) {
                return { kota: s.kota || '', jurusan: s.jurusan || '', tahun: s.tahun || '', on: s.on !== false };
            }),
        };
    });

    var tb = document.getElementById('tb'),
        toast = document.getElementById('toast');
    var TRASH = '<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 7v4"/></svg>';
    var PLUS = '<svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>';

    function esc(v) {
        return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    function render() {
        var total = 0;

        tb.innerHTML = G.map(function (g, gi) {
            total += g.items.length;

            return g.items
                .map(function (it, ii) {
                    function inp(k) {
                        return (
                            '<td><input class="fld" data-g="' +
                            gi +
                            '" data-i="' +
                            ii +
                            '" data-k="' +
                            k +
                            '" value="' +
                            esc(it[k]) +
                            '"' +
                            (it.on ? '' : ' disabled') +
                            ' autocomplete="off"></td>'
                        );
                    }

                    var last = ii === g.items.length - 1;

                    return (
                        '<tr class="' +
                        (ii === 0 ? 'gs' : '') +
                        '">' +
                        '<td class="c1"><input type="checkbox" data-g="' +
                        gi +
                        '" data-i="' +
                        ii +
                        '" data-k="on"' +
                        (it.on ? ' checked' : '') +
                        ' aria-label="Aktifkan ' +
                        g.j +
                        ' ' +
                        (ii + 1) +
                        '"></td>' +
                        '<td class="c2">' +
                        g.j +
                        ' ' +
                        (ii + 1) +
                        '</td>' +
                        inp('kota') +
                        inp('jurusan') +
                        inp('tahun') +
                        '<td class="c6">' +
                        (g.items.length > 1
                            ? '<button type="button" class="del" data-del="' +
                              gi +
                              ':' +
                              ii +
                              '" title="Hapus ' +
                              g.j +
                              ' ' +
                              (ii + 1) +
                              '" aria-label="Hapus ' +
                              g.j +
                              ' ' +
                              (ii + 1) +
                              '">' +
                              TRASH +
                              '</button>'
                            : '') +
                        (last
                            ? '<button type="button" class="btn sm" data-add="' +
                              gi +
                              '" title="Tambah sekolah di jenjang ' +
                              g.j +
                              '">' +
                              PLUS +
                              'Tambah</button>'
                            : '') +
                        '</td></tr>'
                    );
                })
                .join('');
        }).join('');

        document.getElementById('cnt').textContent = 'Showing 1 to ' + total + ' of ' + total + ' entries';
    }

    tb.addEventListener('input', function (e) {
        var el = e.target;

        if (el.type === 'checkbox') {
            return;
        }

        G[el.dataset.g].items[el.dataset.i][el.dataset.k] = el.value;
    });

    tb.addEventListener('change', function (e) {
        var el = e.target;

        if (el.type !== 'checkbox') {
            return;
        }

        G[el.dataset.g].items[el.dataset.i].on = el.checked;
        el.closest('tr')
            .querySelectorAll('.fld')
            .forEach(function (f) {
                f.disabled = !el.checked;
            });
    });

    tb.addEventListener('click', function (e) {
        var a = e.target.closest('[data-add]'),
            d = e.target.closest('[data-del]');

        if (a) {
            var gi = +a.dataset.add;

            G[gi].items.push(blank());
            render();

            var n = G[gi].items.length - 1,
                f = tb.querySelector('.fld[data-g="' + gi + '"][data-i="' + n + '"][data-k="kota"]');

            if (f) {
                f.focus();
                f.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        } else if (d) {
            var p = d.dataset.del.split(':');

            G[+p[0]].items.splice(+p[1], 1);
            render();
        }
    });

    document.getElementById('save').onclick = function () {
        G.forEach(function (g) {
            g.items.forEach(function (it) {
                it.kota = it.kota.trim().toUpperCase();
                it.jurusan = it.jurusan.trim().toUpperCase();
                it.tahun = it.tahun.trim();
            });
            // baris tambahan yang kosong dibuang (baris pertama tetap ada)
            g.items = g.items.filter(function (it, i) {
                return i === 0 || it.kota || it.jurusan || it.tahun;
            });
        });

        var store = {},
            out = [];

        G.forEach(function (g) {
            store[g.j] = g.items;
            g.items.forEach(function (it) {
                if (it.on && (it.kota || it.jurusan || it.tahun)) {
                    out.push({ jenjang: g.j, kota: it.kota, jurusan: it.jurusan, tahun: it.tahun });
                }
            });
        });

        try {
            localStorage.setItem(KEY, JSON.stringify(store));
        } catch (e) {
            // abaikan bila penyimpanan lokal penuh
        }

        render();
        document.dispatchEvent(new CustomEvent('pendidikan-save', { detail: out }));
        toast.textContent = 'Riwayat pendidikan berhasil disimpan.';
        toast.classList.add('on');
        clearTimeout(toast.t);
        toast.t = setTimeout(function () {
            toast.classList.remove('on');
        }, 2400);
    };

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilRiwayatPendidikan);
} else {
    initProfilRiwayatPendidikan();
}

document.addEventListener('livewire:navigated', initProfilRiwayatPendidikan);
