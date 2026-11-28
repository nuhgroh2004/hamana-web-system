const izinKeluarRoots = new WeakSet();

function initIzinKeluarKantor() {
    const root = document.getElementById('izin-keluar-kantor');

    if (!root || izinKeluarRoots.has(root)) {
        return;
    }

    izinKeluarRoots.add(root);

    // Data user & tanda tangan dari server
    var EMP = { nama: '', jabatan: '' };
    var userSig = null;

    var $ = function (id) {
        return root.querySelector('#' + id);
    };
    var fm = $('fm');
    var files = [];
    var sig = null;
    var MAX = 10;

    if (window.PermohonanAPI) {
        window.PermohonanAPI.loadContext()
            .then(function (ctx) {
                if (!ctx) return;
                EMP = ctx.user || {};
                if ($('en')) $('en').value = EMP.nama || '';
                if ($('jb')) $('jb').value = EMP.jabatan || '';
                if ($('mnm')) $('mnm').textContent = EMP.nama || '';
                if ($('n2')) $('n2').value = EMP.nama || '';

                if (ctx.signature && ctx.signature.png) {
                    userSig = ctx.signature.png;
                    window.PermohonanAPI.applySigToForm(root, ctx);
                }
            })
            .catch(function () {});
    }

    // Tampilkan tanggal dalam format Indonesia di samping pemilih tanggal.
    function syncDate() {
        var value = $('hr').value;
        var parts = value.split('-');
        $('hv').value = value
            ? new Date(+parts[0], +parts[1] - 1, +parts[2]).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
              })
            : '';
    }

    $('hr').value = new Date().toLocaleDateString('sv-SE');
    syncDate();
    $('hr').addEventListener('change', syncDate);
    $('hr').addEventListener('click', function () {
        try {
            this.showPicker();
        } catch (error) {
            // Browser tanpa dukungan showPicker: biarkan pemilih bawaan terbuka.
        }
    });

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
        var data = collect();
        if (!window.PermohonanAPI) return say('API tidak tersedia.');
        $('draft').disabled = true;
        window.PermohonanAPI.saveDraft('izin-keluar-kantor', data, files, $('ms') && $('ms').checked, sig)
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
        window.PermohonanAPI.submitPermohonan(root, 'izin-keluar-kantor', data, files, $('ms') && $('ms').checked, sig)
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
    var cleanupFit = window.PermohonanAPI
        ? window.PermohonanAPI.fitPaper($('stage'))
        : null;

    document.addEventListener('livewire:navigating', function () {
        if (!root.isConnected) {
            return;
        }

        if (cleanupFit) {
            cleanupFit();
        }

        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onDocKey);
    });

    paintFiles();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIzinKeluarKantor);
} else {
    initIzinKeluarKantor();
}

document.addEventListener('livewire:navigated', initIzinKeluarKantor);
