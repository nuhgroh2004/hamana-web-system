const initializedRoots = new WeakSet();

function initProfilAnggotaKeluarga() {
    const root = document.getElementById('profil-anggota-keluarga');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    var KEY = 'anggota-keluarga';
    // add:true = bisa ditambah (AYAH 1 -> AYAH 2, dst); num:true = diberi nomor
    var GROUPS = [
        { k: 'AYAH', add: true, num: true },
        { k: 'IBU', add: true, num: true },
        { k: 'SAUDARA', add: true, num: true },
        { k: 'SUAMI', add: false, num: false },
        { k: 'ISTRI', add: true, num: true },
        { k: 'ANAK', add: true, num: true },
    ];
    // Data awal (ganti dengan data dari server bila perlu)
    var SEED = {
        AYAH: [{ nama: 'Achmad Humajanto', usia: '62', pekerjaan: 'Wiraswasta' }],
        IBU: [{ nama: 'Kholilah', usia: '58', pekerjaan: 'Guru SD (PNS Gol. IIIa)' }],
    };
    var saved = null;

    try {
        saved = JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
        saved = null;
    }

    function blank() {
        return { nama: '', usia: '', pekerjaan: '', on: true };
    }

    var G = GROUPS.map(function (g) {
        var src = (saved && saved[g.k]) || SEED[g.k] || [blank()];

        if (!src.length) {
            src = [blank()];
        }

        return {
            k: g.k,
            add: g.add,
            num: g.num,
            items: src.map(function (s) {
                return {
                    nama: s.nama || '',
                    usia: s.usia || '',
                    pekerjaan: s.pekerjaan || '',
                    on: s.on !== false,
                };
            }),
        };
    });

    var editing = false,
        tb = document.getElementById('tb'),
        tbl = document.getElementById('tbl'),
        editBtn = document.getElementById('edit'),
        saveBtn = document.getElementById('save'),
        toast = document.getElementById('toast');
    var TRASH = '<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 7v4"/></svg>';
    var PLUS = '<svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>';

    function esc(v) {
        return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    function label(g, i) {
        return g.num ? g.k + ' ' + (i + 1) : g.k;
    }

    function render() {
        tbl.classList.toggle('ed', editing);
        tb.innerHTML = G.map(function (g, gi) {
            return g.items
                .map(function (it, ii) {
                    var off = !editing || !it.on ? ' disabled' : '';

                    function inp(k, cls) {
                        return (
                            '<td' +
                            (cls ? ' class="' + cls + '"' : '') +
                            '><input class="fld" data-g="' +
                            gi +
                            '" data-i="' +
                            ii +
                            '" data-k="' +
                            k +
                            '" value="' +
                            esc(it[k]) +
                            '"' +
                            off +
                            ' autocomplete="off"' +
                            (k === 'usia' ? ' inputmode="numeric" maxlength="3"' : '') +
                            (editing ? '' : ' placeholder="-"') +
                            '></td>'
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
                        (editing ? '' : ' disabled') +
                        ' aria-label="Aktifkan ' +
                        label(g, ii) +
                        '"></td>' +
                        '<td class="c2">' +
                        label(g, ii) +
                        '</td>' +
                        inp('nama') +
                        inp('usia', 'c3') +
                        inp('pekerjaan') +
                        '<td class="c6">' +
                        (g.add && g.items.length > 1
                            ? '<button type="button" class="del" data-del="' +
                              gi +
                              ':' +
                              ii +
                              '" title="Hapus ' +
                              label(g, ii) +
                              '" aria-label="Hapus ' +
                              label(g, ii) +
                              '">' +
                              TRASH +
                              '</button>'
                            : '') +
                        (g.add && last
                            ? '<button type="button" class="btn sm" data-add="' +
                              gi +
                              '" title="Tambah ' +
                              g.k.toLowerCase() +
                              '">' +
                              PLUS +
                              'Tambah</button>'
                            : '') +
                        '</td></tr>'
                    );
                })
                .join('');
        }).join('');

        editBtn.hidden = editing;
        saveBtn.hidden = !editing;
        saveBtn.disabled = !editing;
    }

    tb.addEventListener('input', function (e) {
        var el = e.target;

        if (el.type === 'checkbox') {
            return;
        }

        if (el.dataset.k === 'usia') {
            var v = el.value.replace(/\D/g, '');

            if (v !== el.value) {
                el.value = v;
            }
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
                f = tb.querySelector('.fld[data-g="' + gi + '"][data-i="' + n + '"][data-k="nama"]');

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

    editBtn.onclick = function () {
        editing = true;
        render();

        var f = tb.querySelector('.fld:not(:disabled)');

        if (f) {
            f.focus();
        }
    };

    saveBtn.onclick = function () {
        var store = {},
            out = [];

        G.forEach(function (g) {
            g.items.forEach(function (it) {
                it.nama = it.nama.trim();
                it.usia = it.usia.trim();
                it.pekerjaan = it.pekerjaan.trim();
            });
            // baris tambahan yang kosong dibuang (baris pertama tetap ada)
            g.items = g.items.filter(function (it, i) {
                return i === 0 || it.nama || it.usia || it.pekerjaan;
            });
            store[g.k] = g.items;
            g.items.forEach(function (it, i) {
                if (it.on && (it.nama || it.usia || it.pekerjaan)) {
                    out.push({ hubungan: label(g, i), nama: it.nama, usia: it.usia, pekerjaan: it.pekerjaan });
                }
            });
        });

        try {
            localStorage.setItem(KEY, JSON.stringify(store));
        } catch (e) {
            // abaikan bila penyimpanan lokal penuh
        }

        editing = false;
        render();
        document.dispatchEvent(new CustomEvent('keluarga-save', { detail: out }));
        toast.textContent = 'Anggota keluarga berhasil disimpan.';
        toast.classList.add('on');
        clearTimeout(toast.t);
        toast.t = setTimeout(function () {
            toast.classList.remove('on');
        }, 2400);
    };

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilAnggotaKeluarga);
} else {
    initProfilAnggotaKeluarga();
}

document.addEventListener('livewire:navigated', initProfilAnggotaKeluarga);
