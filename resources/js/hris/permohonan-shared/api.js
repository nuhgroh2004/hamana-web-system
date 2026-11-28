/**
 * PermohonanAPI — shared utilities untuk semua form permohonan.
 * Ponytail: 1 file, 1 responsibility per function, no over-engineering.
 */
(function (window) {
    'use strict';

    var _ctx = null;   // cached user context (user + signature)
    var _emp = null;   // cached active employees list

    // ---- helpers ----

    function esc(v) {
        return String(v == null ? '' : v)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;');
    }

    function ini(n) {
        return String(n || '').trim().split(/\s+/).slice(0, 2)
            .map(function (w) { return w[0] || ''; }).join('').toUpperCase() || '?';
    }

    function sigImg(png, h, maxW) {
        return '<img src="' + esc(png) + '" style="max-height:' + (h || 85) + 'px;max-width:' + (maxW || 180) + 'px;object-fit:contain" alt="TTD">';
    }

    // ---- API fetch helpers ----

    function loadContext() {
        if (_ctx) return Promise.resolve(_ctx);
        return window.axios.get('/api/user-context').then(function (r) {
            _ctx = r.data;
            return _ctx;
        });
    }

    function loadKaryawanAktif() {
        if (_emp) return Promise.resolve(_emp);
        return window.axios.get('/api/karyawan-aktif').then(function (r) {
            _emp = r.data.data;
            return _emp;
        });
    }

    // ---- Approver Popup (Pilih Penerima -> Tombol Kirim -> Alert.confirm) ----

    function showApproverPopup() {
        return loadKaryawanAktif().then(function (list) {
            return new Promise(function (resolve) {
                var selected = null;
                var ov = document.createElement('div');
                ov.className = 'ap-ov';
                ov.innerHTML = buildPopupHtml(list);
                document.body.appendChild(ov);
                document.body.style.overflow = 'hidden';

                var inp = ov.querySelector('.ap-search');
                var pickEl = ov.querySelector('.ap-pick');
                var sendBtn = ov.querySelector('[data-pop-send]');
                if (inp) inp.focus();

                function close(result) {
                    document.removeEventListener('keydown', onKey);
                    ov.remove();
                    document.body.style.overflow = '';
                    resolve(result || null);
                }

                function onKey(e) {
                    if (e.key === 'Escape') {
                        close(null);
                    }
                }
                document.addEventListener('keydown', onKey);

                ov.addEventListener('click', function (e) {
                    if (e.target === ov || e.target.closest('[data-pop-close]')) {
                        close(null);
                        return;
                    }

                    var item = e.target.closest('.ap-item[data-id]');
                    if (item) {
                        ov.querySelectorAll('.ap-item.on').forEach(function (el) {
                            el.classList.remove('on');
                        });
                        item.classList.add('on');
                        selected = {
                            id: +item.dataset.id,
                            nama: item.dataset.nama,
                            jabatan: item.dataset.jabatan,
                        };
                        if (pickEl) {
                            pickEl.innerHTML = 'Penerima: <b>' + esc(selected.nama) + '</b> — ' + esc(selected.jabatan);
                        }
                        if (sendBtn) {
                            sendBtn.disabled = false;
                        }
                        return;
                    }

                    if (e.target.closest('[data-pop-send]') && selected) {
                        var target = selected;
                        var confirmPromise = window.Alert && typeof window.Alert.confirm === 'function'
                            ? window.Alert.confirm({
                                title: 'Kirim Permohonan?',
                                message: 'Permohonan akan dikirim ke ' + target.nama + ' (' + target.jabatan + ').',
                                yes: 'Kirim',
                                no: 'Batal',
                            })
                            : Promise.resolve(window.confirm('Kirim permohonan ke ' + target.nama + '?'));

                        confirmPromise.then(function (ok) {
                            if (ok) {
                                close(target);
                            }
                        });
                    }
                });

                if (inp) {
                    inp.addEventListener('input', function () {
                        var q = inp.value.trim().toLowerCase();
                        var visible = 0;
                        ov.querySelectorAll('.ap-item[data-id]').forEach(function (el) {
                            var match = !q || el.textContent.toLowerCase().indexOf(q) !== -1;
                            el.hidden = !match;
                            if (match) visible++;
                        });
                        var emptyEl = ov.querySelector('.ap-none');
                        if (emptyEl) emptyEl.hidden = visible > 0;
                    });
                }
            });
        });
    }

    function buildPopupHtml(list) {
        var items = list.map(function (e) {
            return '<button type="button" class="ap-item" data-id="' + esc(e.id) +
                '" data-nama="' + esc(e.nama) + '" data-jabatan="' + esc(e.jabatan) + '">' +
                '<span class="ap-av">' + esc(ini(e.nama)) + '</span>' +
                '<span class="ap-info"><b>' + esc(e.nama) + '</b><small>' + esc(e.jabatan) + '</small></span>' +
                '<span class="ap-ck" aria-hidden="true">&#10003;</span>' +
                '</button>';
        }).join('');

        return '<div class="ap-dlg" role="dialog" aria-modal="true" aria-labelledby="ap-ttl">' +
            '<div class="ap-hd">' +
            '<div><span class="ap-eyebrow">Tujuan Pengiriman</span><h2 id="ap-ttl">Pilih Penerima Permohonan</h2></div>' +
            '<button type="button" class="ap-x" data-pop-close aria-label="Tutup">&times;</button>' +
            '</div>' +
            '<div class="ap-searchw">' +
            '<input type="search" class="ap-search" placeholder="Cari nama atau jabatan…" autocomplete="off">' +
            '</div>' +
            '<div class="ap-list">' +
            items +
            '<p class="ap-none"' + (list.length ? ' hidden' : '') + '>Tidak ada karyawan aktif yang cocok.</p>' +
            '</div>' +
            '<div class="ap-ft">' +
            '<p class="ap-pick">Pilih salah satu penerima di atas untuk mengaktifkan tombol Kirim.</p>' +
            '<div class="ap-fb">' +
            '<button type="button" class="ap-btn" data-pop-close>Batal</button>' +
            '<button type="button" class="ap-btn go" data-pop-send disabled>Kirim</button>' +
            '</div></div></div>';
    }

    // ---- signature display on form ----

    /**
     * Isi opsi dropdown tanda tangan (mo) tanpa memilih otomatis pada tombol sb.
     * User tetap harus klik "Pilih tanda tangan" secara manual.
     */
    function applySigToForm(root, ctx) {
        var $ = function (id) { return root.querySelector('#' + id); };
        var mo = $('mo'), mnm = $('mnm');
        if (!ctx || !ctx.signature || !ctx.user) return null;

        var png = ctx.signature.png;
        var th = mo && mo.querySelector('.th');
        if (th) th.innerHTML = sigImg(png, 25, 60);
        if (mnm) mnm.textContent = ctx.user.nama;

        return null;
    }

    // ---- A4 stage scaler (dipakai semua form) ----

    function fitPaper(stage) {
        if (!stage) return null;
        var fit = stage.firstElementChild;
        var paper = fit && fit.firstElementChild;
        if (!fit || !paper) return null;

        var frame = 0;

        function resize() {
            var w = stage.clientWidth;
            if (!w) return;
            var scale = Math.min(1, w / 794);
            paper.style.transform = 'scale(' + scale + ')';
            fit.style.width = Math.round(794 * scale) + 'px';
            fit.style.height = Math.round(paper.offsetHeight * scale) + 'px';
        }

        function schedule() {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(resize);
        }

        var observer = null;
        if (window.ResizeObserver) {
            observer = new ResizeObserver(schedule);
            observer.observe(stage);
            observer.observe(paper);
        }
        window.addEventListener('resize', schedule);
        resize();

        return function cleanup() {
            cancelAnimationFrame(frame);
            if (observer) observer.disconnect();
            window.removeEventListener('resize', schedule);
        };
    }

    // ---- form submission ----

    function buildFd(formType, formData, files, lampiranMenyusul, sigPng, status, approverId) {
        var fd = new FormData();
        fd.append('form_type', formType);
        fd.append('form_data', JSON.stringify(formData));
        fd.append('status', status);
        fd.append('tanggal_pengajuan', new Date().toLocaleDateString('sv-SE'));
        if (sigPng) fd.append('signature_applicant', sigPng);
        if (approverId) fd.append('approver_id', approverId);
        if (lampiranMenyusul) fd.append('lampiran_menyusul', '1');
        (files || []).forEach(function (f) { fd.append('lampiran[]', f); });
        return fd;
    }

    function saveDraft(formType, formData, files, lampiranMenyusul, sigPng) {
        return window.axios.post('/api/permohonan',
            buildFd(formType, formData, files, lampiranMenyusul, sigPng, 'draft'),
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
    }

    function submitPermohonan(root, formType, formData, files, lampiranMenyusul, sigPng) {
        return showApproverPopup(root).then(function (approver) {
            if (!approver) return Promise.reject(Object.assign(new Error('cancel'), { cancel: true }));
            return window.axios.post('/api/permohonan',
                buildFd(formType, formData, files, lampiranMenyusul, sigPng, 'menunggu', approver.id),
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
        });
    }

    function submitDraft(permohonanId, approverId) {
        return window.axios.post('/api/permohonan/' + permohonanId + '/kirim', { approver_id: approverId });
    }

    function cancelPermohonan(permohonanId) {
        return window.axios.post('/api/permohonan/' + permohonanId + '/batal');
    }

    function deleteDraft(permohonanId) {
        return window.axios.delete('/api/permohonan/' + permohonanId);
    }

    function clearCache() {
        _ctx = null;
        _emp = null;
    }

    // Auto-clear cache on Livewire navigation so stale user/employee data
    // is never reused after the user switches pages or the session refreshes.
    document.addEventListener('livewire:navigating', function () {
        _ctx = null;
        _emp = null;
    });

    // expose
    window.PermohonanAPI = {
        loadContext: loadContext,
        loadKaryawanAktif: loadKaryawanAktif,
        showApproverPopup: showApproverPopup,
        applySigToForm: applySigToForm,
        fitPaper: fitPaper,
        saveDraft: saveDraft,
        submitPermohonan: submitPermohonan,
        submitDraft: submitDraft,
        cancelPermohonan: cancelPermohonan,
        deleteDraft: deleteDraft,
        clearCache: clearCache,
        sigImg: sigImg,
        esc: esc,
    };

})(window);
