const permohonanSayaRoots = new WeakSet();

function initPermohonanSaya() {
    const root = document.getElementById('permohonan-saya');

    if (!root || permohonanSayaRoots.has(root)) {
        return;
    }

    permohonanSayaRoots.add(root);

    // ---- alert ----
    window.Alert = (function () {
        var SVG = {
            ok: '<circle class="bg" cx="42" cy="42" r="38"/><circle class="rg" cx="42" cy="42" r="38"/><path class="ck" d="M26 43l11 11 21-23"/>',
            er: '<circle class="bg" cx="42" cy="42" r="38"/><circle class="rg" cx="42" cy="42" r="38"/><path class="x1" d="M31 31l22 22"/><path class="x2" d="M53 31L31 53"/>',
            q: '<circle class="bg" cx="42" cy="42" r="38"/><circle class="rg" cx="42" cy="42" r="38"/><path class="qm" d="M33.5 34a8.5 8.5 0 1112 7.7c-2.4 1.1-3.5 2.6-3.5 5.3M42 56v.01"/>',
            lo: '<circle class="bg" cx="42" cy="42" r="38"/><circle class="rg" cx="42" cy="42" r="38"/><path class="qm" d="M37 29h-6a3 3 0 00-3 3v20a3 3 0 003 3h6M40 42h19M52 34.5l7.5 7.5-7.5 7.5"/>',
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
                    icon = o.icon || (kind === 'q' && o.danger ? 'w' : kind),
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
                }
            });
        }

        return {
            confirm: function (o) {
                o = o || {};

                return show({
                    kind: 'q',
                    icon: o.icon,
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
                    icon: 'lo',
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
        var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        var DP = 'permohonan-dummy.pdf',
            DI = 'permohonan-dummy.png',
            MAXF = 5,
            LIM = 5 * 1048576;

        function F(t, n, s) {
            return { t: t, n: n, s: s, u: t === 'pdf' ? DP : DI };
        }

        var APV = { n: 'Fadhilah Fathul Janah', r: 'Atasan Langsung (Pemberi Izin)' };

        // Data contoh (ganti dengan data dari server). st: draft | menunggu | disetujui | ditolak | batal
        var all = [
            {
                id: 1,
                jenis: 'Izin Keluar Kantor',
                dibuat: '2026-11-12T09:05',
                tgl: '2026-11-12',
                kep: 'Test fitur form bohongan',
                files: [],
                st: 'draft',
            },
            {
                id: 2,
                jenis: 'Izin Keluar Kantor',
                dibuat: '2026-11-12T10:20',
                tgl: '2026-11-12',
                kep: 'Tets',
                files: [],
                st: 'menunggu',
                ap: APV,
            },
            {
                id: 3,
                jenis: 'Izin Keluar Kantor',
                dibuat: '2026-11-13T08:10',
                tgl: '2026-11-13',
                kep: 'test fitur perbaikan senpai mohon abaikan surat izin ini',
                files: [
                    F('img', 'headline_img.png', 645000),
                    F('pdf', 'Form-Kaizen-KZN-2026-0000123.pdf', 126000),
                    F('img', 'lampiran-foto-1794541795596.png', 19000),
                ],
                st: 'batal',
            },
            {
                id: 4,
                jenis: 'Izin Keluar Kantor',
                dibuat: '2026-11-12T08:45',
                tgl: '2026-11-12',
                kep: 'Hehe',
                files: [],
                st: 'ditolak',
                alasan: 'a',
            },
            {
                id: 5,
                jenis: 'Izin Keluar Kantor',
                dibuat: '2026-11-12T08:30',
                tgl: '2026-11-12',
                kep: 'Test',
                files: [],
                st: 'ditolak',
                alasan: 'a',
            },
            {
                id: 6,
                jenis: 'Form Pengajuan Absensi',
                dibuat: '2026-11-10T16:52',
                tgl: '2026-11-10',
                kep: 'Tidak Absen / Lupa Absen',
                files: [],
                st: 'disetujui',
                ap: { n: 'DODDY AL FIQRI', r: 'Kepala Bagian' },
            },
            {
                id: 7,
                jenis: 'Izin Sakit',
                dibuat: '2026-11-07T07:30',
                tgl: '2026-11-07',
                kep: 'Demam dan flu, istirahat sesuai anjuran dokter.',
                surat: F('pdf', 'surat-dokter-0711.pdf', 312000),
                files: [F('img', 'hasil-lab.jpg', 880000)],
                st: 'disetujui',
                ap: { n: 'Fadhilah Fathul Janah', r: 'Atasan Langsung (Pemberi Izin)' },
            },
            {
                id: 8,
                jenis: 'Izin Keluar Kantor',
                dibuat: '2026-11-05T09:15',
                tgl: '2026-11-05',
                kep: 'Mengurus dokumen kendaraan di Samsat.',
                files: [],
                st: 'disetujui',
                ap: { n: 'DODDY AL FIQRI', r: 'Kepala Bagian' },
            },
            {
                id: 9,
                jenis: 'Form Pengajuan Absensi',
                dibuat: '2026-11-03T17:20',
                tgl: '2026-11-03',
                kep: 'Lupa absen pulang',
                files: [],
                st: 'batal',
            },
        ];

        var $ = function (id) {
                return root.querySelector('#' + id);
            },
            TABS = ['draft', 'menunggu', 'riwayat'],
            curUp = null,
            curKind = 'lamp',
            camStream = null;

        function S(d) {
            return '<svg class="i" viewBox="0 0 16 16">' + d + '</svg>';
        }

        var I = {
            clip: S(
                '<path d="M12.5 7.5l-4.8 4.8a3 3 0 01-4.2-4.2l5-5a2 2 0 112.8 2.8l-5 5a1 1 0 01-1.4-1.4l4.6-4.6"/>',
            ),
            up: S('<path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v3h11v-3"/>'),
            pdf: '<svg class="i pdf" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M9.5 1.5v3h3M5.5 9h5M5.5 11.5h5"/></svg>',
            img: S(
                '<rect x="2" y="2.5" width="12" height="11" rx="1.5"/><circle cx="6" cy="6.3" r="1.2"/><path d="M2.5 12l3.5-3.5 3 3 2-2 2.5 2.5"/>',
            ),
            eye: S(
                '<path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/>',
            ),
            dl: S('<path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5M2.5 13.5h11"/>'),
            ban: S('<circle cx="8" cy="8" r="6"/><path d="M3.8 12.2l8.4-8.4"/>'),
            pen: S('<path d="M11 2.5l2.5 2.5L5.5 13H3v-2.5L11 2.5z"/>'),
            send: S('<path d="M14 2L7 9M14 2l-4.5 12-2.5-5.5L1.5 6z"/>'),
            trash: S('<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5"/>'),
            clock: S('<circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/>'),
            check: S('<path d="M3.5 8.5l3 3 6-6.5"/>'),
            info: S('<circle cx="8" cy="8" r="6.5"/><path d="M8 7.2V11M8 4.8v.01"/>'),
            cam: S(
                '<path d="M2 5.5h2.5L5.7 4h4.6l1.2 1.5H14v7H2z"/><circle cx="8" cy="8.8" r="2.2"/>',
            ),
            x: S('<path d="M4 4l8 8M12 4l-8 8"/>'),
        };

        function esc(v) {
            return String(v == null ? '' : v)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;');
        }

        function fmt(s) {
            var p = s.slice(0, 10).split('-');

            return +p[2] + ' ' + MON[p[1] - 1] + ' ' + p[0];
        }

        function fmtT(s) {
            return s.slice(11, 16);
        }

        function sz(n) {
            return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
        }

        function ini(n) {
            return n
                .split(/\s+/)
                .slice(0, 2)
                .map(function (w) {
                    return w[0];
                })
                .join('')
                .toUpperCase();
        }

        function get(id) {
            return all.filter(function (r) {
                return r.id === id;
            })[0];
        }

        function emit(n, d) {
            document.dispatchEvent(new CustomEvent(n, { detail: d }));
        }

        function by(st) {
            return all.filter(function (r) {
                return st.indexOf(r.st) >= 0;
            });
        }

        // ---- komponen ----
        function link(f) {
            return (
                '<a class="fr" href="' +
                esc(f.u) +
                '" target="_blank" rel="noopener" title="' +
                esc(f.n) +
                '">' +
                (f.t === 'pdf' ? I.pdf : I.img) +
                '<span class="tx"><span class="n">' +
                esc(f.n) +
                '</span><span class="s">' +
                sz(f.s) +
                '</span></span></a>'
            );
        }

        function ubtns(r, a, c, full, cls) {
            var d = full ? ' disabled title="Maksimal 5 berkas"' : '';

            return (
                '<div class="' +
                cls +
                '"><button type="button" class="btn sm" data-a="' +
                a +
                '" data-id="' +
                r.id +
                '"' +
                d +
                '>' +
                I.up +
                'Unggah</button><button type="button" class="btn sm" data-a="' +
                c +
                '" data-id="' +
                r.id +
                '"' +
                d +
                '>' +
                I.cam +
                'Foto</button></div>'
            );
        }

        function lampiran(r) {
            var n = r.files.length;

            return (
                '<div class="lm"><div class="lh">' +
                I.clip +
                '<b>Lampiran</b><span class="pl">' +
                (n ? n + ' berkas' : 'Belum ada') +
                '</span>' +
                ubtns(r, 'up', 'cam', n >= MAXF, 'ubt') +
                '</div>' +
                (n
                    ? '<div class="fl">' +
                      r.files
                          .map(function (f) {
                              return link(f);
                          })
                          .join('') +
                      '</div>'
                    : '<p class="em">Tidak ada lampiran.</p>') +
                '</div>'
            );
        }

        function meta(r) {
            return (
                '<div class="mg"><div class="mi"><small>Tanggal</small>' +
                fmt(r.tgl) +
                '</div><div class="mi"><small>Dibuat</small>' +
                fmt(r.dibuat) +
                ', ' +
                fmtT(r.dibuat) +
                '</div><div class="mi w"><small>Keperluan</small>' +
                esc(r.kep) +
                '</div></div>'
            );
        }

        function badge(r) {
            var m = {
                draft: ['', 'Draft'],
                menunggu: ['wr', 'Menunggu Tanda Tangan'],
                disetujui: ['ok', 'Disetujui'],
                ditolak: ['er', 'Ditolak'],
                batal: ['', 'Dibatalkan Pemohon'],
            }[r.st];

            return '<span class="bdg ' + m[0] + '">' + m[1] + '</span>';
        }

        function detail(r) {
            if (r.st === 'disetujui') {
                return '<div class="sd">Disetujui oleh <b>' + esc(r.ap.n) + '</b><br><span class="mu">' + esc(r.ap.r) + '</span></div>';
            }

            if (r.st === 'ditolak') {
                return '<div class="rj">Alasan penolakan: ' + esc(r.alasan || '-') + '</div>';
            }

            if (r.st === 'batal') {
                return '<div class="sd mu">Dibatalkan oleh pemohon</div>';
            }

            return '';
        }

        function step(c, ic, l) {
            return '<div class="sp ' + c + '"><span class="sc">' + ic + '</span><span>' + l + '</span></div>';
        }

        // ---- render ----
        function draftCard(r) {
            return (
                '<article class="cd"><div class="ch"><span class="ct">' +
                esc(r.jenis) +
                '</span>' +
                badge(r) +
                '</div><div class="cb">' +
                meta(r) +
                lampiran(r) +
                '<div class="ci">' +
                I.info +
                '<span>Draft ini belum dikirim. Periksa data dan lampiran, lalu klik <b>Kirim</b> agar diproses oleh atasan.</span></div></div>' +
                '<div class="ca"><button type="button" class="btn" data-a="edit" data-id="' +
                r.id +
                '">' +
                I.pen +
                'Edit</button><button type="button" class="btn go" data-a="kirim" data-id="' +
                r.id +
                '">' +
                I.send +
                'Kirim</button><button type="button" class="btn dg" data-a="hapus" data-id="' +
                r.id +
                '">' +
                I.trash +
                'Hapus</button></div></article>'
            );
        }

        function waitCard(r) {
            return (
                '<article class="cd"><div class="ch"><span class="ct">' +
                esc(r.jenis) +
                '</span>' +
                badge(r) +
                '</div><div class="cb">' +
                meta(r) +
                lampiran(r) +
                '<div class="ap"><span class="av">' +
                esc(ini(r.ap.n)) +
                '</span><span>Menunggu approval dari <b>' +
                esc(r.ap.n) +
                '</b></span><span class="pl">' +
                esc(r.ap.r) +
                '</span></div>' +
                '<div class="alr"><p class="alt">Alur persetujuan</p><div class="stp">' +
                step('done', I.check, 'Ajuan') +
                '<span class="ln done"></span>' +
                step('cur', I.clock, 'Menunggu Approval') +
                '<span class="ln"></span>' +
                step('', I.check, 'Selesai') +
                '</div></div></div>' +
                '<div class="ca"><button type="button" class="btn" data-a="edit" data-id="' +
                r.id +
                '">' +
                I.pen +
                'Edit</button></div></article>'
            );
        }

        function row(r) {
            var n = r.files.length;

            return (
                '<tr><td data-l="Tanggal Dibuat"><div class="b">' +
                fmt(r.dibuat) +
                '</div><div class="mu sm2">' +
                fmtT(r.dibuat) +
                '</div></td>' +
                '<td data-l="Tanggal Dilakukan"><div class="b">' +
                fmt(r.tgl) +
                '</div><div class="mu sm2">' +
                esc(r.jenis) +
                '</div></td>' +
                '<td class="s2" data-l="Surat Dokter">' +
                (r.surat ? '<div class="fl z">' + link(r.surat) + '</div>' : '<span class="mu">-</span>') +
                '' +
                ubtns(r, 'upsd', 'camsd', false, 'ubs') +
                '</td>' +
                '<td class="w" data-l="Lampiran">' +
                (n
                    ? '<div class="fl z">' +
                      r.files
                          .map(function (f) {
                              return link(f);
                          })
                          .join('') +
                      '</div>'
                    : '<span class="mu">-</span>') +
                '' +
                ubtns(r, 'up', 'cam', n >= MAXF, 'ubs') +
                '</td>' +
                '<td class="w" data-l="Status">' +
                badge(r) +
                detail(r) +
                '</td>' +
                '<td class="w" data-l="Aksi"><div class="ab"><button type="button" class="btn sm" data-a="prev" data-id="' +
                r.id +
                '">' +
                I.eye +
                'Preview</button>' +
                '<button type="button" class="btn sm dg" data-a="batal" data-id="' +
                r.id +
                '"' +
                (r.st === 'disetujui' ? '' : ' disabled title="Hanya permohonan yang disetujui yang dapat dibatalkan"') +
                '>' +
                I.ban +
                'Batal</button>' +
                '<button type="button" class="btn sm" data-a="dl" data-id="' +
                r.id +
                '">' +
                I.dl +
                'Download</button></div></td></tr>'
            );
        }

        function render() {
            var d = by(['draft']),
                m = by(['menunggu']),
                h = by(['disetujui', 'ditolak', 'batal']).sort(function (a, b) {
                    return a.dibuat < b.dibuat ? 1 : -1;
                });

            $('c-draft').textContent = d.length;
            $('c-menunggu').textContent = m.length;
            $('c-riwayat').textContent = h.length;
            $('p-draft').innerHTML = d.length
                ? d.map(draftCard).join('')
                : '<div class="emp2">Tidak ada draft permohonan.</div>';
            $('p-menunggu').innerHTML = m.length
                ? m.map(waitCard).join('')
                : '<div class="emp2">Tidak ada permohonan yang menunggu.</div>';
            $('p-riwayat').innerHTML = h.length
                ? '<div class="box"><table class="rt"><thead><tr><th class="c2">Tanggal Dibuat</th><th class="c3">Tanggal Dilakukan</th><th class="c4">Surat Dokter</th><th class="c5">Lampiran</th><th class="c6">Status</th><th class="c7">Aksi</th></tr></thead><tbody>' +
                  h.map(row).join('') +
                  '</tbody></table></div>'
                : '<div class="emp2">Belum ada riwayat permohonan.</div>';
        }

        function setTab(t, focus) {
            TABS.forEach(function (k) {
                var on = k === t;

                $('t-' + k).setAttribute('aria-selected', on);
                $('t-' + k).tabIndex = on ? 0 : -1;
                $('p-' + k).hidden = !on;

                if (on && focus) {
                    $('t-' + k).focus();
                }
            });
        }

        root.querySelector('.tabs').addEventListener('click', function (e) {
            var b = e.target.closest('[data-tab]');

            if (b) {
                setTab(b.dataset.tab);
            }
        });

        root.querySelector('.tabs').addEventListener('keydown', function (e) {
            var i = TABS.indexOf(document.activeElement.dataset.tab);

            if (i < 0) {
                return;
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                setTab(TABS[(i + 1) % 3], true);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setTab(TABS[(i + 2) % 3], true);
            }
        });

        // ---- modal ----
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
                if (onClose) {
                    onClose();
                }

                ov.remove();
                document.body.style.overflow = '';
                document.removeEventListener('keydown', k);

                if (from && from.isConnected) {
                    from.focus();
                }
            }

            function k(e) {
                if (e.key === 'Escape' && !root.querySelector('.ov2')) {
                    close();
                }
            }

            document.addEventListener('keydown', k);
            ov.addEventListener('click', function (e) {
                if (e.target === ov || e.target.closest('[data-c]')) {
                    close();
                }
            });

            return { el: ov, close: close };
        }

        function preview(r, from) {
            var n = r.files.length;
            var m = mdl(
                'Detail Permohonan',
                '<dl class="dl"><dt>Jenis</dt><dd>' +
                    esc(r.jenis) +
                    '</dd><dt>Tanggal Dibuat</dt><dd>' +
                    fmt(r.dibuat) +
                    ', ' +
                    fmtT(r.dibuat) +
                    '</dd><dt>Tanggal Dilakukan</dt><dd>' +
                    fmt(r.tgl) +
                    '</dd><dt>Keperluan</dt><dd>' +
                    esc(r.kep) +
                    '</dd><dt>Status</dt><dd>' +
                    badge(r) +
                    detail(r) +
                    '</dd><dt>Surat Dokter</dt><dd>' +
                    (r.surat ? '<div class="fl z">' + link(r.surat) + '</div>' : '<span class="mu">-</span>') +
                    '</dd></dl>' +
                    '<p class="lb">Lampiran (' +
                    n +
                    ')</p>' +
                    (n
                        ? '<div class="fl">' +
                          r.files
                              .map(function (f) {
                                  return link(f);
                              })
                              .join('') +
                          '</div>'
                        : '<span class="mu">Tidak ada lampiran.</span>'),
                '<button type="button" class="btn" data-a="dl" data-id="' +
                    r.id +
                    '">' +
                    I.dl +
                    'Download</button><button type="button" class="btn go" data-c>Tutup</button>',
                from,
            );

            m.el.querySelector('.go').focus();
            emit('permohonan-preview', r);
        }

        function edit(r, from) {
            var m = mdl(
                'Edit Permohonan',
                '<div class="fg"><label for="e-tgl">Tanggal</label><input class="fld" type="date" id="e-tgl" value="' +
                    esc(r.tgl) +
                    '"><p class="er" id="e1"></p></div>' +
                    '<div class="fg"><label for="e-kep">Keperluan</label><textarea class="fld" id="e-kep" maxlength="500">' +
                    esc(r.kep) +
                    '</textarea><p class="er" id="e2"></p></div>',
                '<button type="button" class="btn" data-c>Batal</button><button type="button" class="btn go" id="e-sv">Simpan</button>',
                from,
            );

            m.el.querySelector('#e-kep').focus();
            m.el.querySelector('#e-sv').onclick = function () {
                var t = m.el.querySelector('#e-tgl').value,
                    k = m.el.querySelector('#e-kep').value.trim();

                m.el.querySelector('#e1').textContent = t ? '' : 'Tanggal wajib diisi.';
                m.el.querySelector('#e2').textContent = k ? '' : 'Keperluan wajib diisi.';

                if (!t || !k) {
                    return;
                }

                r.tgl = t;
                r.kep = k;
                m.close();
                render();
                emit('permohonan-edit', r);
                Alert.success('Permohonan berhasil diperbarui.');
            };
        }

        // ---- aksi ----
        function kirim(r) {
            Alert.save({
                title: 'Kirim permohonan?',
                message: 'Permohonan akan dikirim ke atasan untuk diproses.',
                yes: 'Ya, kirim',
                no: 'Batal',
            }).then(function (ok) {
                if (!ok) {
                    return;
                }

                r.st = 'menunggu';
                r.ap = APV;
                render();
                setTab('menunggu');
                emit('permohonan-kirim', r);
                Alert.success('Permohonan berhasil dikirim.');
            });
        }

        function hapus(r) {
            Alert.confirm({
                title: 'Hapus draft?',
                message: 'Draft yang dihapus tidak dapat dikembalikan.',
                yes: 'Ya, hapus',
                no: 'Tidak',
                danger: true,
            }).then(function (ok) {
                if (!ok) {
                    return;
                }

                all.splice(all.indexOf(r), 1);
                render();
                emit('permohonan-hapus', r);
                Alert.success('Draft berhasil dihapus.');
            });
        }

        function batal(r) {
            Alert.confirm({
                title: 'Batalkan permohonan?',
                message: 'Permohonan yang sudah disetujui akan dibatalkan dan tidak dapat dikembalikan.',
                yes: 'Ya, batalkan',
                no: 'Tidak',
                danger: true,
            }).then(function (ok) {
                if (!ok) {
                    return;
                }

                r.st = 'batal';
                render();
                emit('permohonan-batal', r);
                Alert.success('Permohonan berhasil dibatalkan.');
            });
        }

        function download(r) {
            var a = document.createElement('a');

            a.href = DP;
            a.download = 'Permohonan-' + r.jenis.replace(/\s+/g, '-') + '-' + r.tgl + '.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            emit('permohonan-download', r);
        }

        document.addEventListener('click', function (e) {
            if (!root.isConnected) {
                return;
            }

            var b = e.target.closest('[data-a]');

            if (!b || b.disabled) {
                return;
            }

            var r = get(+b.dataset.id),
                a = b.dataset.a;

            if (!r) {
                return;
            }

            if (a === 'up' || a === 'upsd') {
                curUp = r.id;
                curKind = a === 'up' ? 'lamp' : 'sd';
                $('fin').multiple = a === 'up';
                $('fin').click();
            } else if (a === 'cam' || a === 'camsd') {
                camera(r, a === 'camsd', b);
            } else if (a === 'edit') {
                edit(r, b);
            } else if (a === 'kirim') {
                kirim(r);
            } else if (a === 'hapus') {
                hapus(r);
            } else if (a === 'prev') {
                preview(r, b);
            } else if (a === 'batal') {
                batal(r);
            } else if (a === 'dl') {
                download(r);
            }
        });

        function addFiles(r, list, sd) {
            var bad = [];

            if (sd) {
                list = list.slice(0, 1);
            }

            list.forEach(function (f) {
                var e = (f.name.split('.').pop() || '').toLowerCase(),
                    k = f.type === 'application/pdf' || e === 'pdf' ? 'pdf' : /^image\/(jpeg|png)$/.test(f.type) || /^(jpe?g|png)$/.test(e) ? 'img' : '';

                if (!k) {
                    bad.push(f.name + ' (format tidak didukung)');
                    return;
                }

                if (f.size > LIM) {
                    bad.push(f.name + ' (lebih dari 5 MB)');
                    return;
                }

                var o = { t: k, n: f.name, s: f.size, u: URL.createObjectURL(f) };

                if (sd) {
                    r.surat = o;
                    return;
                }

                if (r.files.length >= MAXF) {
                    bad.push(f.name + ' (maksimal ' + MAXF + ' berkas)');
                    return;
                }

                r.files.push(o);
            });

            render();
            emit('permohonan-unggah', { permohonan: r, tipe: sd ? 'surat-dokter' : 'lampiran' });

            if (bad.length) {
                Alert.error('Tidak ditambahkan: ' + bad.join('; ') + '.', sd ? 'Surat dokter gagal' : 'Lampiran gagal');
            } else if (list.length) {
                Alert.success(sd ? 'Surat dokter berhasil diunggah.' : 'Lampiran berhasil ditambahkan.');
            }
        }

        function onFiles() {
            var r = get(curUp),
                l = [].slice.call(this.files);

            this.value = '';

            if (r) {
                addFiles(r, l, curKind === 'sd');
            }
        }

        $('fin').onchange = onFiles;
        $('cin').onchange = onFiles;

        // ---- foto dari kamera ----
        function camera(r, sd, from) {
            if (!sd && r.files.length >= MAXF) {
                Alert.error('Maksimal ' + MAXF + ' berkas lampiran.');
                return;
            }

            if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                curUp = r.id;
                curKind = sd ? 'sd' : 'lamp';
                $('cin').click();
                return;
            }

            var stream = null;
            var m = mdl(
                'Ambil Foto',
                '<video class="cv" playsinline muted></video>',
                '<button type="button" class="btn" data-c>Batal</button><button type="button" class="btn go" id="shot" disabled>' +
                    I.cam +
                    'Ambil Foto</button>',
                from,
                function () {
                    if (stream) {
                        stream.getTracks().forEach(function (t) {
                            t.stop();
                        });
                    }

                    camStream = null;
                },
            );
            var v = m.el.querySelector('video'),
                shot = m.el.querySelector('#shot');

            navigator.mediaDevices
                .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
                .then(function (s) {
                    if (!m.el.isConnected) {
                        s.getTracks().forEach(function (t) {
                            t.stop();
                        });
                        return;
                    }

                    stream = s;
                    camStream = s;
                    v.srcObject = s;
                    v.play();
                    shot.disabled = false;
                    shot.focus();
                })
                .catch(function () {
                    m.close();
                    Alert.error(
                        'Kamera tidak dapat diakses. Periksa izin kamera pada browser Anda atau gunakan Unggah.',
                        'Kamera gagal',
                    );
                });
            shot.onclick = function () {
                var c = document.createElement('canvas');

                c.width = v.videoWidth;
                c.height = v.videoHeight;
                c.getContext('2d').drawImage(v, 0, 0);
                c.toBlob(
                    function (b) {
                        if (!b) {
                            return;
                        }

                        var d = new Date(),
                            p = function (n) {
                                return ('0' + n).slice(-2);
                            };

                        m.close();
                        addFiles(
                            r,
                            [
                                new File([b], 'foto-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + '.jpg', {
                                    type: 'image/jpeg',
                                }),
                            ],
                            sd,
                        );
                    },
                    'image/jpeg',
                    0.9,
                );
            };
        }

        render();

        document.addEventListener('livewire:navigating', function () {
            if (!root.isConnected) {
                return;
            }

            root.querySelectorAll('.md-ov, .ov2').forEach(function (el) {
                el.remove();
            });

            if (camStream) {
                camStream.getTracks().forEach(function (t) {
                    t.stop();
                });
                camStream = null;
            }

            document.body.style.overflow = '';
        });
    })();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPermohonanSaya);
} else {
    initPermohonanSaya();
}

document.addEventListener('livewire:navigated', initPermohonanSaya);
