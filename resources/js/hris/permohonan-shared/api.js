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

    // ---- Approver Popup ----

    function showApproverPopup(root) {
        return loadKaryawanAktif().then(function (list) {
            return new Promise(function (resolve) {
                var ov = document.createElement('div');
                ov.className = 'ov2';
                ov.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45)';
                ov.innerHTML = buildPopupHtml(list);
                document.body.appendChild(ov);
                document.body.style.overflow = 'hidden';

                var inp = ov.querySelector('.ap-search');
                if (inp) inp.focus();

                function close(result) {
                    ov.remove();
                    document.body.style.overflow = '';
                    resolve(result || null);
                }

                // close on backdrop click
                ov.addEventListener('click', function (e) {
                    if (e.target === ov) close(null);
                });

                // close button
                var btnClose = ov.querySelector('[data-pop-close]');
                if (btnClose) btnClose.addEventListener('click', function () { close(null); });

                // employee list click
                ov.querySelector('.ap-list').addEventListener('click', function (e) {
                    var item = e.target.closest('[data-id]');
                    if (!item) return;
                    close({ id: +item.dataset.id, nama: item.dataset.nama, jabatan: item.dataset.jabatan });
                });

                // keyboard escape
                function onKey(e) {
                    if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); close(null); }
                }
                document.addEventListener('keydown', onKey);

                // search filter
                if (inp) {
                    inp.addEventListener('input', function () {
                        var q = inp.value.toLowerCase();
                        ov.querySelectorAll('[data-id]').forEach(function (el) {
                            el.hidden = !!q && el.textContent.toLowerCase().indexOf(q) === -1;
                        });
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
                '</button>';
        }).join('');

        return '<div class="ap-dlg" style="background:#fff;border-radius:12px;padding:20px;width:min(420px,92vw);max-height:80vh;display:flex;flex-direction:column;gap:12px">' +
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<h2 style="margin:0;font-size:1rem">Pilih Atasan / Pemberi Izin</h2>' +
            '<button type="button" class="btn sm" data-pop-close aria-label="Tutup" style="padding:4px 8px;line-height:1">✕</button></div>' +
            '<input type="search" class="ap-search fld" placeholder="Cari nama…" autocomplete="off" style="width:100%;box-sizing:border-box">' +
            '<div class="ap-list" style="overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:4px">' +
            (items || '<p style="color:#888;text-align:center">Tidak ada karyawan aktif.</p>') +
            '</div></div>';
    }

    // ---- signature display on form ----

    /**
     * Tampilkan signature pada elemen sb/mo (dropdown signature picker).
     * Jika user sudah punya signature, langsung tampil dan sig di-set.
     * @returns {string|null} png data url jika ada, null jika tidak
     */
    function applySigToForm(root, ctx) {
        var $ = function (id) { return root.querySelector('#' + id); };
        var sb = $('sb'), mo = $('mo'), mnm = $('mnm');
        if (!ctx || !ctx.signature || !ctx.user) return null;

        var png = ctx.signature.png;
        var thumb = sigImg(png, 25);

        // Update thumbnail in dropdown option
        var th = mo && mo.querySelector('.th');
        if (th) th.innerHTML = thumb;
        if (mnm) mnm.textContent = ctx.user.nama;

        // Set button to show signature (pre-selected)
        if (sb) {
            sb.innerHTML = sigImg(png, 85, 180);
            sb.classList.add('ok');
        }

        return png;
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

    // expose
    window.PermohonanAPI = {
        loadContext: loadContext,
        loadKaryawanAktif: loadKaryawanAktif,
        showApproverPopup: showApproverPopup,
        applySigToForm: applySigToForm,
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
