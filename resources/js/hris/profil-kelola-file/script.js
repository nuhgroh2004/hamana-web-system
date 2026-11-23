const initializedRoots = new WeakSet();

function initProfilKelolaFile() {
    const root = document.getElementById('profil-kelola-file');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    const params = {};
    const nik = new URLSearchParams(window.location.search).get('nik');

    if (nik) {
        params.nik = nik;
    }

    var MAX = 10 * 1024 * 1024,
        EXT = /\.(pdf|jpe?g|png)$/i,
        PDF = /\.pdf$/i;

    var CATS = [
        {
            id: 'KK',
            title: 'Kartu Keluarga',
            label: 'Nomor KK',
            hint: '16 digit angka',
            test: function (v) {
                return /^\d{16}$/.test(v.replace(/\s/g, ''));
            },
            msg: 'Nomor KK harus 16 digit angka.',
        },
        {
            id: 'KTP',
            title: 'KTP',
            label: 'Nomor NIK',
            hint: '16 digit angka',
            test: function (v) {
                return /^\d{16}$/.test(v.replace(/\s/g, ''));
            },
            msg: 'Nomor NIK harus 16 digit angka.',
        },
        {
            id: 'NPWP',
            title: 'NPWP',
            label: 'Nomor NPWP',
            hint: '15 atau 16 digit angka',
            test: function (v) {
                var s = v.replace(/\s/g, ''),
                    d = s.replace(/\D/g, '');
                return /^[\d.\-]+$/.test(s) && (d.length === 15 || d.length === 16);
            },
            msg: 'Nomor NPWP harus 15 atau 16 digit angka.',
        },
    ];

    function $(id) {
        return root.querySelector('#' + id);
    }

    var nomor = {},
        docs = [],
        pending = null,
        saveTimer = null,
        toast = $('toast'),
        ov = $('ov');

    // ---- util ----
    function esc(v) {
        return String(v == null ? '' : v)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    function size(n) {
        return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
    }

    function dt(t) {
        return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
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

        say(first ? errors[first][0] : (e && e.response && e.response.data && e.response.data.message) || 'Dokumen gagal diproses.');
    }

    function isPdf(d) {
        return d.type === 'application/pdf' || PDF.test(d.name);
    }

    function byId(id) {
        return docs.filter(function (d) {
            return String(d.id) === String(id);
        })[0];
    }

    function ofCat(c) {
        return docs.filter(function (d) {
            return d.cat === c;
        });
    }

    function cat(id) {
        return CATS.filter(function (c) {
            return c.id === id;
        })[0];
    }

    function numErr(c) {
        var v = (nomor[c.id] || '').trim();

        return !v ? c.label + ' wajib diisi sebelum mengunggah.' : c.test(v) ? '' : c.msg;
    }

    // ---- tampilan ----
    var UP = '<svg class="i" viewBox="0 0 16 16"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v3h11v-3"/></svg>';

    function dz(cid, multi) {
        return (
            '<div class="dz" data-cat="' +
            cid +
            '">' +
            UP +
            '<p><button type="button" class="btn sm" data-act="pick" data-cat="' +
            cid +
            '">Pilih file</button> atau seret ke sini</p><small>PDF, JPG, PNG · maks 10 MB</small>' +
            '<input type="file" hidden data-cat="' +
            cid +
            '"' +
            (multi ? ' multiple' : '') +
            ' accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"></div>'
        );
    }

    function row(d) {
        var th = isPdf(d) ? 'PDF' : '<img alt="" src="' + d.url + '">';
        var ty = isPdf(d) ? 'PDF' : /png$/i.test(d.name) ? 'PNG' : 'JPG';
        var judul = d.title ? String(d.title).trim() : '';
        // Judul opsional: bila kosong, nama file yang ditampilkan.
        var judulSel = '<b title="' + esc(judul || d.name) + '">' + esc(judul || d.name) + '</b>';

        return (
            '<div class="fr"><div class="th">' +
            th +
            '</div><div class="fi">' +
            judulSel +
            '<small>' +
            (judul ? esc(d.name) + ' · ' : '') +
            ty +
            ' · ' +
            size(d.size) +
            ' · ' +
            dt(d.date) +
            '</small></div>' +
            '<div class="ac"><button type="button" class="btn sm" data-act="view" data-id="' +
            d.id +
            '">Lihat</button><button type="button" class="btn sm dg" data-act="del" data-id="' +
            d.id +
            '">Hapus</button></div></div>'
        );
    }

    function render() {
        $('utama').innerHTML = CATS.map(function (c) {
            var d = ofCat(c.id)[0];

            return (
                '<section class="box"><div class="hd"><h3>' +
                c.title +
                '</h3><span class="bdg' +
                (d ? ' ok' : '') +
                '">' +
                (d ? 'Terunggah' : 'Belum diunggah') +
                '</span></div>' +
                '<div class="bd2"><div><label class="lb" for="n-' +
                c.id +
                '">' +
                c.label +
                ' <span class="rq">*</span></label>' +
                '<input class="fld num" id="n-' +
                c.id +
                '" data-cat="' +
                c.id +
                '" inputmode="numeric" autocomplete="off" value="' +
                esc(nomor[c.id] || '') +
                '">' +
                '<p class="hint">' +
                c.hint +
                '</p><p class="er" id="en-' +
                c.id +
                '" role="alert"></p></div>' +
                '<div>' +
                (d ? row(d) : dz(c.id, false)) +
                '<p class="er" id="ef-' +
                c.id +
                '" role="alert"></p></div></div></section>'
            );
        }).join('');

        $('lain').innerHTML =
            '<section class="box"><div class="hd"><h3>Dokumen Lainnya</h3><span class="bdg' +
            (ofCat('LAIN').length ? ' ok' : '') +
            '">' +
            ofCat('LAIN').length +
            ' file</span></div>' +
            '<div class="bd2 one"><div>' +
            dz('LAIN', true) +
            '<p class="hint">Setiap file bisa diberi judul saat diunggah. Judul bersifat opsional.</p>' +
            '<p class="er" id="ef-LAIN" role="alert"></p><div class="lst">' +
            ofCat('LAIN').map(row).join('') +
            '</div></div></div></section>';
    }

    function showNumErr(c, m) {
        var i = $('n-' + c.id),
            e = $('en-' + c.id);

        if (!i || !e) {
            return;
        }

        e.textContent = m;
        i.classList.toggle('bad', !!m);

        if (m) {
            i.focus();
            i.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    // ---- data ----
    function load() {
        return window.axios
            .get('/api/profil/dokumen', { params: params })
            .then(function (res) {
                nomor = res.data.nomor || {};
                docs = res.data.dokumen || [];
                render();
            })
            .catch(fail);
    }

    function persistNumbers() {
        var body = {};

        CATS.forEach(function (c) {
            body[c.id] = (nomor[c.id] || '').trim();
        });

        return window.axios
            .put('/api/profil/dokumen-nomor', { nomor: body }, { params: params })
            .then(function (res) {
                nomor = res.data.nomor || nomor;
            })
            .catch(fail);
    }

    function scheduleNumbers() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(persistNumbers, 500);
    }

    // ---- unggah ----
    function check(files) {
        var errs = [],
            ok = [];

        Array.prototype.forEach.call(files, function (f) {
            if (!EXT.test(f.name)) {
                errs.push(f.name + ': format tidak didukung. Gunakan PDF, JPG, atau PNG.');
            } else if (f.size > MAX) {
                errs.push(f.name + ': ukuran ' + size(f.size) + ' melebihi batas 10 MB.');
            } else {
                ok.push(f);
            }
        });

        return { errs: errs, ok: ok };
    }

    function fileType(f) {
        return PDF.test(f.name) ? 'PDF' : /png$/i.test(f.name) ? 'PNG' : 'JPG';
    }

    function handle(cid, files) {
        var c = cat(cid);

        if (c) {
            var m = numErr(c);

            if (m) {
                showNumErr(c, m);
                return;
            }

            showNumErr(c, '');
        }

        var v = check(files),
            errs = v.errs,
            ok = v.ok;

        if (c) {
            ok = ok.slice(0, 1);
        }

        var box = $('ef-' + cid);

        if (box) {
            box.innerHTML = errs.map(esc).join('<br>');
        }

        if (!ok.length) {
            return;
        }

        // Dokumen Lainnya: minta judul (opsional) sebelum disimpan.
        if (cid === 'LAIN') {
            askTitles(ok, errs);
            return;
        }

        upload(cid, ok, null);
    }

    // Modal pemberian judul untuk tiap file yang akan diunggah.
    function askTitles(files, errs) {
        pending = { files: files, errs: errs };

        var body =
            '<p class="tlh">Beri judul untuk setiap dokumen. Judul bersifat opsional, boleh dikosongkan.</p>' +
            '<div class="tlst2">' +
            files
                .map(function (f, i) {
                    return (
                        '<div class="trow"><div class="tn"><b title="' +
                        esc(f.name) +
                        '">' +
                        esc(f.name) +
                        '</b><small>' +
                        fileType(f) +
                        ' · ' +
                        size(f.size) +
                        '</small></div><input class="fld tt" data-i="' +
                        i +
                        '" maxlength="120" autocomplete="off" placeholder="Judul dokumen (opsional)" aria-label="Judul untuk ' +
                        esc(f.name) +
                        '"></div>'
                    );
                })
                .join('') +
            '</div>' +
            (errs.length ? '<p class="er" role="alert">' + errs.map(esc).join('<br>') + '</p>' : '');

        open(
            'tit',
            'Judul Dokumen',
            body,
            '<button type="button" class="btn" data-act="close">Batal</button><button type="button" class="btn go" data-act="save-title">Unggah</button>',
        );

        var first = ov.querySelector('.tt');

        if (first) {
            first.focus();
        }
    }

    function upload(cid, files, titles) {
        var c = cat(cid);

        var tasks = Array.prototype.map.call(files, function (f, i) {
            var body = new FormData();

            body.append('kategori', cid);
            body.append('file', f);

            if (titles && titles[i]) {
                body.append('judul', titles[i]);
            }

            if (c) {
                body.append('nomor', (nomor[cid] || '').trim());
            }

            return window.axios.post('/api/profil/dokumen', body, { params: params });
        });

        Promise.all(tasks)
            .then(function () {
                return load();
            })
            .then(function () {
                say(c ? 'Dokumen ' + c.title + ' berhasil diunggah.' : files.length + ' dokumen berhasil diunggah.');
            })
            .catch(fail);
    }

    // ---- modal ----
    function open(cls, title, body, foot) {
        ov.innerHTML =
            '<div class="dlg ' +
            cls +
            '" role="dialog" aria-modal="true" aria-label="' +
            esc(title) +
            '"><div class="dh"><b>' +
            esc(title) +
            '</b>' +
            '<button type="button" class="x" data-act="close" aria-label="Tutup"><svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div>' +
            '<div class="db">' +
            body +
            '</div>' +
            (foot ? '<div class="df">' + foot + '</div>' : '') +
            '</div>';
        ov.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function close() {
        ov.hidden = true;
        ov.innerHTML = '';
        pending = null;
        document.body.style.overflow = '';
    }

    function view(d) {
        open(
            'big',
            d.name,
            isPdf(d)
                ? '<iframe src="' + d.url + '" title="' + esc(d.name) + '"></iframe>'
                : '<img src="' + d.url + '" alt="' + esc(d.name) + '">',
            '<a href="' + d.url + '" target="_blank" rel="noopener">Buka di tab baru</a><button type="button" class="btn" data-act="close">Tutup</button>',
        );
    }

    function confirmDel(d) {
        var c = cat(d.cat);

        open(
            '',
            'Hapus dokumen?',
            '<p style="margin:0">Dokumen <b>' +
                esc(d.name) +
                '</b>' +
                (c ? ' (' + c.title + ')' : '') +
                ' akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>',
            '<button type="button" class="btn" data-act="close">Batal</button><button type="button" class="btn dg" data-act="ok" data-id="' +
                d.id +
                '">Hapus</button>',
        );
    }

    // ---- event ----
    root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]');

        if (e.target === ov) {
            close();
            return;
        }

        if (!b) {
            return;
        }

        var a = b.dataset.act,
            d = b.dataset.id ? byId(b.dataset.id) : null;

        if (a === 'pick') {
            var c = cat(b.dataset.cat);

            if (c) {
                var m = numErr(c);

                if (m) {
                    showNumErr(c, m);
                    return;
                }
            }

            b.closest('.dz').querySelector('input[type=file]').click();
        } else if (a === 'view' && d) {
            view(d);
        } else if (a === 'del' && d) {
            confirmDel(d);
        } else if (a === 'save-title') {
            var titles = {},
                p = pending;

            if (!p) {
                close();
                return;
            }

            Array.prototype.forEach.call(ov.querySelectorAll('.tt'), function (el) {
                titles[el.dataset.i] = el.value;
            });

            close();
            upload('LAIN', p.files, titles);
        } else if (a === 'ok' && d) {
            window.axios
                .delete('/api/profil/dokumen/' + d.id, { params: params })
                .then(function () {
                    close();
                    return load();
                })
                .then(function () {
                    say('Dokumen berhasil dihapus.');
                })
                .catch(fail);
        } else if (a === 'close') {
            close();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (!root.isConnected) {
            return;
        }

        if (e.key === 'Escape' && !ov.hidden) {
            close();
        }
    });

    root.addEventListener('change', function (e) {
        var el = e.target;

        if (el.type === 'file') {
            handle(el.dataset.cat, el.files);
            el.value = '';
        }
    });

    root.addEventListener('input', function (e) {
        var el = e.target;

        if (!el.classList.contains('num')) {
            return;
        }

        nomor[el.dataset.cat] = el.value;
        el.classList.remove('bad');
        $('en-' + el.dataset.cat).textContent = '';
        scheduleNumbers();
    });

    root.addEventListener('focusout', function (e) {
        var el = e.target;

        if (!el.classList || !el.classList.contains('num')) {
            return;
        }

        clearTimeout(saveTimer);
        persistNumbers();

        var c = cat(el.dataset.cat);

        if (c && ofCat(c.id).length) {
            showNumErrNoFocus(c);
        }
    });

    function showNumErrNoFocus(c) {
        var m = numErr(c),
            i = $('n-' + c.id),
            e = $('en-' + c.id);

        if (!i || !e) {
            return;
        }

        e.textContent = m;
        i.classList.toggle('bad', !!m);
    }

    ['dragover', 'dragleave', 'drop'].forEach(function (t) {
        root.addEventListener(t, function (e) {
            var z = e.target.closest && e.target.closest('.dz');

            if (!z) {
                return;
            }

            e.preventDefault();

            if (t === 'dragover') {
                z.classList.add('ov');
            } else {
                z.classList.remove('ov');
            }

            if (t === 'drop' && e.dataTransfer) {
                handle(z.dataset.cat, e.dataTransfer.files);
            }
        });
    });

    // cegah browser membuka file bila dijatuhkan di luar area unggah
    window.addEventListener('dragover', function (e) {
        if (root.isConnected) {
            e.preventDefault();
        }
    });

    window.addEventListener('drop', function (e) {
        if (root.isConnected) {
            e.preventDefault();
        }
    });

    document.addEventListener('livewire:navigating', function () {
        if (root.isConnected) {
            close();
        }
    });

    render();
    load();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilKelolaFile);
} else {
    initProfilKelolaFile();
}

document.addEventListener('livewire:navigated', initProfilKelolaFile);
