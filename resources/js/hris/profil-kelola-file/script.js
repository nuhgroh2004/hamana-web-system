const initializedRoots = new WeakSet();

function initProfilKelolaFile() {
    const root = document.getElementById('profil-kelola-file');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

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

    var nomor = {};

    try {
        nomor = JSON.parse(localStorage.getItem('dokumen-nomor')) || {};
    } catch (e) {
        nomor = {};
    }

    var docs = [],
        urls = {},
        pending = null,
        toast = $('toast'),
        ov = $('ov');

    // ---- penyimpanan file (IndexedDB, cadangan: memori) ----
    function db() {
        return new Promise(function (res, rej) {
            if (!window.indexedDB) {
                return rej();
            }

            var r = indexedDB.open('dokumen-pegawai', 1);

            r.onupgradeneeded = function () {
                r.result.createObjectStore('files', { keyPath: 'id' });
            };
            r.onsuccess = function () {
                res(r.result);
            };
            r.onerror = function () {
                rej(r.error);
            };
        });
    }

    function tx(mode, fn) {
        return db()
            .then(function (d) {
                return new Promise(function (res, rej) {
                    var t = d.transaction('files', mode),
                        q = fn(t.objectStore('files'));

                    t.oncomplete = function () {
                        res(q && q.result);
                    };
                    t.onerror = function () {
                        rej(t.error);
                    };
                });
            })
            .catch(function () {
                return null;
            });
    }

    // ---- util ----
    function esc(v) {
        return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
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

    function urlOf(d) {
        return urls[d.id] || (urls[d.id] = URL.createObjectURL(d.blob));
    }

    function isPdf(d) {
        return d.type === 'application/pdf' || PDF.test(d.name);
    }

    function byId(id) {
        return docs.filter(function (d) {
            return d.id === id;
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

    function emit(n, d) {
        document.dispatchEvent(new CustomEvent(n, { detail: d }));
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
        var th = isPdf(d) ? 'PDF' : '<img alt="" src="' + urlOf(d) + '">';
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

        e.textContent = m;
        i.classList.toggle('bad', !!m);

        if (m) {
            i.focus();
            i.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
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

        save(cid, ok, errs, null);
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

    function save(cid, ok, errs, titles) {
        var c = cat(cid);

        if (c) {
            ofCat(cid).forEach(function (d) {
                remove(d);
            });
        }

        ok.forEach(function (f, i) {
            var t = titles ? String(titles[i] || '').trim() : '';
            var d = {
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
                cat: cid,
                name: f.name,
                title: t || null,
                type: f.type || (PDF.test(f.name) ? 'application/pdf' : 'image/' + (/png$/i.test(f.name) ? 'png' : 'jpeg')),
                size: f.size,
                date: Date.now(),
                blob: f,
            };

            docs.push(d);
            tx('readwrite', function (s) {
                return s.put(d);
            });
            emit('dokumen-upload', { kategori: cid, nomor: c ? nomor[cid].trim() : null, judul: d.title, file: f });
        });

        render();

        var box = $('ef-' + cid);

        if (box) {
            box.innerHTML = errs.map(esc).join('<br>');
        }

        say(c ? 'Dokumen ' + c.title + ' berhasil diunggah.' : ok.length + ' dokumen berhasil diunggah.');
    }

    function remove(d) {
        docs = docs.filter(function (x) {
            return x.id !== d.id;
        });

        if (urls[d.id]) {
            URL.revokeObjectURL(urls[d.id]);
            delete urls[d.id];
        }

        tx('readwrite', function (s) {
            return s.delete(d.id);
        });
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
        var u = urlOf(d);

        open(
            'big',
            d.name,
            isPdf(d)
                ? '<iframe src="' + u + '" title="' + esc(d.name) + '"></iframe>'
                : '<img src="' + u + '" alt="' + esc(d.name) + '">',
            '<a href="' + u + '" target="_blank" rel="noopener">Buka di tab baru</a><button type="button" class="btn" data-act="close">Tutup</button>',
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
            save('LAIN', p.files, p.errs, titles);
        } else if (a === 'ok' && d) {
            remove(d);
            close();
            render();
            emit('dokumen-hapus', { kategori: d.cat, nama: d.name });
            say('Dokumen berhasil dihapus.');
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

        try {
            localStorage.setItem('dokumen-nomor', JSON.stringify(nomor));
        } catch (x) {
            // abaikan bila penyimpanan lokal penuh
        }

        el.classList.remove('bad');
        $('en-' + el.dataset.cat).textContent = '';
    });

    root.addEventListener('focusout', function (e) {
        var el = e.target;

        if (!el.classList || !el.classList.contains('num')) {
            return;
        }

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

    tx('readonly', function (s) {
        return s.getAll();
    }).then(function (r) {
        if (r && r.length) {
            docs = r;
            render();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilKelolaFile);
} else {
    initProfilKelolaFile();
}

document.addEventListener('livewire:navigated', initProfilKelolaFile);
