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
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    var ST = {
        menunggu: ['Menunggu', 'w'],
        disetujui: ['Disetujui', 'ok'],
        ditolak: ['Ditolak', 'x'],
        batal: ['Dibatalkan Pemohon', 'g'],
    };
    var A4W = 794;

    var TODAY = new Date(),
        THIS_YR = String(TODAY.getFullYear());

    // State pagination & filter server-side (hanya memuat halaman yang dibuka)
    var REQ = [];
    var META = {
        day_page: 1,
        use_day_pagination: true,
        target_label: 'Hari ini',
        total_pages: 4,
        counts: { all: 0, menunggu: 0, disetujui: 0, ditolak: 0 },
    };

    var q = '',
        stf = 'all',
        mon = 'all',
        yr = 'all',
        dt = '',
        dayPage = 1,
        sel = null,
        loading = false,
        reqSeq = 0;

    var lst = $('lst'),
        pgr = $('pgr'),
        dp = $('dpane'),
        wrap = $('wrap'),
        mn = $('mn'),
        ov = $('ov'),
        dtEl = $('dt'),
        dtx = $('dtx');

    function reloadData() {
        var seq = ++reqSeq;
        loading = true;
        renderPager();

        var params = {
            day_page: dayPage,
            status: stf,
        };
        if (q.trim()) params.q = q.trim();
        if (dt) {
            params.date = dt;
        } else {
            if (mon !== 'all') params.month = mon;
            if (yr !== 'all') params.year = yr;
        }

        return window.axios
            .get('/api/permohonan-masuk', { params: params })
            .then(function (res) {
                if (seq !== reqSeq) return;
                REQ = (res.data && res.data.data) || [];
                META = (res.data && res.data.meta) || META;
                loading = false;
                render();
            })
            .catch(function () {
                if (seq !== reqSeq) return;
                loading = false;
                renderPager();
            });
    }

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
        if (!root.isConnected) return;

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
        if (root.isConnected) closeMenu();
    });

    // ---- surat (A4 identik 794px) ----
    function paper(r) {
        if (window.PermohonanPreview) {
            return '<div class="paper">' + window.PermohonanPreview.render(r) + '</div>';
        }
        return '<div class="paper"><p>Tidak ada pratinjau.</p></div>';
    }

    function fit(host, zoom, cap) {
        var f = host.querySelector('.fit'),
            p = f && f.firstElementChild;

        if (!p) return 1;

        var cs = getComputedStyle(host),
            avail = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);

        p.style.width = A4W + 'px';
        p.style.minHeight = Math.round(A4W * 1.4142) + 'px';

        var s = zoom || Math.min(cap || 1, Math.max(0.3, avail / A4W));

        p.style.transform = 'scale(' + s + ')';
        f.style.width = Math.round(A4W * s) + 'px';
        f.style.height = Math.round(p.offsetHeight * s) + 'px';
        return s;
    }

    var ro = null,
        raf = 0,
        lw = -1;

    function watch(host, fn) {
        if (ro) ro.disconnect();
        lw = -1;
        if (!window.ResizeObserver) return;

        ro = new ResizeObserver(function () {
            var w = host.clientWidth;
            if (w === lw) return;
            lw = w;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(fn);
        });
        ro.observe(host);
    }

    // ---- render ----
    function chips() {
        var c = META.counts || { all: REQ.length, menunggu: 0, disetujui: 0, ditolak: 0 };

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
                    (x[0] === 'menunggu' ? '<em>' + (c.menunggu || 0) + '</em>' : '') +
                    '</button>'
                );
            })
            .join('');
    }

    var CHK = '<svg class="i" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>';

    function renderList() {
        if (REQ.length && !REQ.some(function (r) { return r.id === sel; })) {
            sel = REQ[0].id;
        }
        if (!REQ.length) {
            sel = null;
        }

        lst.innerHTML = REQ.length
            ? REQ.map(function (r) {
                  var s = ST[r.status] || ['Menunggu', 'w'];

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
                      (r.files && r.files.length ? '<span class="bdg ok">' + CHK + 'Lampiran: ' + r.files.length + ' berkas</span>' : '') +
                      '<span class="bdg ' +
                      s[1] +
                      '">' +
                      s[0] +
                      '</span></div></button>'
                  );
              }).join('')
            : '<div class="none">Tidak ada permohonan pada hari ini.</div>';
    }

    function renderPager() {
        if (!pgr) return;

        if (!META.use_day_pagination) {
            pgr.innerHTML = '<div class="pgr-info"><span>Menampilkan hasil filter</span><span>' + REQ.length + ' data</span></div>';
            return;
        }

        var curPage = META.day_page || dayPage;
        var total = Math.max(curPage, META.total_pages || 4);
        var start = Math.max(1, curPage - 1);
        var end = Math.min(total, start + 3);
        if (end - start < 3) start = Math.max(1, end - 3);

        var btns = '<button type="button" class="pgb" data-page="' + (curPage - 1) + '"' + (curPage <= 1 || loading ? ' disabled' : '') + '>&lsaquo;</button>';
        for (var i = start; i <= end; i++) {
            btns += '<button type="button" class="pgb' + (i === curPage ? ' on' : '') + '" data-page="' + i + '"' + (loading ? ' disabled' : '') + '>' + i + '</button>';
        }
        btns += '<button type="button" class="pgb" data-page="' + (curPage + 1) + '"' + (loading ? ' disabled' : '') + '>&rsaquo;</button>';

        pgr.innerHTML =
            '<div class="pgr-info"><span>Hal <b>' + curPage + '</b> · ' + esc(META.target_label || '') + '</span>' +
            '<span>' + (loading ? 'Memuat…' : REQ.length + ' data') + '</span></div>' +
            '<div class="pgr-btns">' + btns + '</div>';
    }

    var PIC =
        '<svg class="i" viewBox="0 0 16 16"><path d="M13 7.5l-5 5a3.2 3.2 0 01-4.5-4.5l5.5-5.5a2.1 2.1 0 013 3L6.5 11a1 1 0 01-1.5-1.5L10 4.5"/></svg>';

    function renderDetail() {
        var r = cur();

        if (!r) {
            dp.innerHTML =
                '<button type="button" class="btn back" id="back">← Kembali</button><div class="none">Pilih permohonan untuk melihat detail.</div>';
            if (ro) ro.disconnect();
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

        var approverName = (r.ap && r.ap.n) || '-';
        var approverRole = (r.ap && r.ap.r) || 'Atasan Langsung (Pemberi Izin)';
        var filesHtml = r.files && r.files.length
            ? '<div class="fl2">' +
              r.files
                  .map(function (f) {
                      var name = typeof f === 'string' ? f : (f && f.name) || 'Berkas';
                      return f && f.url
                          ? '<a class="fch" href="' + esc(f.url) + '" target="_blank" rel="noopener">' + PIC + esc(name) + '</a>'
                          : '<span class="fch">' + PIC + esc(name) + '</span>';
                  })
                  .join('') +
              '</div>'
            : '<p class="em">Tidak ada lampiran.</p>';

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
            (r.files && r.files.length ? r.files.length + ' berkas' : 'Belum ada') +
            '</span></h3>' +
            filesHtml +
            '</div>' +
            '<div class="box"><h3 class="u">Penandatanganan</h3>' +
            '<div class="sgr"><span class="ic ' +
            sg[2] +
            '">' +
            (sg[2] === 'ok' ? CHK : '') +
            '</span><div class="tx"><span class="nm">' +
            esc(approverName) +
            '</span><span class="rl">' +
            esc(approverRole) +
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
        fit(cv, null, 0.85);
        watch(cv, function () {
            fit(cv, null, 0.85);
        });
    }

    function render() {
        chips();
        renderList();
        renderPager();
        renderDetail();
    }

    // ---- setujui & tolak dengan Alert.confirm ----
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

    function confirmAction(opts) {
        if (window.Alert && typeof window.Alert.confirm === 'function') {
            return window.Alert.confirm(opts);
        }
        return Promise.resolve(window.confirm(opts.message || opts.title || 'Lanjutkan?'));
    }

    function approve(r) {
        confirmAction({
            title: 'Setujui Permohonan?',
            message: 'Anda yakin menyetujui permohonan ' + r.nama + ' (' + r.jenis + ')?',
            yes: 'Setujui',
            no: 'Batal',
        }).then(function (ok) {
            if (!ok) return;

            window.axios
                .post('/api/permohonan-masuk/' + r.id + '/approve')
                .then(function () {
                    reloadData();
                    say('Permohonan disetujui.');
                })
                .catch(function (e) {
                    var msg = (e.response && e.response.data && e.response.data.message) || 'Gagal menyetujui permohonan.';
                    say(msg);
                });
        });
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
            '<label for="rj-t">Alasan penolakan</label>' +
            '<textarea class="fld" id="rj-t" rows="4" maxlength="500" placeholder="Tulis alasan penolakan"></textarea></div>' +
            '<div class="dlf"><button type="button" class="btn" data-close>Batal</button><button type="button" class="btn dgb" id="rj-ok">Tolak</button></div></div>';
        ov.hidden = false;
        document.body.style.overflow = 'hidden';
        $('rj-t').focus();
    }

    function doReject() {
        var r = rejT,
            t = $('rj-t').value.trim();

        if (!r) return;
        if (!t) {
            $('rj-t').focus();
            return say('Tulis alasan penolakan terlebih dahulu.');
        }

        confirmAction({
            title: 'Tolak Permohonan?',
            message: 'Permohonan ' + r.nama + ' (' + r.jenis + ') akan ditolak.',
            yes: 'Tolak',
            no: 'Batal',
            danger: true,
        }).then(function (ok) {
            if (!ok) return;

            window.axios
                .post('/api/permohonan-masuk/' + r.id + '/reject', { alasan: t })
                .then(function () {
                    rejT = null;
                    close();
                    reloadData();
                    say('Permohonan ditolak.');
                })
                .catch(function (e) {
                    var msg = (e.response && e.response.data && e.response.data.message) || 'Gagal menolak permohonan.';
                    say(msg);
                });
        });
    }

    // ---- aksi ----
    lst.addEventListener('click', function (e) {
        var b = e.target.closest('[data-id]');
        if (!b) return;

        sel = b.dataset.id;
        renderList();
        renderDetail();
        wrap.classList.add('show-detail');
        root.scrollIntoView({ block: 'start' });
        emit('permohonan-pilih', cur());
    });

    if (pgr) {
        pgr.addEventListener('click', function (e) {
            var b = e.target.closest('[data-page]');
            if (!b || b.disabled) return;
            var next = Math.max(1, +b.dataset.page || 1);
            if (next === dayPage) return;
            dayPage = next;
            sel = null;
            reloadData();
        });
    }

    $('chips').addEventListener('click', function (e) {
        var b = e.target.closest('[data-st]');
        if (!b) return;
        stf = b.dataset.st;
        reloadData();
    });

    var searchTimer = null;
    $('q').addEventListener('input', function () {
        q = this.value;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            reloadData();
        }, 250);
    });

    dtEl.addEventListener('input', function () {
        dt = this.value;
        syncDtBtn();

        if (dt) {
            var p = dt.split('-');
            mon = String(+p[1] - 1);
            yr = p[0];

            if (!DD.yr.opts.some(function (o) { return o[0] === yr; })) {
                DD.yr.opts.push([yr, yr]);
                DD.yr.opts.sort(function (a, b) {
                    return a[0] === 'all' ? -1 : b[0] === 'all' ? 1 : +b[0] - +a[0];
                });
            }
            DD.mon.val = mon;
            DD.yr.val = yr;
            paint('mon');
            paint('yr');
        }

        reloadData();
    });

    dtx.addEventListener('click', function () {
        dt = '';
        dtEl.value = '';
        mon = 'all';
        yr = 'all';
        dayPage = 1;
        DD.mon.val = mon;
        DD.yr.val = yr;
        paint('mon');
        paint('yr');
        syncDtBtn();
        reloadData();
    });

    function close() {
        ov.hidden = true;
        ov.innerHTML = '';
        document.body.style.overflow = '';
        ov._upd = null;

        var cv = $('cv');
        if (cv) {
            watch(cv, function () {
                fit(cv, null, 0.85);
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
        }
    });

    document.addEventListener('keydown', function (e) {
        if (!root.isConnected || e.key !== 'Escape') return;
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

        if (!r) return;

        if (e.target.closest('#setuju')) {
            approve(r);
            return;
        }

        if (e.target.closest('#tolak')) {
            openReject(r);
            return;
        }

        // Full -> arahkan ke tab baru dengan pembuka PDF bawaan browser
        if (e.target.closest('#full')) {
            window.open('/permohonan/' + encodeURIComponent(r.id) + '/pdf', '_blank', 'noopener');
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
            reloadData();
        },
    };
    DD.yr = {
        opts: [['all', 'Semua Tahun']].concat(
            [0, 1, 2, 3, 4].map(function (i) {
                var y = String(+THIS_YR - i);
                return [y, y];
            }),
        ),
        val: yr,
        cb: function (v) {
            yr = v;
            dt = '';
            dtEl.value = '';
            syncDtBtn();
            reloadData();
        },
    };
    dtEl.value = dt;
    syncDtBtn();
    paint('mon');
    paint('yr');
    render();
    reloadData();

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
