const formAbsensiRoots = new WeakSet();

function initFormAbsensi() {
    const root = document.getElementById('form-absensi');

    if (!root || formAbsensiRoots.has(root)) {
        return;
    }

    formAbsensiRoots.add(root);

    // Data contoh; ganti dengan data dari server.
    var EMP = { nama: 'Nuhgroh Ramadani' };
    var SIG =
        '<svg class="sv" viewBox="0 0 120 50" width="120" height="50"><path d="M8 36c10-24 18-28 20-19s-14 25-6 21 18-25 24-19-8 21 0 17 16-12 20-6 12 2 18-4M30 44c20-4 50-5 80-2" fill="none" stroke="#1a2a6c" stroke-width="2" stroke-linecap="round"/></svg>';

    var $ = function (id) {
        return root.querySelector('#' + id);
    };
    var fm = $('fm');
    var sig = null;

    $('en').value = EMP.nama;
    $('n2').value = EMP.nama;
    $('mnm').textContent = EMP.nama;
    $('mo').querySelector('.th').innerHTML = SIG.replace('width="120" height="50"', 'width="60" height="25"');

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
        sig = EMP.nama;
        $('sb').innerHTML = SIG;
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
        root.dispatchEvent(new CustomEvent('absensi-draft', { detail: collect(), bubbles: true }));
        say('Draft disimpan.');
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

        root.dispatchEvent(new CustomEvent('absensi-kirim', { detail: collect(), bubbles: true }));
        say('Pengajuan dikirim.');
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
