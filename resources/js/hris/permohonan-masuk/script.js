const permohonanMasukRoots = new WeakSet();

function initPermohonanMasuk() {
    const root = document.getElementById('permohonan-masuk');

    if (!root || permohonanMasukRoots.has(root)) {
        return;
    }

    permohonanMasukRoots.add(root);

    var $ = function (id) {
        return root.querySelector('#' + id);
    };

    var BL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    var BF = [
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
    var ST = {
        menunggu: ['Menunggu', 'w'],
        disetujui: ['Disetujui', 'ok'],
        ditolak: ['Ditolak', 'x'],
        batal: ['Dibatalkan Pemohon', 'g'],
    };
    var SIGNER = { nama: 'ERWIN SUNUNTO', peran: 'Atasan Langsung (Pemberi Izin)' };
    var A4W = 794,
        CPW = 500;

    var TODAY = new Date(),
        THIS_MON = String(TODAY.getMonth()),
        THIS_YR = String(TODAY.getFullYear());

    // Data contoh (ganti dengan data dari server)
    var REQ = [
        {
            id: '1',
            nama: 'M. ALI AGUNG MULYANA ADI SAPUTRA',
            jabatan: 'Operator',
            jenis: 'Izin Keluar Kantor',
            tgl: '2026-11-13',
            status: 'menunggu',
            files: [],
            jam: ['09:30', '11:00'],
            ket: 'Keperluan pribadi',
        },
        {
            id: '2',
            nama: 'Tryas Prayoga Diantoro',
            jabatan: 'Maintenance Officer',
            jenis: 'Izin Keluar Kantor',
            tgl: '2026-11-13',
            status: 'disetujui',
            files: [],
            jam: ['13:06', '15:15'],
            ket: 'Keperluan pribadi',
        },
        {
            id: '3',
            nama: 'Nuhgroh Ramadani',
            jabatan: 'Officer IT',
            jenis: 'Izin Keluar Kantor',
            tgl: '2026-11-13',
            status: 'batal',
            files: ['lampiran-1.jpg', 'lampiran-2.jpg', 'lampiran-3.pdf'],
            jam: ['10:00', '12:00'],
            ket: 'Keperluan pribadi',
        },
        {
            id: '4',
            nama: 'Kharisma Quintya Bilqis',
            jabatan: 'Officer',
            jenis: 'Form Pengajuan Absensi',
            tgl: '2026-11-13',
            status: 'disetujui',
            files: [],
            jam: ['', ''],
            ket: 'Lupa melakukan absensi',
        },
        {
            id: '5',
            nama: 'DODDY AL FIQRI RUSDIANSYAH',
            jabatan: 'Operator',
            jenis: 'Izin Keluar Kantor',
            tgl: '2026-11-13',
            status: 'ditolak',
            files: [],
            jam: ['14:00', '16:00'],
            ket: 'Keperluan pribadi',
        },
    ];

    var q = '',
        stf = 'all',
        mon = THIS_MON,
        yr = THIS_YR,
        dt = '',
        sel = '2';
    var lst = $('lst'),
        dp = $('dpane'),
        wrap = $('wrap'),
        mn = $('mn'),
        ov = $('ov'),
        dtEl = $('dt'),
        dtx = $('dtx');

    function syncDtBtn() {
        dtx.hidden = !dt;
    }

    function esc(v) {
        return String(v == null ? '' : v)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    function emit(n, d) {
        document.dispatchEvent(new CustomEvent(n, { detail: d }));
    }

    function D(r) {
        var p = r.tgl.split('-');

        return new Date(+p[0], +p[1] - 1, +p[2]);
    }

    function dshort(r) {
        var d = D(r);

        return d.getDate() + ' ' + BL[d.getMonth()] + ' ' + d.getFullYear();
    }

    function dlong(r) {
        var d = D(r);

        return d.getDate() + ' ' + BF[d.getMonth()] + ' ' + d.getFullYear();
    }

    function hari(r) {
        return D(r).toLocaleDateString('id-ID', { weekday: 'long' });
    }

    function base() {
        var s = q.trim().toLowerCase();

        return REQ.filter(function (r) {
            var d = D(r);

            return (
                String(d.getFullYear()) === yr &&
                (mon === 'all' || String(d.getMonth()) === mon) &&
                (!dt || r.tgl === dt) &&
                (!s || r.nama.toLowerCase().indexOf(s) >= 0)
            );
        });
    }

    function cur() {
        return REQ.filter(function (r) {
            return r.id === sel;
        })[0];
    }

    // ---- dropdown kustom ----
    var DD = {},
        CK = '<svg class="i ck" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>',
        curBtn = null,
        curDD = null;

    function paint(id) {
        var d = DD[id],
            o = d.opts.filter(function (x) {
                return x[0] === d.val;
            })[0];

        root.querySelectorAll('[data-dd="' + id + '"] .l').forEach(function (el) {
            el.textContent = o ? o[1] : '';
        });
    }

    function closeMenu() {
        mn.hidden = true;
        curBtn = null;
        curDD = null;
    }

    function openDD(btn) {
        var id = btn.dataset.dd,
            d = DD[id];

        mn.innerHTML = d.opts
            .map(function (o) {
                return (
                    '<button type="button" role="option" data-opt="' +
                    esc(o[0]) +
                    '" class="' +
                    (o[0] === d.val ? 'on' : '') +
                    '">' +
                    esc(o[1]) +
                    CK +
                    '</button>'
                );
            })
            .join('');
        var w = Math.max(btn.offsetWidth, 170);

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
            var id = curDD,
                d = DD[id];

            d.val = o.dataset.opt;
            paint(id);
            closeMenu();
            d.cb(d.val);
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

    // ---- surat (A4) ----
    var LOGO =
        '<svg class="lg" viewBox="0 0 140 56" role="img" aria-label="Hamana Works"><ellipse cx="70" cy="28" rx="66" ry="24" fill="none" stroke="currentColor" stroke-width="2.4"/><g fill="currentColor" font-family="\'Arial Black\',\'Helvetica Neue\',Arial,sans-serif" font-weight="900" font-style="italic" font-size="19"><text x="24" y="30" textLength="92" lengthAdjust="spacingAndGlyphs">HAMANA</text><text x="36" y="46" textLength="76" lengthAdjust="spacingAndGlyphs">WORKS</text></g></svg>';

    function fr(l, v) {
        return '<div class="fl"><span>' + l + '</span><span>:</span><div class="v">' + esc(v) + '</div></div>';
    }

    function paper(r) {
        var keluar = r.jenis === 'Izin Keluar Kantor';
        var h =
            LOGO +
            '<h4>' +
            (keluar ? 'SURAT IZIN KELUAR KANTOR' : 'FORM PENGAJUAN ABSENSI') +
            '</h4>' +
            '<p>' +
            (keluar
                ? 'Yang bertanda tangan di bawah ini, dengan ini memberikan izin kepada tersebut karyawan yang namanya tertera di bawah ini untuk izin keluar kantor pada jam kerja:'
                : 'Yang bertanda tangan di bawah ini, dengan ini menyetujui pengajuan absensi karyawan yang namanya tertera di bawah ini:') +
            '</p>' +
            fr('Nama Karyawan', r.nama) +
            fr('Jabatan', r.jabatan) +
            fr('Hari/Tanggal', hari(r) + ', ' + dlong(r));

        if (keluar) {
            h +=
                '<div class="fl"><span>Jam Keluar /Masuk</span><span>:</span><div class="v2"><span>' +
                esc(r.jam[0]) +
                '</span><i>/</i><span>' +
                esc(r.jam[1]) +
                '</span></div></div>';
        }

        h +=
            fr(keluar ? 'Tujuan' : 'Keterangan', r.ket) +
            '<div class="sg"><div><small>Pemberi Izin,</small><div class="sp">' +
            (r.status === 'disetujui' ? '✓ Ditandatangani' : '') +
            '</div><b>' +
            SIGNER.nama +
            '</b></div></div>';

        return '<div class="paper">' + h + '</div>';
    }

    // skala kertas A4 agar selalu utuh sesuai lebar tersedia (host = elemen pembungkus yang punya padding)
    function fit(host, zoom, cap) {
        var f = host.querySelector('.fit'),
            p = f && f.firstElementChild;

        if (!p) {
            return 1;
        }

        var cs = getComputedStyle(host),
            avail = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        var cp = avail < 640,
            pw = cp ? CPW : A4W;

        p.classList.toggle('cp', cp);
        p.style.width = pw + 'px';
        p.style.minHeight = Math.round(pw * 1.4142) + 'px';

        var s = zoom || Math.min(cap || 1, Math.max(0.3, avail / pw));

        p.style.transform = 'scale(' + s + ')';
        f.style.width = pw * s + 'px';
        f.style.height = p.offsetHeight * s + 'px';
        return s;
    }

    // hanya bereaksi pada perubahan LEBAR dan ditunda ke frame berikutnya (menghindari "ResizeObserver loop")
    var ro = null,
        raf = 0,
        lw = -1;

    function watch(host, fn) {
        if (ro) {
            ro.disconnect();
        }

        lw = -1;

        if (!window.ResizeObserver) {
            return;
        }

        ro = new ResizeObserver(function () {
            var w = host.clientWidth;

            if (w === lw) {
                return;
            }

            lw = w;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(fn);
        });
        ro.observe(host);
    }

    // ---- render ----
    function chips() {
        var b = base(),
            c = { all: b.length, menunggu: 0, disetujui: 0, ditolak: 0 };

        b.forEach(function (r) {
            if (c[r.status] != null) {
                c[r.status]++;
            }
        });

        $('chips').innerHTML = [
            ['all', 'Semua'],
            ['menunggu', 'Menunggu'],
            ['disetujui', 'Disetujui'],
            ['ditolak', 'Ditolak'],
        ]
            .map(function (x) {
                return (
                    '<button type="button" class="chip' +
                    (stf === x[0] ? ' on' : '') +
                    '" data-st="' +
                    x[0] +
                    '">' +
                    x[1] +
                    (x[0] === 'menunggu' ? '<em>' + c.menunggu + '</em>' : '') +
                    '</button>'
                );
            })
            .join('');
    }

    var CHK = '<svg class="i" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>';

    function renderList() {
        var L = base().filter(function (r) {
            return stf === 'all' || r.status === stf;
        });

        if (
            L.length &&
            !L.some(function (r) {
                return r.id === sel;
            })
        ) {
            sel = L[0].id;
        }

        if (!L.length) {
            sel = null;
        }

        lst.innerHTML = L.length
            ? L.map(function (r) {
                  var s = ST[r.status];

                  return (
                      '<button type="button" class="it' +
                      (r.id === sel ? ' on' : '') +
                      '" data-id="' +
                      r.id +
                      '"><div class="t"><span class="n">' +
                      esc(r.nama) +
                      '</span><span class="d">' +
                      dshort(r) +
                      '</span></div>' +
                      '<div class="j">' +
                      esc(r.jenis) +
                      '</div><div class="b">' +
                      (r.files.length ? '<span class="bdg ok">' + CHK + 'Lampiran: ' + r.files.length + ' berkas</span>' : '') +
                      '<span class="bdg ' +
                      s[1] +
                      '">' +
                      s[0] +
                      '</span></div></button>'
                  );
              }).join('')
            : '<div class="none">Tidak ada permohonan yang cocok.</div>';
    }

    var PIC =
        '<svg class="i" viewBox="0 0 16 16"><path d="M13 7.5l-5 5a3.2 3.2 0 01-4.5-4.5l5.5-5.5a2.1 2.1 0 013 3L6.5 11a1 1 0 01-1.5-1.5L10 4.5"/></svg>';

    function renderDetail() {
        var r = cur();

        if (!r) {
            dp.innerHTML =
                '<button type="button" class="btn back" id="back">← Kembali</button><div class="none">Pilih permohonan untuk melihat detail.</div>';

            if (ro) {
                ro.disconnect();
            }

            return;
        }

        var sg;

        if (r.status === 'disetujui') {
            sg = ['Sudah tanda tangan', 'ok', 'ok'];
        } else if (r.status === 'ditolak') {
            sg = ['Menolak', 'x', ''];
        } else if (r.status === 'batal') {
            sg = ['Dibatalkan pemohon', '', ''];
        } else {
            sg = ['Menunggu tanda tangan', '', ''];
        }

        dp.innerHTML =
            '<button type="button" class="btn back" id="back">← Kembali</button>' +
            '<div class="dh"><div><h2>' +
            esc(r.nama) +
            '</h2><p>' +
            esc(r.jabatan) +
            ' — ' +
            esc(r.jenis) +
            ' — Diajukan ' +
            dlong(r) +
            '</p></div>' +
            '<div class="ac">' +
            (r.status === 'menunggu'
                ? '<button type="button" class="btn dg" id="tolak"><svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>Tolak</button><button type="button" class="btn go" id="setuju"><svg class="i" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>Setujui</button>'
                : '') +
            '<button type="button" class="btn" id="full"><svg class="i" viewBox="0 0 16 16"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/></svg>Full</button>' +
            '<button type="button" class="btn" id="pdf"><svg class="i" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3M5.5 8h5M5.5 11h5"/></svg>Download PDF</button></div></div>' +
            '<div class="info"><div class="box"><h3>' +
            PIC +
            'Lampiran <span class="bdg">' +
            (r.files.length ? r.files.length + ' berkas' : 'Belum ada') +
            '</span></h3>' +
            (r.files.length
                ? '<div class="fl2">' +
                  r.files
                      .map(function (n) {
                          return '<span class="fch">' + PIC + esc(n) + '</span>';
                      })
                      .join('') +
                  '</div>'
                : '<p class="em">Tidak ada lampiran.</p>') +
            '</div>' +
            '<div class="box"><h3 class="u">Penandatanganan</h3>' +
            '<div class="sgr"><span class="ic ' +
            sg[2] +
            '">' +
            (sg[2] === 'ok' ? CHK : '') +
            '</span><div class="tx"><span class="nm">' +
            SIGNER.nama +
            '</span><span class="rl">' +
            SIGNER.peran +
            '</span><span class="stt ' +
            sg[1] +
            '">' +
            sg[0] +
            '</span></div></div>' +
            '<div class="sgr"><span class="ic"><svg class="i" viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="12" rx="1"/><path d="M6 5h4M6 8h4M6 11h4"/></svg></span><div class="tx"><span class="nm">Salinan Departemen HRD</span><span class="stt">Selalu menerima</span></div></div>' +
            (r.status === 'ditolak' && r.alasan ? '<p class="alsn"><b>Alasan penolakan:</b> ' + esc(r.alasan) + '</p>' : '') +
            '</div></div>' +
            '<div class="cv" id="cv"><div class="fit">' +
            paper(r) +
            '</div></div>';

        var cv = $('cv');

        fit(cv, null, 0.8);
        watch(cv, function () {
            fit(cv, null, 0.8);
        });
    }

    function render() {
        chips();
        renderList();
        renderDetail();
    }

    // ---- setujui & tolak ----
    var toast = $('toast'),
        rejT = null;

    function say(m) {
        toast.textContent = m;
        toast.classList.add('on');
        clearTimeout(say.t);
        say.t = setTimeout(function () {
            toast.classList.remove('on');
        }, 2600);
    }

    function approve(r) {
        r.status = 'disetujui';
        r.alasan = null;
        render();
        emit('permohonan-setuju', r);
        say('Permohonan disetujui.');
    }

    function openReject(r) {
        rejT = r;
        ov.innerHTML =
            '<div class="dlg sm" role="dialog" aria-modal="true" aria-label="Tolak permohonan"><div class="dlh"><span>Tolak Permohonan</span><button type="button" class="x" data-close aria-label="Tutup"><svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div>' +
            '<div class="dsb"><p>Anda akan menolak permohonan <b style="color:var(--fg)">' +
            esc(r.nama) +
            '</b> (' +
            esc(r.jenis) +
            ').</p>' +
            '<label for="rj-t">Alasan penolakan <span class="opt">(opsional)</span></label>' +
            '<textarea class="fld" id="rj-t" rows="4" maxlength="500" placeholder="Tulis alasan penolakan (boleh dikosongkan)"></textarea></div>' +
            '<div class="dlf"><button type="button" class="btn" data-close>Batal</button><button type="button" class="btn dgb" id="rj-ok">Tolak</button></div></div>';
        ov.hidden = false;
        document.body.style.overflow = 'hidden';
        $('rj-t').focus();
    }

    function doReject() {
        var r = rejT,
            t = $('rj-t').value.trim();

        if (!r) {
            return;
        }

        r.status = 'ditolak';
        r.alasan = t || null;
        rejT = null;
        close();
        render();
        emit('permohonan-tolak', { permohonan: r, alasan: r.alasan });
        say('Permohonan ditolak.');
    }

    // ---- aksi ----
    lst.addEventListener('click', function (e) {
        var b = e.target.closest('[data-id]');

        if (!b) {
            return;
        }

        sel = b.dataset.id;
        renderList();
        renderDetail();
        wrap.classList.add('show-detail');
        root.scrollIntoView({ block: 'start' });
        emit('permohonan-pilih', cur());
    });

    $('chips').addEventListener('click', function (e) {
        var b = e.target.closest('[data-st]');

        if (!b) {
            return;
        }

        stf = b.dataset.st;
        render();
    });

    $('q').addEventListener('input', function () {
        q = this.value;
        render();
    });

    dtEl.addEventListener('input', function () {
        dt = this.value;
        syncDtBtn();

        if (dt) {
            var p = dt.split('-');

            mon = String(+p[1] - 1);
            yr = p[0];

            if (
                !DD.yr.opts.some(function (o) {
                    return o[0] === yr;
                })
            ) {
                DD.yr.opts.push([yr, yr]);
                DD.yr.opts.sort(function (a, b) {
                    return +b[0] - +a[0];
                });
            }

            DD.mon.val = mon;
            DD.yr.val = yr;
            paint('mon');
            paint('yr');
        }

        render();
    });

    dtx.addEventListener('click', function () {
        dt = '';
        dtEl.value = '';
        mon = THIS_MON;
        yr = THIS_YR;
        DD.mon.val = mon;
        DD.yr.val = yr;
        paint('mon');
        paint('yr');
        syncDtBtn();
        render();
    });

    // tampilan penuh dengan zoom
    var zoom = null,
        lastS = 1;

    function openFull(r) {
        zoom = null;
        ov.innerHTML =
            '<div class="dlg" role="dialog" aria-modal="true" aria-label="Surat"><div class="dlh"><span>' +
            esc(r.jenis) +
            ' — ' +
            esc(r.nama) +
            '</span>' +
            '<div class="zc"><button type="button" class="x" data-z="-" aria-label="Perkecil">−</button><span class="zp" id="zp">100%</span><button type="button" class="x" data-z="+" aria-label="Perbesar">+</button><button type="button" class="btn sm" data-z="fit">Fit</button>' +
            '<button type="button" class="x" data-close aria-label="Tutup"><svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div></div>' +
            '<div class="dlb" id="dlb"><div class="fit">' +
            paper(r) +
            '</div></div></div>';
        ov.hidden = false;
        document.body.style.overflow = 'hidden';

        var b = $('dlb');

        function upd() {
            lastS = fit(b, zoom);
            $('zp').textContent = Math.round(lastS * 100) + '%';
        }

        upd();
        watch(b, upd);
        ov._upd = upd;
    }

    function close() {
        ov.hidden = true;
        ov.innerHTML = '';
        document.body.style.overflow = '';
        ov._upd = null;

        var cv = $('cv');

        if (cv) {
            watch(cv, function () {
                fit(cv, null, 0.8);
            });
        }
    }

    ov.addEventListener('click', function (e) {
        if (e.target === ov || e.target.closest('[data-close]')) {
            close();
            return;
        }

        if (e.target.closest('#rj-ok')) {
            doReject();
            return;
        }

        var z = e.target.closest('[data-z]');

        if (!z) {
            return;
        }

        var v = z.dataset.z;

        if (v === 'fit') {
            zoom = null;
        } else {
            zoom = Math.min(2, Math.max(0.3, Math.round((lastS + (v === '+' ? 0.1 : -0.1)) * 10) / 10));
        }

        ov._upd && ov._upd();
    });

    document.addEventListener('keydown', function (e) {
        if (!root.isConnected || e.key !== 'Escape') {
            return;
        }

        if (!mn.hidden) {
            closeMenu();
        } else if (!ov.hidden) {
            close();
        }
    });

    dp.addEventListener('click', function (e) {
        var r = cur();

        if (e.target.closest('#back')) {
            wrap.classList.remove('show-detail');
            root.scrollIntoView({ block: 'start' });
            return;
        }

        if (!r) {
            return;
        }

        if (e.target.closest('#setuju')) {
            approve(r);
            return;
        }

        if (e.target.closest('#tolak')) {
            openReject(r);
            return;
        }

        if (e.target.closest('#full')) {
            openFull(r);
        } else if (e.target.closest('#pdf')) {
            var pa = $('pa'),
                t = document.title;

            pa.innerHTML = paper(r);
            document.title = r.jenis + ' - ' + r.nama;
            document.body.classList.add('printing');
            emit('permohonan-pdf', r);
            setTimeout(function () {
                window.print();
                document.body.classList.remove('printing');
                pa.innerHTML = '';
                document.title = t;
            }, 50);
        }
    });

    // ---- filter bulan & tahun ----
    DD.mon = {
        opts: [['all', 'Semua Bulan']].concat(
            BF.map(function (m, i) {
                return [String(i), m];
            }),
        ),
        val: mon,
        cb: function (v) {
            mon = v;
            dt = '';
            dtEl.value = '';
            syncDtBtn();
            render();
        },
    };
    DD.yr = {
        opts: [0, 1, 2, 3, 4].map(function (i) {
            var y = String(+THIS_YR - i);

            return [y, y];
        }),
        val: yr,
        cb: function (v) {
            yr = v;
            dt = '';
            dtEl.value = '';
            syncDtBtn();
            render();
        },
    };
    dtEl.value = dt;
    syncDtBtn();
    paint('mon');
    paint('yr');
    render();

    document.addEventListener('livewire:navigating', function () {
        if (root.isConnected) {
            close();
            closeMenu();
            document.body.classList.remove('printing');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPermohonanMasuk);
} else {
    initPermohonanMasuk();
}

document.addEventListener('livewire:navigated', initPermohonanMasuk);
