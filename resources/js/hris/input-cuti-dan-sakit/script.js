const inputCutiRoots = new WeakSet();

function initInputCutiDanSakit() {
    const root = document.getElementById('input-cuti-dan-sakit');

    if (!root || inputCutiRoots.has(root)) {
        return;
    }

    inputCutiRoots.add(root);

    // Data contoh; ganti dengan data dari server.
    var EMP = { nama: 'Nuhgroh Ramadani', bagian: 'Officer', nik: '0926.25.01.05' };
    var SIG =
        '<svg class="sv" viewBox="0 0 120 50" width="120" height="50"><path d="M8 36c10-24 18-28 20-19s-14 25-6 21 18-25 24-19-8 21 0 17 16-12 20-6 12 2 18-4M30 44c20-4 50-5 80-2" fill="none" stroke="#1a2a6c" stroke-width="2" stroke-linecap="round"/></svg>';

    var $ = function (id) {
        return root.querySelector('#' + id);
    };
    var fm = $('fm');
    var files = [];
    var sig = null;
    var MAX = 10;

    $('en').value = EMP.nama;
    $('eb').value = EMP.bagian;
    $('ek').value = EMP.nik;
    $('mnm').textContent = EMP.nama;
    $('mo').querySelector('.th').innerHTML = SIG.replace('width="120" height="50"', 'width="60" height="25"');

    function say(message) {
        var toast = $('toast');
        toast.textContent = message;
        toast.classList.add('on');
        clearTimeout(say.timer);
        say.timer = setTimeout(function () {
            toast.classList.remove('on');
        }, 2600);
    }

    // Cuti fullday dan halfday saling meniadakan.
    fm.querySelectorAll('[name=jenis]').forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            if (!checkbox.checked) {
                return;
            }

            fm.querySelectorAll('[name=jenis]').forEach(function (other) {
                if (other !== checkbox) {
                    other.checked = false;
                }
            });
        });
    });

    // Untuk keperluan: tampilkan kolom keterangan / pilihan surat dokter.
    function syncKeperluan() {
        var value = $('kp').value;
        $('sk').hidden = value !== 'Sakit';
        $('lain').hidden = value !== 'Lainnya';
        $('kt').required = value === 'Lainnya';
    }

    $('kp').addEventListener('change', syncKeperluan);
    syncKeperluan();

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
        if (!$('n2').value) {
            $('n2').value = EMP.nama;
        }
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

    // Lampiran.
    function size(n) {
        return n < 1048576
            ? Math.max(1, Math.round(n / 1024)) + ' KB'
            : (n / 1048576).toFixed(1) + ' MB';
    }

    function compress(file) {
        return new Promise(function (resolve) {
            if (!/^image\/(jpeg|png)$/.test(file.type) || file.size < 1048576) {
                return resolve(file);
            }

            var image = new Image();
            var url = URL.createObjectURL(file);

            image.onload = function () {
                var scale = Math.min(1, 1600 / Math.max(image.width, image.height));
                var canvas = document.createElement('canvas');
                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);
                canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(function (blob) {
                    URL.revokeObjectURL(url);
                    resolve(
                        blob
                            ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
                            : file,
                    );
                }, 'image/jpeg', 0.8);
            };
            image.onerror = function () {
                resolve(file);
            };
            image.src = url;
        });
    }

    function escape(value) {
        return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }

    function paintFiles() {
        $('cnt').textContent = files.length + ' / ' + MAX + ' berkas';
        $('fem').hidden = files.length > 0;
        $('fls').innerHTML = files
            .map(function (file, index) {
                return (
                    '<div class="fi"><svg class="i" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3"/></svg>' +
                    '<span>' + escape(file.name) + '</span><small>' + size(file.size) + '</small>' +
                    '<button type="button" data-x="' + index + '" aria-label="Hapus"><svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div>'
                );
            })
            .join('');

        var disabled = $('ms').checked || files.length >= MAX;
        $('pb').disabled = disabled;
        $('fb').disabled = disabled;
    }

    async function addFiles(list) {
        var errors = [];
        $('fe').hidden = true;

        for (var file of Array.from(list)) {
            if (files.length >= MAX) {
                errors.push('Maksimal ' + MAX + ' berkas.');
                break;
            }

            if (!/^(image\/(jpeg|png)|application\/pdf)$/.test(file.type)) {
                errors.push(file.name + ': format tidak didukung.');
                continue;
            }

            file = await compress(file);

            if (file.size > 5242880) {
                errors.push(file.name + ': lebih dari 5 MB.');
                continue;
            }

            files.push(file);
        }

        if (errors.length) {
            $('fe').textContent = errors.join(' ');
            $('fe').hidden = false;
        }

        paintFiles();
    }

    $('pb').onclick = function () {
        $('fp').click();
    };
    $('fb').onclick = function () {
        $('fc').click();
    };

    ['fp', 'fc'].forEach(function (id) {
        $(id).addEventListener('change', function () {
            addFiles(this.files);
            this.value = '';
        });
    });

    $('fls').addEventListener('click', function (event) {
        var button = event.target.closest('[data-x]');

        if (button) {
            files.splice(+button.dataset.x, 1);
            paintFiles();
        }
    });

    $('ms').addEventListener('change', function () {
        if (this.checked) {
            files = [];
            $('fe').hidden = true;
        }

        paintFiles();
    });

    // Aksi formulir.
    function collect() {
        var data = {};

        new FormData(fm).forEach(function (value, key) {
            if (key === 'jenis') {
                (data.jenis = data.jenis || []).push(value);
            } else {
                data[key] = value;
            }
        });

        data.karyawan = EMP;
        data.ttd = sig;
        data.lampiran = files;
        data.lampiran_menyusul = $('ms').checked;

        return data;
    }

    $('cetak').onclick = function () {
        window.print();
    };

    $('draft').onclick = function () {
        root.dispatchEvent(new CustomEvent('cuti-draft', { detail: collect(), bubbles: true }));
        say('Draft disimpan.');
    };

    fm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!fm.querySelector('[name=jenis]:checked')) {
            fm.querySelector('[name=jenis]').focus();
            return say('Pilih Cuti Fullday atau Cuti Halfday.');
        }

        if (!fm.reportValidity()) {
            return;
        }

        if (!sig) {
            $('sb').focus();
            return say('Pilih tanda tangan terlebih dahulu.');
        }

        root.dispatchEvent(new CustomEvent('cuti-kirim', { detail: collect(), bubbles: true }));
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
    paintFiles();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInputCutiDanSakit);
} else {
    initInputCutiDanSakit();
}

document.addEventListener('livewire:navigated', initInputCutiDanSakit);
