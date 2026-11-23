const initializedRoots = new WeakSet();

function initProfilRiwayatPendidikan() {
    const root = document.getElementById('profil-riwayat-pendidikan');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    const params = {};
    const nik = new URLSearchParams(window.location.search).get('nik');

    if (nik) {
        params.nik = nik;
    }

    var LEVELS = ['SD', 'SMP', 'SMA/SMK', 'DIPLOMA', 'SARJANA', 'MAGISTER', 'DOKTORAL'];

    function blank() {
        return { nama_sekolah: '', jurusan: '', tahun: '', on: true };
    }

    function groupsFrom(items) {
        var byLevel = {};

        (items || []).forEach(function (item) {
            if (!byLevel[item.jenjang]) {
                byLevel[item.jenjang] = [];
            }

            byLevel[item.jenjang].push({
                nama_sekolah: item.nama_sekolah || '',
                jurusan: item.jurusan || '',
                tahun: item.tahun || '',
                on: item.aktif !== false,
            });
        });

        return LEVELS.map(function (level) {
            var items = byLevel[level] && byLevel[level].length ? byLevel[level] : [blank()];

            return { j: level, items: items };
        });
    }

    var G = groupsFrom([]);
    var editing = false,
        tb = document.getElementById('tb'),
        tbl = document.getElementById('tbl'),
        editBtn = document.getElementById('edit'),
        saveBtn = document.getElementById('save'),
        toast = document.getElementById('toast');
    var TRASH = '<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 7v4"/></svg>';
    var PLUS = '<svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>';

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

        say(first ? errors[first][0] : (e && e.response && e.response.data && e.response.data.message) || 'Data gagal disimpan.');
    }

    function render() {
        var total = 0;

        tbl.classList.toggle('ed', editing);

        tb.innerHTML = G.map(function (g, gi) {
            total += g.items.length;

            return g.items
                .map(function (it, ii) {
                    var off = !editing || !it.on ? ' disabled' : '';

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
                            off +
                            ' autocomplete="off"' +
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
                        g.j +
                        '"></td>' +
                        '<td class="c2">' +
                        g.j +
                        '</td>' +
                        inp('nama_sekolah') +
                        inp('jurusan') +
                        inp('tahun') +
                        '<td class="c6">' +
                        (editing && g.items.length > 1
                            ? '<button type="button" class="del" data-del="' +
                              gi +
                              ':' +
                              ii +
                              '" title="Hapus ' +
                              g.j +
                              '" aria-label="Hapus ' +
                              g.j +
                              '">' +
                              TRASH +
                              '</button>'
                            : '') +
                        (editing && last
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

        editBtn.hidden = editing;
        saveBtn.hidden = !editing;
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
                f = tb.querySelector('.fld[data-g="' + gi + '"][data-i="' + n + '"][data-k="nama_sekolah"]');

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
        var items = [];

        G.forEach(function (g) {
            g.items.forEach(function (it) {
                it.nama_sekolah = it.nama_sekolah.trim();
                it.jurusan = it.jurusan.trim();
                it.tahun = it.tahun.trim();

                if (it.nama_sekolah || it.jurusan || it.tahun) {
                    items.push({
                        jenjang: g.j,
                        nama_sekolah: it.nama_sekolah,
                        jurusan: it.jurusan,
                        tahun: it.tahun,
                        aktif: it.on,
                    });
                }
            });
        });

        window.axios
            .put('/api/profil/pendidikan', { items: items }, { params: params })
            .then(function (res) {
                G = groupsFrom(res.data.items);
                editing = false;
                render();
                say('Riwayat pendidikan berhasil disimpan.');
            })
            .catch(fail);
    };

    window.axios
        .get('/api/profil/pendidikan', { params: params })
        .then(function (res) {
            G = groupsFrom(res.data.items);
            render();
        })
        .catch(fail);

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilRiwayatPendidikan);
} else {
    initProfilRiwayatPendidikan();
}

document.addEventListener('livewire:navigated', initProfilRiwayatPendidikan);
