const initializedRoots = new WeakSet();

function initSaran() {
    const root = document.getElementById('saran');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    // ---- alert ----
    window.Alert = (function () {
        var SVG = {
            ok: '<circle class="bg" cx="42" cy="42" r="38"/><circle class="rg" cx="42" cy="42" r="38"/><path class="ck" d="M26 43l11 11 21-23"/>',
            er: '<circle class="bg" cx="42" cy="42" r="38"/><circle class="rg" cx="42" cy="42" r="38"/><path class="x1" d="M31 31l22 22"/><path class="x2" d="M53 31L31 53"/>',
            q: '<circle class="bg" cx="42" cy="42" r="38"/><circle class="rg" cx="42" cy="42" r="38"/><path class="qm" d="M33.5 34a8.5 8.5 0 1112 7.7c-2.4 1.1-3.5 2.6-3.5 5.3M42 56v.01"/>',
            w: '<path class="tri" d="M42 12L77 71H7z"/><path class="qm" d="M42 33v17M42 60v.01"/>',
        };
        var COL = ['#2da44e', '#0969da', '#8250df', '#d4a72c', '#bf3989', '#fb8500'];

        function esc(v) {
            return String(v == null ? '' : v)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;');
        }

        function confetti(box) {
            for (var i = 0; i < 26; i++) {
                var a = Math.random() * Math.PI * 2,
                    d = 60 + Math.random() * 100,
                    s = 6 + Math.random() * 5,
                    e = document.createElement('i');

                e.className = 'cf';
                e.style.cssText =
                    '--dx:' +
                    Math.cos(a) * d +
                    'px;--dy:' +
                    (Math.sin(a) * d - 20) +
                    'px;--r:' +
                    (360 + Math.random() * 540) +
                    'deg;--s:' +
                    s +
                    'px;--c:' +
                    COL[i % COL.length] +
                    ';--d:' +
                    (0.3 + Math.random() * 0.12) +
                    's;--rd:' +
                    (Math.random() < 0.4 ? '50%' : '2px');
                box.appendChild(e);
            }
        }

        function show(o) {
            return new Promise(function (done) {
                var prev = document.activeElement,
                    ov = document.createElement('div'),
                    kind = o.kind,
                    icon = kind === 'q' && o.danger ? 'w' : kind,
                    cls = kind === 'q' && o.danger ? 'er' : kind;

                ov.className = 'ov2';
                ov.innerHTML =
                    '<div class="dlg' +
                    (kind === 'er' ? ' shake' : '') +
                    '" role="alertdialog" aria-modal="true" aria-labelledby="ad-t" aria-describedby="ad-m"' +
                    (o.ms ? ' style="--ms:' + o.ms + 'ms"' : '') +
                    '>' +
                    '<div class="icw ' +
                    cls +
                    '"><svg class="ic" viewBox="0 0 84 84" aria-hidden="true">' +
                    SVG[icon] +
                    '</svg></div>' +
                    '<h2 class="t" id="ad-t">' +
                    esc(o.title) +
                    '</h2><p class="m" id="ad-m">' +
                    esc(o.message) +
                    '</p>' +
                    '<div class="f">' +
                    o.buttons +
                    '</div>' +
                    (o.ms ? '<div class="bar"></div>' : '') +
                    '</div>';
                root.appendChild(ov);
                document.body.style.overflow = 'hidden';

                var dlg = ov.firstChild,
                    first = ov.querySelector('[data-f]') || ov.querySelector('[data-r]'),
                    timer,
                    left = o.ms,
                    t0;

                if (kind === 'ok') {
                    confetti(ov.querySelector('.icw'));
                }

                first.focus();

                function end(v) {
                    clearTimeout(timer);
                    document.removeEventListener('keydown', key, true);
                    ov.classList.add('out');
                    setTimeout(function () {
                        ov.remove();
                        document.body.style.overflow = '';

                        if (prev && prev.focus) {
                            prev.focus();
                        }

                        done(v);
                    }, 180);
                }

                function run() {
                    t0 = Date.now();
                    timer = setTimeout(function () {
                        end(true);
                    }, left);
                }

                function key(e) {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        end(false);
                    } else if (e.key === 'Tab') {
                        e.preventDefault();
                        var b = [].slice.call(ov.querySelectorAll('[data-r]')),
                            i = b.indexOf(document.activeElement);

                        b[(i + (e.shiftKey ? b.length - 1 : 1)) % b.length].focus();
                    }
                }

                document.addEventListener('keydown', key, true);
                ov.addEventListener('click', function (e) {
                    if (e.target === ov) {
                        end(false);
                    }

                    var b = e.target.closest('[data-r]');

                    if (b) {
                        end(b.dataset.r === '1');
                    }
                });

                if (o.ms) {
                    run();
                    dlg.addEventListener('mouseenter', function () {
                        clearTimeout(timer);
                        left -= Date.now() - t0;
                        dlg.classList.add('hold');
                    });
                    dlg.addEventListener('mouseleave', function () {
                        dlg.classList.remove('hold');
                        run();
                    });
                }
            });
        }

        return {
            confirm: function (o) {
                o = o || {};

                return show({
                    kind: 'q',
                    danger: o.danger,
                    title: o.title || 'Apakah Anda yakin?',
                    message: o.message || 'Lanjutkan proses ini?',
                    buttons:
                        '<button type="button" class="btn" data-r="0"' +
                        (o.danger ? ' data-f' : '') +
                        '>' +
                        esc(o.no || 'Tidak') +
                        '</button>' +
                        '<button type="button" class="btn ' +
                        (o.danger ? 'dgb' : 'go') +
                        '" data-r="1"' +
                        (o.danger ? '' : ' data-f') +
                        '>' +
                        esc(o.yes || 'Ya') +
                        '</button>',
                });
            },
            success: function (m, t) {
                return show({
                    kind: 'ok',
                    ms: 3000,
                    title: t || 'Berhasil',
                    message: m || 'Proses berhasil dilakukan.',
                    buttons: '<button type="button" class="btn go" data-r="1">OK</button>',
                });
            },
            save: function (o) {
                o = o || {};

                return this.confirm({
                    title: o.title || 'Simpan data?',
                    message: o.message || 'Data yang Anda isi akan disimpan.',
                    yes: o.yes || 'Ya, simpan',
                    no: o.no || 'Tidak',
                });
            },
            update: function (o) {
                o = o || {};

                return this.confirm({
                    title: o.title || 'Ubah data?',
                    message: o.message || 'Perubahan yang Anda buat akan menggantikan data sebelumnya.',
                    yes: o.yes || 'Ya, ubah',
                    no: o.no || 'Tidak',
                });
            },
            logout: function (o) {
                o = o || {};

                return this.confirm({
                    title: o.title || 'Keluar dari akun?',
                    message: o.message || 'Anda harus masuk kembali untuk mengakses halaman ini.',
                    yes: o.yes || 'Ya, keluar',
                    no: o.no || 'Batal',
                });
            },
            error: function (m, t) {
                return show({
                    kind: 'er',
                    title: t || 'Gagal',
                    message: m || 'Terjadi kesalahan. Silakan coba lagi.',
                    buttons: '<button type="button" class="btn dgb" data-r="1">Tutup</button>',
                });
            },
        };
    })();

    (function () {
        var $ = function (id) {
                return document.getElementById(id);
            },
            MAX = 5,
            LIM = 5 * 1024 * 1024,
            files = [];
        var PDF =
                '<svg class="i" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M9.5 1.5v3h3M5.5 9h5M5.5 11.5h5"/></svg>',
            X = '<svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>';

        function esc(v) {
            return String(v == null ? '' : v)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;');
        }

        function kind(f) {
            var t = f.type,
                e = (f.name.split('.').pop() || '').toLowerCase();

            if (t === 'application/pdf' || e === 'pdf') {
                return 'pdf';
            }

            if (t === 'image/jpeg' || t === 'image/png' || e === 'jpg' || e === 'jpeg' || e === 'png') {
                return 'img';
            }

            return '';
        }

        function sz(n) {
            return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
        }

        // ---- teks saran ----
        $('sr').addEventListener('input', function () {
            $('cn').textContent = this.value.length + '/2000';

            if (this.value.trim()) {
                $('se').textContent = '';
                this.classList.remove('bad');
            }
        });

        // ---- lampiran ----
        function add(list) {
            var bad = [];

            [].forEach.call(list, function (f) {
                if (!kind(f)) {
                    bad.push(f.name + ' (format tidak didukung)');
                    return;
                }

                if (f.size > LIM) {
                    bad.push(f.name + ' (lebih dari 5 MB)');
                    return;
                }

                if (
                    files.some(function (x) {
                        return x.file.name === f.name && x.file.size === f.size;
                    })
                ) {
                    return;
                }

                if (files.length >= MAX) {
                    bad.push(f.name + ' (maksimal ' + MAX + ' file)');
                    return;
                }

                files.push({ file: f, url: kind(f) === 'img' ? URL.createObjectURL(f) : '' });
            });

            draw();

            if (bad.length) {
                Alert.error('Tidak ditambahkan: ' + bad.join('; ') + '.', 'Lampiran gagal');
            }
        }

        function draw() {
            $('fl').innerHTML = files
                .map(function (x, i) {
                    return (
                        '<div class="fi"><div class="fth">' +
                        (x.url ? '<img src="' + x.url + '" alt="">' : PDF) +
                        '</div><div class="fn"><b>' +
                        esc(x.file.name) +
                        '</b><span>' +
                        sz(x.file.size) +
                        '</span></div><button type="button" class="rm" data-rm="' +
                        i +
                        '" aria-label="Hapus ' +
                        esc(x.file.name) +
                        '">' +
                        X +
                        '</button></div>'
                    );
                })
                .join('');
            $('fc').textContent = files.length + '/' + MAX + ' file';
            $('pick').disabled = $('cam').disabled = files.length >= MAX;
        }

        $('fl').addEventListener('click', function (e) {
            var b = e.target.closest('[data-rm]');

            if (!b) {
                return;
            }

            var x = files.splice(+b.dataset.rm, 1)[0];

            if (x && x.url) {
                URL.revokeObjectURL(x.url);
            }

            draw();
        });

        $('pick').onclick = function () {
            $('fin').click();
        };

        $('fin').onchange = function () {
            add(this.files);
            this.value = '';
        };

        $('cin').onchange = function () {
            add(this.files);
            this.value = '';
        };

        var dz = $('dz');

        ['dragenter', 'dragover'].forEach(function (n) {
            dz.addEventListener(n, function (e) {
                e.preventDefault();
                dz.classList.add('on');
            });
        });

        ['dragleave', 'drop'].forEach(function (n) {
            dz.addEventListener(n, function (e) {
                e.preventDefault();
                dz.classList.remove('on');
            });
        });

        dz.addEventListener('drop', function (e) {
            add(e.dataTransfer.files);
        });

        // ---- kamera ----
        $('cam').onclick = function () {
            if (files.length >= MAX) {
                return;
            }

            if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                $('cin').click();
                return;
            }

            var ov = document.createElement('div'),
                stream;

            ov.className = 'md-ov';
            ov.innerHTML =
                '<div class="md" role="dialog" aria-modal="true" aria-label="Ambil foto"><div class="mh"><span>Ambil Foto</span><button type="button" class="mx" data-c aria-label="Tutup">' +
                X +
                '</button></div><div class="mb"><video class="cv" playsinline muted></video></div><div class="mf"><button type="button" class="btn" data-c>Batal</button><button type="button" class="btn go" id="shot" disabled>Ambil Foto</button></div></div>';
            root.appendChild(ov);

            var v = ov.querySelector('video'),
                shot = ov.querySelector('#shot');

            function close() {
                if (stream) {
                    stream.getTracks().forEach(function (t) {
                        t.stop();
                    });
                }

                ov.remove();
                document.removeEventListener('keydown', esk);
            }

            function esk(e) {
                if (e.key === 'Escape') {
                    close();
                }
            }

            document.addEventListener('keydown', esk);
            ov.addEventListener('click', function (e) {
                if (e.target === ov || e.target.closest('[data-c]')) {
                    close();
                }
            });
            navigator.mediaDevices
                .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
                .then(function (s) {
                    if (!ov.isConnected) {
                        s.getTracks().forEach(function (t) {
                            t.stop();
                        });
                        return;
                    }

                    stream = s;
                    v.srcObject = s;
                    v.play();
                    shot.disabled = false;
                    shot.focus();
                })
                .catch(function () {
                    close();
                    Alert.error(
                        'Kamera tidak dapat diakses. Periksa izin kamera pada browser Anda atau gunakan Pilih File.',
                        'Kamera gagal',
                    );
                });
            shot.onclick = function () {
                var c = document.createElement('canvas');

                c.width = v.videoWidth;
                c.height = v.videoHeight;
                c.getContext('2d').drawImage(v, 0, 0);
                c.toBlob(function (b) {
                    if (!b) {
                        return;
                    }

                    var d = new Date(),
                        p = function (n) {
                            return ('0' + n).slice(-2);
                        };

                    add([
                        new File(
                            [b],
                            'foto-' +
                                d.getFullYear() +
                                p(d.getMonth() + 1) +
                                p(d.getDate()) +
                                '-' +
                                p(d.getHours()) +
                                p(d.getMinutes()) +
                                p(d.getSeconds()) +
                                '.jpg',
                            { type: 'image/jpeg' },
                        ),
                    ]);
                    close();
                }, 'image/jpeg', 0.9);
            };
        };

        // ---- kirim ----
        // Sambungkan ke server: definisikan window.saranKirim({saran,files}) yang mengembalikan Promise.
        var kirim =
            window.saranKirim ||
            function () {
                return new Promise(function (r) {
                    setTimeout(r, 700);
                });
            };

        $('send').onclick = function () {
            var t = $('sr').value.trim();

            if (!t) {
                $('se').textContent = 'Saran wajib diisi.';
                $('sr').classList.add('bad');
                $('sr').focus();
                return;
            }

            Alert.save({
                title: 'Kirim saran?',
                message: 'Saran beserta lampiran Anda akan dikirim.',
                yes: 'Ya, kirim',
                no: 'Batal',
            }).then(function (ok) {
                if (!ok) {
                    return;
                }

                var b = $('send');

                b.disabled = true;
                b.textContent = 'Mengirim…';

                var data = {
                    saran: t,
                    files: files.map(function (x) {
                        return x.file;
                    }),
                };

                document.dispatchEvent(new CustomEvent('saran-kirim', { detail: data }));

                Promise.resolve(kirim(data))
                    .then(
                        function () {
                            files.forEach(function (x) {
                                if (x.url) {
                                    URL.revokeObjectURL(x.url);
                                }
                            });
                            files = [];
                            draw();
                            $('sr').value = '';
                            $('cn').textContent = '0/2000';
                            Alert.success('Saran Anda berhasil dikirim. Terima kasih!');
                        },
                        function () {
                            Alert.error('Saran gagal dikirim. Silakan coba lagi.');
                        },
                    )
                    .then(function () {
                        b.disabled = false;
                        b.textContent = 'Kirim Saran';
                    });
            });
        };

        draw();
    })();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSaran);
} else {
    initSaran();
}

document.addEventListener('livewire:navigated', initSaran);
