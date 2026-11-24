const formAbsensiRoots = new WeakSet();

function initFormAbsensi() {
    const root = document.getElementById('form-absensi');

    if (!root || formAbsensiRoots.has(root)) {
        return;
    }

    formAbsensiRoots.add(root);

    // Data user & tanda tangan dari server
    var EMP = { nama: '', bagian: '', jabatan: '' };
    var userSig = null;

    var $ = function (id) {
        return root.querySelector('#' + id);
    };
    var fm = $('fm');
    var sig = null;

    if (window.PermohonanAPI) {
        window.PermohonanAPI.loadContext()
            .then(function (ctx) {
                if (!ctx) return;
                EMP = ctx.user || {};
                if ($('en')) $('en').value = EMP.nama || '';
                if ($('n2')) $('n2').value = EMP.nama || '';
                if ($('bg')) $('bg').value = EMP.bagian || '';
                if ($('ps')) $('ps').value = EMP.jabatan || '';
                if ($('mnm')) $('mnm').textContent = EMP.nama || '';

                if (ctx.signature && ctx.signature.png) {
                    userSig = ctx.signature.png;
                    var th = $('mo') && $('mo').querySelector('.th');
                    if (th) th.innerHTML = '<img src="' + userSig + '" style="max-height:25px;max-width:60px" alt="TTD">';
                    sig = userSig;
                    if ($('sb')) {
                        $('sb').innerHTML = '<img src="' + userSig + '" style="max-height:85px;max-width:180px;object-fit:contain" alt="TTD">';
                        $('sb').classList.add('ok');
                    }
                }
            })
            .catch(function () {});
    }

    // Area alasan menyesuaikan tinggi isinya.
    var reason = $('als');

    function grow() {
        reason.style.height = 'auto';
        reason.style.height = Math.max(30, reason.scrollHeight) + 'px';
    }

    reason.addEventListener('input', grow);
    grow();

    function say(message) {
        var toast = $('toast');
        toast.textContent = message;
        toast.classList.add('on');
        clearTimeout(say.timer);
        say.timer = setTimeout(function () {
            toast.classList.remove('on');
        }, 2600);
    }

    // Tanda tangan.
    function menu(open) {
        $('mn').hidden = !open;
        $('sb').setAttribute('aria-expanded', open);
    }

    $('sb').addEventListener('click', function (event) {
        event.stopPropagation();
        menu($('mn').hidden);
    });

    $('mo').addEventListener('click', function () {
        if (!userSig) {
            menu(false);
            return say('Anda belum memiliki tanda tangan. Buat di menu Tanda Tangan.');
        }
        sig = userSig;
        $('sb').innerHTML = '<img src="' + userSig + '" style="max-height:85px;max-width:180px;object-fit:contain" alt="TTD">';
        $('sb').classList.add('ok');
        menu(false);
    });

    function onDocClick(event) {
        if (!root.isConnected) {
            return;
        }

        if (!$('mn').contains(event.target)) {
            menu(false);
        }
    }

    function onDocKey(event) {
        if (event.key === 'Escape') {
            menu(false);
        }
    }

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKey);

    // Aksi formulir.
    function collect() {
        var data = {};

        new FormData(fm).forEach(function (value, key) {
            data[key] = value;
        });

        data.karyawan = EMP;
        data.ttd = sig;

        return data;
    }

    $('cetak').onclick = function () {
        window.print();
    };

    $('draft').onclick = function () {
        var data = collect();
        if (!window.PermohonanAPI) return say('API tidak tersedia.');
        $('draft').disabled = true;
        window.PermohonanAPI.saveDraft('form-absensi', data, [], false, sig)
            .then(function () {
                say('Draft berhasil disimpan.');
            })
            .catch(function (e) {
                var msg = (e.response && e.response.data && e.response.data.message) || 'Gagal menyimpan draft.';
                say(msg);
            })
            .finally(function () {
                $('draft').disabled = false;
            });
    };

    fm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!fm.reportValidity()) {
            return;
        }

        if (!sig) {
            $('sb').focus();
            return say('Pilih tanda tangan terlebih dahulu.');
        }

        var submitBtn = fm.querySelector('[type=submit]');
        if (submitBtn) submitBtn.disabled = true;

        var data = collect();
        window.PermohonanAPI.submitPermohonan(root, 'form-absensi', data, [], false, sig)
            .then(function () {
                say('Pengajuan berhasil dikirim.');
                setTimeout(function () {
                    window.location.href = '/modul/permohonan-saya';
                }, 1000);
            })
            .catch(function (e) {
                if (e && e.cancel) return;
                var msg = (e.response && e.response.data && e.response.data.message) || 'Gagal mengirim pengajuan.';
                say(msg);
            })
            .finally(function () {
                if (submitBtn) submitBtn.disabled = false;
            });
    });

    // Skala kertas A4 mengikuti lebar yang tersedia.
    var stage = $('stage');
    var fit = stage.firstElementChild;
    var paper = fit.firstElementChild;
    var frame = 0;

    function resize() {
        var scale = Math.min(1, stage.clientWidth / 794);
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

    document.addEventListener('livewire:navigating', function () {
        if (!root.isConnected) {
            return;
        }

        if (observer) {
            observer.disconnect();
        }

        window.removeEventListener('resize', schedule);
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onDocKey);
    });

    resize();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormAbsensi);
} else {
    initFormAbsensi();
}

document.addEventListener('livewire:navigated', initFormAbsensi);
