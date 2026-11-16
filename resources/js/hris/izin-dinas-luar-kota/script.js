const izinDinasLuarRoots = new WeakSet();

function initIzinDinasLuarKota() {
    const root = document.getElementById('izin-dinas-luar-kota');

    if (!root || izinDinasLuarRoots.has(root)) {
        return;
    }

    izinDinasLuarRoots.add(root);

    // Data contoh; ganti dengan data dari server.
    var EMP = { nama: 'Nuhgroh Ramadani', jabatan: 'IT Programmer Officer' };
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
    $('jb').value = EMP.jabatan;
    $('mnm').textContent = EMP.nama;
    $('mo').querySelector('.th').innerHTML = SIG.replace('width="120" height="50"', 'width="60" height="25"');

    // Itinerary: baris pertama wajib, baris lain wajib lengkap bila terisi.
    var itineraryRows = Array.from(fm.querySelectorAll('#it tbody tr'));

    function syncRows() {
        itineraryRows.forEach(function (row, index) {
            var fields = row.querySelectorAll('textarea, input');
            var active =
                index === 0 ||
                Array.from(fields).some(function (field) {
                    return field.value;
                });

            fields.forEach(function (field) {
                field.required = !!active;
            });
        });
    }

    itineraryRows.forEach(function (row) {
        row.addEventListener('input', syncRows);
        row.addEventListener('change', syncRows);
    });
    syncRows();

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

        var tableRows = function (selector) {
            return Array.from(fm.querySelectorAll(selector + ' tbody tr'))
                .map(function (row) {
                    return Array.from(row.querySelectorAll('textarea, input')).map(function (field) {
                        return field.value;
                    });
                })
                .filter(function (row) {
                    return row.some(Boolean);
                });
        };

        data.itinerary = tableRows('#it').map(function (row) {
            return { tempat: row[0], tanggal: row[1], jam: row[2], keperluan: row[3] };
        });
        data.transportasi = tableRows('#tp').map(function (row) {
            return { transportasi: row[0], pergi: row[1], pulang: row[2] };
        });
        data.lokasi = tableRows('#lk').map(function (row) {
            return { lokasi: row[0], estimasi_jarak: row[1], total_jarak: row[2] };
        });
        data.ttd = sig;
        data.lampiran = files;
        data.lampiran_menyusul = $('ms').checked;

        return data;
    }

    $('cetak').onclick = function () {
        window.print();
    };

    $('draft').onclick = function () {
        root.dispatchEvent(new CustomEvent('tugas-draft', { detail: collect(), bubbles: true }));
        say('Draft disimpan.');
    };

    fm.addEventListener('submit', function (event) {
        event.preventDefault();

        syncRows();

        if (!fm.reportValidity()) {
            return;
        }

        if (!sig) {
            $('sb').focus();
            return say('Pilih tanda tangan terlebih dahulu.');
        }

        root.dispatchEvent(new CustomEvent('tugas-kirim', { detail: collect(), bubbles: true }));
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
    document.addEventListener('DOMContentLoaded', initIzinDinasLuarKota);
} else {
    initIzinDinasLuarKota();
}

document.addEventListener('livewire:navigated', initIzinDinasLuarKota);
