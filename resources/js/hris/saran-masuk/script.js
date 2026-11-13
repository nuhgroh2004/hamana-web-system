const initializedRoots = new WeakSet();

function initSaranMasuk() {
    const root = document.getElementById('saran-masuk');

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
        // Data contoh (ganti dengan data dari server). Tiap lampiran: [jenis "pdf"/"img", nama, ukuran byte, url]
        var DP = 'saran-dummy.pdf',
            DI = 'saran-dummy.png';

        function F(t, n, s) {
            return { t: t, n: n, s: s, u: t === 'pdf' ? DP : DI };
        }

        var all = [
            [
                '1026.29.01.04',
                'Budi Santoso',
                'Mohon ruang istirahat karyawan shift malam ditambah AC dan kursi yang lebih nyaman.\nSaat ini ruangan terlalu panas dan sempit ketika jam pergantian shift.',
                [F('img', 'ruang-istirahat-1.jpg', 1240000), F('img', 'ruang-istirahat-2.jpg', 980000), F('pdf', 'usulan-fasilitas.pdf', 420000)],
                '13 Nov 2026, 08:42',
            ],
            [
                '1026.29.01.05',
                'Siti Rahmawati',
                'Proses pengajuan cuti sebaiknya bisa dilakukan lewat aplikasi agar lebih cepat.',
                [],
                '12 Nov 2026, 16:05',
            ],
            [
                '1027.30.02.11',
                'Andi Pratama',
                'Jalur keluar masuk kendaraan di area parkir belakang perlu diberi marka dan rambu agar tidak saling berpapasan.',
                [F('img', 'area-parkir.png', 2100000)],
                '12 Nov 2026, 10:21',
            ],
            [
                '1026.29.03.02',
                'Dewi Lestari',
                'Terima kasih atas pelatihan keselamatan kerja bulan lalu, sangat bermanfaat. Semoga bisa diadakan rutin tiap kuartal.',
                [],
                '11 Nov 2026, 14:30',
            ],
            [
                '1028.31.01.07',
                'Rudi Hartono',
                'Kantin perlu menambah pilihan menu sehat dan harga yang lebih terjangkau.',
                [F('pdf', 'survei-menu-kantin.pdf', 610000), F('img', 'menu-1.jpg', 870000)],
                '11 Nov 2026, 09:12',
            ],
            [
                '1026.29.01.09',
                'Maya Anggraini',
                'Jadwal rapat mingguan sering molor. Mohon ditetapkan batas waktu dan agenda yang dibagikan sehari sebelumnya.',
                [],
                '10 Nov 2026, 17:48',
            ],
            [
                '1027.30.04.03',
                'Fajar Nugroho',
                'Terdapat kebocoran atap di gudang sisi timur. Mohon segera diperbaiki sebelum musim hujan.',
                [
                    F('img', 'atap-bocor-1.jpg', 1530000),
                    F('img', 'atap-bocor-2.jpg', 1470000),
                    F('img', 'atap-bocor-3.jpg', 1390000),
                    F('pdf', 'laporan-kerusakan.pdf', 530000),
                    F('img', 'denah-gudang.png', 720000),
                ],
                '10 Nov 2026, 08:03',
            ],
            [
                '1026.29.02.06',
                'Lina Marlina',
                'Mohon dipertimbangkan jam kerja fleksibel untuk karyawan administrasi.',
                [],
                '09 Nov 2026, 13:19',
            ],
            [
                '1028.31.02.01',
                'Hendra Wijaya',
                'Sistem absensi sering gagal membaca sidik jari pada pagi hari. Mohon dicek perangkatnya.',
                [F('img', 'layar-error.jpg', 640000)],
                '09 Nov 2026, 07:55',
            ],
            [
                '1026.29.01.12',
                'Rina Puspita',
                'Pengumuman internal sebaiknya dikirim lewat satu kanal saja supaya tidak ada informasi yang terlewat.',
                [],
                '06 Nov 2026, 15:40',
            ],
            [
                '1027.30.01.08',
                'Agus Setiawan',
                'Toilet lantai dua sering kehabisan sabun dan tisu. Mohon dilakukan pengecekan berkala.',
                [F('img', 'toilet-lt2.jpg', 1010000)],
                '05 Nov 2026, 11:27',
            ],
            [
                '1026.29.03.10',
                'Yuni Kartika',
                'Usulan program kesehatan: senam pagi bersama setiap Jumat dan pemeriksaan kesehatan berkala.',
                [F('pdf', 'proposal-program-sehat.pdf', 880000)],
                '04 Nov 2026, 09:00',
            ],
        ].map(function (r, i) {
            return { id: i, nik: r[0], nama: r[1], saran: r[2], files: r[3], tgl: r[4] };
        });
        var SIZE = 10,
            page = 1,
            $ = function (id) {
                return document.getElementById(id);
            },
            tb = $('tb');
        var PDF =
                '<svg class="i pdf" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M9.5 1.5v3h3M5.5 9h5M5.5 11.5h5"/></svg>',
            IMG =
                '<svg class="i img" viewBox="0 0 16 16"><rect x="2" y="2.5" width="12" height="11" rx="1.5"/><circle cx="6" cy="6.3" r="1.2"/><path d="M2.5 12l3.5-3.5 3 3 2-2 2.5 2.5"/></svg>',
            X = '<svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>';

        function esc(v) {
            return String(v == null ? '' : v)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;');
        }

        function ic(f) {
            return f.t === 'pdf' ? PDF : IMG;
        }

        function sz(n) {
            return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
        }

        function render() {
            var pages = Math.max(1, Math.ceil(all.length / SIZE));

            if (page > pages) {
                page = pages;
            }

            var from = (page - 1) * SIZE,
                rows = all.slice(from, from + SIZE);

            tb.innerHTML = rows
                .map(function (r) {
                    return (
                        '<tr data-id="' +
                        r.id +
                        '" tabindex="0" role="button" aria-label="Lihat detail saran dari ' +
                        esc(r.nama) +
                        '"><td class="nw">' +
                        esc(r.nik) +
                        '</td><td class="nw">' +
                        esc(r.nama) +
                        '</td><td><div class="sx">' +
                        esc(r.saran.replace(/\n/g, ' ')) +
                        '</div></td><td><div class="at">' +
                        (r.files.length
                            ? r.files
                                  .slice(0, 5)
                                  .map(function (f) {
                                      return '<span title="' + esc(f.n) + '">' + ic(f) + '</span>';
                                  })
                                  .join('')
                            : '<span class="mu">-</span>') +
                        '</div></td></tr>'
                    );
                })
                .join('');
            $('empty').hidden = all.length > 0;
            $('cnt').textContent = all.length
                ? 'Menampilkan ' + (from + 1) + '–' + (from + rows.length) + ' dari ' + all.length + ' saran'
                : '0 saran';

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

        // ---- detail ----
        function detail(id, from) {
            var r = all.filter(function (x) {
                return x.id === id;
            })[0];

            if (!r) {
                return;
            }

            var ov = document.createElement('div');

            ov.className = 'md-ov';
            ov.innerHTML =
                '<div class="md" role="dialog" aria-modal="true" aria-label="Detail saran"><div class="mh"><span>Detail Saran</span><button type="button" class="mx" data-c aria-label="Tutup">' +
                X +
                '</button></div><div class="mb">' +
                '<dl class="dl"><dt>NIK</dt><dd>' +
                esc(r.nik) +
                '</dd><dt>Nama</dt><dd>' +
                esc(r.nama) +
                '</dd><dt>Tanggal</dt><dd>' +
                esc(r.tgl) +
                '</dd></dl>' +
                '<p class="lb">Saran</p><div class="sb">' +
                esc(r.saran) +
                '</div>' +
                '<p class="lb">Lampiran (' +
                r.files.length +
                ')</p>' +
                (r.files.length
                    ? r.files
                          .map(function (f) {
                              return (
                                  '<a class="al" href="' +
                                  esc(f.u) +
                                  '" target="_blank" rel="noopener">' +
                                  ic(f) +
                                  '<span class="n">' +
                                  esc(f.n) +
                                  '</span><span class="s">' +
                                  sz(f.s) +
                                  '</span></a>'
                              );
                          })
                          .join('')
                    : '<span class="mu">Tidak ada lampiran.</span>') +
                '</div><div class="mf"><button type="button" class="btn" data-c>Tutup</button></div></div>';
            root.appendChild(ov);
            document.body.style.overflow = 'hidden';
            ov.querySelector('.mf .btn').focus();

            function close() {
                ov.remove();
                document.body.style.overflow = '';
                document.removeEventListener('keydown', esk);

                if (from && from.focus) {
                    from.focus();
                }
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
            document.dispatchEvent(new CustomEvent('saran-lihat', { detail: r }));
        }

        tb.addEventListener('click', function (e) {
            var t = e.target.closest('tr[data-id]');

            if (t) {
                detail(+t.dataset.id, t);
            }
        });
        tb.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') {
                return;
            }

            var t = e.target.closest('tr[data-id]');

            if (t) {
                e.preventDefault();
                detail(+t.dataset.id, t);
            }
        });
        render();
    })();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSaranMasuk);
} else {
    initSaranMasuk();
}

document.addEventListener('livewire:navigated', initSaranMasuk);
