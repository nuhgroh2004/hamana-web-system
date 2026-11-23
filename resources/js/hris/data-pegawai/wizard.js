const wizardRoots = new WeakSet();

function initDataPegawaiWizard() {
    const root = document.getElementById('data-pegawai-wizard');

    if (!root || wizardRoots.has(root)) {
        return;
    }

    wizardRoots.add(root);

    const TOTAL = 5;
    const STEP_KEYS = ['data_pribadi', 'pendidikan', 'keluarga', 'ciri_fisik', 'file'];
    const JENJANG = ['SD', 'SMP', 'SMA/SMK', 'DIPLOMA', 'SARJANA', 'MAGISTER', 'DOKTORAL'];
    const HUBUNGAN = ['AYAH', 'IBU', 'SAUDARA', 'SUAMI', 'ISTRI', 'ANAK'];

    const form = document.getElementById('wz-form');
    const toast = document.getElementById('toast');
    const btnPrev = document.getElementById('wz-prev');
    const btnNext = document.getElementById('wz-next');
    const counter = document.getElementById('wz-count');
    const sections = Array.from(root.querySelectorAll('.wz-step'));
    const bars = Array.from(root.querySelectorAll('.wz-bar'));
    const labels = Array.from(root.querySelectorAll('.wz-labels span'));
    const pendidikanBox = document.getElementById('wz-pendidikan');
    const keluargaBox = document.getElementById('wz-keluarga');
    const utamaBox = document.getElementById('wz-utama');
    const lainBox = document.getElementById('wz-lain');
    const ov = document.getElementById('wz-ov');

    let employeeId = Number(root.dataset.employee) || null;
    let step = 1;
    let busy = false;
    let progress = {};
    let docs = [];
    let nomor = {};
    let pendidikanGroups = [];
    let keluargaGroups = [];
    let pendingFiles = null;

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    function say(message) {
        toast.textContent = message;
        toast.classList.add('on');
        clearTimeout(say.timer);
        say.timer = setTimeout(function () {
            toast.classList.remove('on');
        }, 2800);
    }

    function val(id) {
        const el = document.getElementById('w-' + id);

        return el ? el.value.trim() : '';
    }

    function setVal(id, value) {
        const el = document.getElementById('w-' + id);

        if (el) {
            el.value = value == null ? '' : value;
        }
    }

    function markError(key) {
        root.querySelectorAll('.bad').forEach(function (el) {
            el.classList.remove('bad');
        });

        if (!key) {
            return;
        }

        const field = String(key).split('.')[0];
        const el = document.getElementById('w-' + field);

        if (el) {
            el.classList.add('bad');
            el.focus();
        }
    }

    function fail(error) {
        const data = error && error.response && error.response.data;
        const errors = data && data.errors;
        const key = errors ? Object.keys(errors)[0] : null;

        markError(key);
        say(key ? errors[key][0] : (data && data.message) || 'Data gagal disimpan.');
    }

    function applyProgress(next) {
        progress = Object.assign({}, progress, next || {});
        paintNav();
    }

    function paintNav() {
        sections.forEach(function (section, index) {
            section.hidden = index + 1 !== step;
        });

        bars.forEach(function (bar, index) {
            bar.classList.toggle('on', !!progress[STEP_KEYS[index]]);
            bar.classList.toggle('cur', index + 1 === step);
        });

        labels.forEach(function (label, index) {
            label.classList.toggle('on', !!progress[STEP_KEYS[index]]);
            label.classList.toggle('cur', index + 1 === step);
        });

        btnPrev.hidden = step === 1;
        counter.textContent = 'Langkah ' + step + ' dari ' + TOTAL;
        btnNext.textContent = step === TOTAL ? 'Simpan & Selesai' : 'Simpan & Lanjut';
    }

    function goTo(next) {
        step = Math.max(1, Math.min(TOTAL, next));
        paintNav();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const CONTROL_SELECTOR = 'input[id^="w-"], select[id^="w-"], textarea[id^="w-"]';

    // ---- langkah 1: data pribadi ----
    function collectDataPribadi() {
        const data = {};

        sections[0].querySelectorAll(CONTROL_SELECTOR).forEach(function (el) {
            if (['file', 'checkbox', 'radio'].includes(el.type)) {
                return;
            }

            data[el.id.slice(2)] = el.value.trim();
        });

        const gender = sections[0].querySelector('input[name="w-gender"]:checked');
        const faskes = document.getElementById('w-faskes_terpilih');

        data.gender = gender ? gender.value : '';
        data.faskes_terpilih = faskes ? faskes.checked : false;

        return data;
    }

    function fillDataPribadi(data) {
        if (!data) {
            return;
        }

        sections[0].querySelectorAll(CONTROL_SELECTOR).forEach(function (el) {
            if (['file', 'checkbox', 'radio'].includes(el.type)) {
                return;
            }

            const key = el.id.slice(2);

            if (data[key] != null) {
                if (
                    el.tagName === 'SELECT' &&
                    !Array.from(el.options).some(function (option) {
                        return option.value === String(data[key]);
                    })
                ) {
                    el.add(new Option(data[key], data[key]));
                }

                el.value = data[key];
            }
        });

        sections[0].querySelectorAll('input[name="w-gender"]').forEach(function (radio) {
            radio.checked = radio.value === data.gender;
        });

        const faskes = document.getElementById('w-faskes_terpilih');

        if (faskes) {
            faskes.checked = !!data.faskes_terpilih;
        }
    }

    function rememberEmployee(id) {
        const url = new URL(window.location.href);
        url.searchParams.set('employee', id);
        window.history.replaceState({}, '', url);
    }

    function uploadPhoto(nik) {
        const input = document.getElementById('w-photo');
        const file = input && input.files ? input.files[0] : null;

        if (!file || !employeeId) {
            return Promise.resolve();
        }

        const body = new FormData();
        body.append('photo', file);

        return window.axios
            .post('/api/profil/data-pribadi/photo?nik=' + encodeURIComponent(nik), body)
            .then(function () {
                input.value = '';
                document.getElementById('w-photo-info').textContent = 'Foto profil tersimpan.';
            })
            .catch(function () {
                say('Data tersimpan, tetapi foto gagal diunggah.');
            });
    }

    function saveDataPribadi() {
        const data = collectDataPribadi();
        const request = employeeId
            ? window.axios.put('/api/data-pegawai/wizard/' + employeeId + '/data-pribadi', data)
            : window.axios.post('/api/data-pegawai/wizard', data);

        return request.then(function (res) {
            employeeId = res.data.employee.id;
            rememberEmployee(employeeId);
            applyProgress(res.data.progress);

            return uploadPhoto(res.data.employee.nik || data.nik);
        });
    }

    // ---- tabel dinamis: pendidikan & keluarga ----
    const TRASH_SVG =
        '<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 7v4"/></svg>';
    const PLUS_SVG = '<svg class="i" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>';

    const KELUARGA_GROUPS = [
        { k: 'AYAH', add: true, num: true },
        { k: 'IBU', add: true, num: true },
        { k: 'SAUDARA', add: true, num: true },
        { k: 'SUAMI', add: false, num: false },
        { k: 'ISTRI', add: true, num: true },
        { k: 'ANAK', add: true, num: true },
    ];

    function blankPendidikan() {
        return { nama_sekolah: '', jurusan: '', tahun: '' };
    }

    function blankKeluarga() {
        return { nama: '', usia: '', pekerjaan: '' };
    }

    function pendidikanGroupsFrom(items) {
        const byLevel = {};

        (items || []).forEach(function (item) {
            const level = item.jenjang || 'SMA/SMK';

            if (!byLevel[level]) {
                byLevel[level] = [];
            }

            byLevel[level].push({
                nama_sekolah: item.nama_sekolah || '',
                jurusan: item.jurusan || '',
                tahun: item.tahun || '',
            });
        });

        const levels = JENJANG.slice();

        Object.keys(byLevel).forEach(function (level) {
            if (levels.indexOf(level) === -1) {
                levels.push(level);
            }
        });

        return levels.map(function (level) {
            return {
                j: level,
                items: byLevel[level] && byLevel[level].length ? byLevel[level] : [blankPendidikan()],
            };
        });
    }

    function keluargaGroupsFrom(items) {
        const byKey = {};

        (items || []).forEach(function (item) {
            const key = item.hubungan || 'AYAH';

            if (!byKey[key]) {
                byKey[key] = [];
            }

            byKey[key].push(item);
        });

        return KELUARGA_GROUPS.map(function (group) {
            const src = (byKey[group.k] || []).sort(function (a, b) {
                return (a.urutan || 0) - (b.urutan || 0);
            });

            return {
                k: group.k,
                add: group.add,
                num: group.num,
                items: (src.length ? src : [{}]).map(function (item) {
                    return {
                        nama: item.nama || '',
                        usia: item.usia == null ? '' : String(item.usia),
                        pekerjaan: item.pekerjaan || '',
                    };
                }),
            };
        });
    }

    function tableInput(groupIndex, rowIndex, key, value, cls, extra) {
        return (
            '<td' +
            (cls ? ' class="' + cls + '"' : '') +
            '><input class="fld" data-g="' +
            groupIndex +
            '" data-i="' +
            rowIndex +
            '" data-k="' +
            key +
            '" value="' +
            esc(value) +
            '"' +
            ' autocomplete="off"' +
            (extra || '') +
            '></td>'
        );
    }

    function paintPendidikan() {
        pendidikanBox.innerHTML = pendidikanGroups
            .map(function (group, gi) {
                return group.items
                    .map(function (item, ii) {
                        const last = ii === group.items.length - 1;

                        return (
                            '<tr class="' +
                            (ii === 0 ? 'gs' : '') +
                            '">' +
                            '<td class="c2">' +
                            group.j +
                            '</td>' +
                            tableInput(gi, ii, 'nama_sekolah', item.nama_sekolah) +
                            tableInput(gi, ii, 'jurusan', item.jurusan) +
                            tableInput(gi, ii, 'tahun', item.tahun, 'c5', ' maxlength="10"') +
                            '<td class="c6">' +
                            (group.items.length > 1
                                ? '<button type="button" class="del" data-del="' +
                                  gi +
                                  ':' +
                                  ii +
                                  '" title="Hapus ' +
                                  group.j +
                                  '" aria-label="Hapus ' +
                                  group.j +
                                  '">' +
                                  TRASH_SVG +
                                  '</button>'
                                : '') +
                            (last
                                ? '<button type="button" class="btn sm" data-add="' +
                                  gi +
                                  '" title="Tambah sekolah di jenjang ' +
                                  group.j +
                                  '">' +
                                  PLUS_SVG +
                                  'Tambah</button>'
                                : '') +
                            '</td></tr>'
                        );
                    })
                    .join('');
            })
            .join('');
    }

    function paintKeluarga() {
        keluargaBox.innerHTML = keluargaGroups
            .map(function (group, gi) {
                return group.items
                    .map(function (item, ii) {
                        const last = ii === group.items.length - 1;
                        const label = group.num ? group.k + ' ' + (ii + 1) : group.k;

                        return (
                            '<tr class="' +
                            (ii === 0 ? 'gs' : '') +
                            '">' +
                            '<td class="c2">' +
                            label +
                            '</td>' +
                            tableInput(gi, ii, 'nama', item.nama) +
                            tableInput(gi, ii, 'usia', item.usia, 'c3', ' inputmode="numeric" maxlength="3"') +
                            tableInput(gi, ii, 'pekerjaan', item.pekerjaan) +
                            '<td class="c6">' +
                            (group.add && group.items.length > 1
                                ? '<button type="button" class="del" data-del="' +
                                  gi +
                                  ':' +
                                  ii +
                                  '" title="Hapus ' +
                                  label +
                                  '" aria-label="Hapus ' +
                                  label +
                                  '">' +
                                  TRASH_SVG +
                                  '</button>'
                                : '') +
                            (group.add && last
                                ? '<button type="button" class="btn sm" data-add="' +
                                  gi +
                                  '" title="Tambah ' +
                                  group.k.toLowerCase() +
                                  '">' +
                                  PLUS_SVG +
                                  'Tambah</button>'
                                : '') +
                            '</td></tr>'
                        );
                    })
                    .join('');
            })
            .join('');
    }

    function bindTable(box, groups, paint, blank) {
        box.addEventListener('input', function (e) {
            const el = e.target;

            if (!el.dataset.k) {
                return;
            }

            if (el.dataset.k === 'usia') {
                const digits = el.value.replace(/\D/g, '');

                if (digits !== el.value) {
                    el.value = digits;
                }
            }

            groups()[el.dataset.g].items[el.dataset.i][el.dataset.k] = el.value;
        });

        box.addEventListener('click', function (e) {
            const add = e.target.closest('[data-add]');
            const del = e.target.closest('[data-del]');

            if (add) {
                const gi = Number(add.dataset.add);

                groups()[gi].items.push(blank());
                paint();

                const next = groups()[gi].items.length - 1;
                const first = box.querySelector('.fld[data-g="' + gi + '"][data-i="' + next + '"]');

                if (first) {
                    first.focus();
                    first.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            } else if (del) {
                const parts = del.dataset.del.split(':');

                groups()[Number(parts[0])].items.splice(Number(parts[1]), 1);
                paint();
            }
        });
    }

    function renderPendidikan(items) {
        pendidikanGroups = pendidikanGroupsFrom(items);
        paintPendidikan();
    }

    function renderKeluarga(items) {
        keluargaGroups = keluargaGroupsFrom(items);
        paintKeluarga();
    }

    function collectPendidikan() {
        const items = [];

        pendidikanGroups.forEach(function (group) {
            group.items.forEach(function (item) {
                const nama = (item.nama_sekolah || '').trim();
                const jurusan = (item.jurusan || '').trim();
                const tahun = (item.tahun || '').trim();

                if (nama || jurusan || tahun) {
                    items.push({
                        jenjang: group.j,
                        nama_sekolah: nama,
                        jurusan: jurusan,
                        tahun: tahun,
                        aktif: true,
                    });
                }
            });
        });

        return items;
    }

    function collectKeluarga() {
        const items = [];

        keluargaGroups.forEach(function (group) {
            group.items.forEach(function (item, index) {
                const nama = (item.nama || '').trim();
                const usia = String(item.usia || '').trim();
                const pekerjaan = (item.pekerjaan || '').trim();

                if (nama || usia || pekerjaan) {
                    items.push({
                        hubungan: group.k,
                        urutan: index + 1,
                        nama: nama,
                        usia: usia,
                        pekerjaan: pekerjaan,
                        aktif: true,
                    });
                }
            });
        });

        return items;
    }

    function savePendidikan() {
        return window.axios
            .put('/api/data-pegawai/wizard/' + employeeId + '/pendidikan', { items: collectPendidikan() })
            .then(function (res) {
                renderPendidikan(res.data.items);
                applyProgress(res.data.progress);
            });
    }

    function saveKeluarga() {
        return window.axios
            .put('/api/data-pegawai/wizard/' + employeeId + '/keluarga', { items: collectKeluarga() })
            .then(function (res) {
                renderKeluarga(res.data.items);
                applyProgress(res.data.progress);
            });
    }

    // ---- langkah 4: ciri fisik ----
    const FISIK_FIELDS = [
        'warna_kulit',
        'golongan_darah',
        'warna_rambut',
        'ukuran_baju',
        'warna_mata',
        'ukuran_celana',
        'tinggi_badan',
        'ukuran_sepatu',
        'berat_badan',
    ];

    function saveCiriFisik() {
        const data = {};

        FISIK_FIELDS.forEach(function (field) {
            data[field] = val(field);
        });

        return window.axios
            .put('/api/data-pegawai/wizard/' + employeeId + '/ciri-fisik', data)
            .then(function (res) {
                fillCiriFisik(res.data.data);
                applyProgress(res.data.progress);
            });
    }

    function fillCiriFisik(data) {
        if (!data) {
            return;
        }

        FISIK_FIELDS.forEach(function (field) {
            setVal(field, data[field]);
        });
    }

    // ---- langkah 5: dokumen ----
    const DOC_CATS = [
        { id: 'KK', title: 'Kartu Keluarga', label: 'Nomor KK', hint: '16 digit angka' },
        { id: 'KTP', title: 'KTP', label: 'Nomor NIK', hint: '16 digit angka' },
        { id: 'NPWP', title: 'NPWP', label: 'Nomor NPWP', hint: '15 atau 16 digit angka' },
    ];
    const UPLOAD_SVG =
        '<svg class="i" viewBox="0 0 16 16"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v3h11v-3"/></svg>';
    const MAX_FILE = 10 * 1024 * 1024;
    const FILE_EXT = /\.(pdf|jpe?g|png)$/i;
    const FILE_PDF = /\.pdf$/i;

    function docCat(id) {
        return DOC_CATS.filter(function (item) {
            return item.id === id;
        })[0];
    }

    function docById(id) {
        return docs.filter(function (doc) {
            return String(doc.id) === String(id);
        })[0];
    }

    function docSize(bytes) {
        return bytes < 1048576
            ? Math.max(1, Math.round(bytes / 1024)) + ' KB'
            : (bytes / 1048576).toFixed(1) + ' MB';
    }

    function docDate(stamp) {
        return new Date(stamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function docType(doc) {
        return doc.type === 'application/pdf' || FILE_PDF.test(doc.name)
            ? 'PDF'
            : /png$/i.test(doc.name)
              ? 'PNG'
              : 'JPG';
    }

    function dropzone(cat, multiple) {
        return (
            '<div class="dz" data-dz="' +
            cat +
            '">' +
            UPLOAD_SVG +
            '<p><button type="button" class="btn sm" data-act="pick" data-cat="' +
            cat +
            '">Pilih file</button> atau seret ke sini</p><small>PDF, JPG, PNG · maks 10 MB</small>' +
            '<input type="file" hidden data-upload="' +
            cat +
            '"' +
            (multiple ? ' multiple' : '') +
            ' accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"></div>'
        );
    }

    function docRow(doc) {
        const title = doc.title ? String(doc.title).trim() : '';

        return (
            '<div class="wz-frow"><div class="th">' +
            (docType(doc) === 'PDF' ? 'PDF' : '<img alt="" src="' + esc(doc.url) + '">') +
            '</div><div class="fi"><b title="' +
            esc(title || doc.name) +
            '">' +
            esc(title || doc.name) +
            '</b><small>' +
            (title ? esc(doc.name) + ' · ' : '') +
            docType(doc) +
            ' · ' +
            docSize(doc.size) +
            ' · ' +
            docDate(doc.date) +
            '</small></div><div class="ac">' +
            '<button type="button" class="btn sm" data-act="view" data-id="' +
            doc.id +
            '">Lihat</button>' +
            '<button type="button" class="btn sm dg" data-act="del-doc" data-id="' +
            doc.id +
            '">Hapus</button>' +
            '</div></div>'
        );
    }

    function renderDocs() {
        utamaBox.innerHTML = DOC_CATS.map(function (cat) {
            const doc = docs.filter(function (item) {
                return item.cat === cat.id;
            })[0];

            return (
                '<section class="wz-doc-box"><div class="wz-doc-hd"><h3>' +
                cat.title +
                '</h3><span class="bdg' +
                (doc ? ' ok' : '') +
                '">' +
                (doc ? 'Terunggah' : 'Belum diunggah') +
                '</span></div><div class="wz-doc-bd"><div>' +
                '<label class="lb" for="w-nomor-' +
                cat.id +
                '">' +
                cat.label +
                ' <span class="rq">*</span></label>' +
                '<input class="fld" id="w-nomor-' +
                cat.id +
                '" data-cat="' +
                cat.id +
                '" inputmode="numeric" autocomplete="off" value="' +
                esc(nomor[cat.id] || '') +
                '">' +
                '<p class="hint">' +
                cat.hint +
                '</p></div><div>' +
                (doc ? docRow(doc) : dropzone(cat.id, false)) +
                '</div></div></section>'
            );
        }).join('');

        const others = docs.filter(function (doc) {
            return doc.cat === 'LAIN';
        });

        lainBox.innerHTML =
            '<section class="wz-doc-box"><div class="wz-doc-hd"><h3>Dokumen Lainnya</h3><span class="bdg' +
            (others.length ? ' ok' : '') +
            '">' +
            others.length +
            ' file</span></div><div class="wz-doc-bd one"><div>' +
            dropzone('LAIN', true) +
            '<p class="hint">Setiap file bisa diberi judul saat diunggah. Judul bersifat opsional.</p>' +
            '<div class="wz-flist">' +
            others.map(docRow).join('') +
            '</div></div></div></section>';
    }

    function saveNomorDokumen() {
        const payload = {
            KK: val('nomor-KK'),
            KTP: val('nomor-KTP'),
            NPWP: val('nomor-NPWP'),
        };

        return window.axios
            .put('/api/data-pegawai/wizard/' + employeeId + '/nomor-dokumen', { nomor: payload })
            .then(function (res) {
                nomor = res.data.nomor || payload;
                applyProgress(res.data.progress);
            });
    }

    function checkFiles(files) {
        const errors = [];
        const ok = [];

        Array.prototype.forEach.call(files, function (file) {
            if (!FILE_EXT.test(file.name)) {
                errors.push(file.name + ': format tidak didukung. Gunakan PDF, JPG, atau PNG.');
            } else if (file.size > MAX_FILE) {
                errors.push(file.name + ': ukuran ' + docSize(file.size) + ' melebihi batas 10 MB.');
            } else {
                ok.push(file);
            }
        });

        return { errors: errors, ok: ok };
    }

    function uploadFiles(cat, files, titles) {
        if (!employeeId) {
            say('Simpan Data Pribadi terlebih dahulu.');
            return;
        }

        const meta = docCat(cat);
        let list = Array.prototype.slice.call(files);

        if (meta) {
            list = list.slice(0, 1);
        }

        if (!list.length) {
            return;
        }

        const tasks = list.map(function (file, index) {
            const body = new FormData();
            const value = val('nomor-' + cat);

            body.append('kategori', cat);
            body.append('file', file);

            if (titles && titles[index]) {
                body.append('judul', titles[index]);
            }

            if (value) {
                body.append('nomor', value);
            }

            return window.axios.post('/api/data-pegawai/wizard/' + employeeId + '/dokumen', body);
        });

        Promise.all(tasks)
            .then(function (responses) {
                responses.forEach(function (res) {
                    const doc = res.data.dokumen;

                    docs = docs.filter(function (item) {
                        return String(item.id) !== String(doc.id) && (cat === 'LAIN' || item.cat !== cat);
                    });
                    docs.push(doc);

                    if (res.data.progress) {
                        applyProgress(res.data.progress);
                    }
                });

                renderDocs();
                say(
                    meta
                        ? 'Dokumen ' + meta.title + ' berhasil diunggah.'
                        : list.length + ' dokumen berhasil diunggah.',
                );
            })
            .catch(fail);
    }

    function handleFiles(cat, files) {
        const checked = checkFiles(files);

        if (checked.errors.length) {
            say(checked.errors[0]);
        }

        if (!checked.ok.length) {
            return;
        }

        if (cat === 'LAIN') {
            openTitles(checked.ok);
            return;
        }

        uploadFiles(cat, checked.ok);
    }

    function openTitles(files) {
        pendingFiles = files;
        ov.innerHTML =
            '<div class="wz-dlg" role="dialog" aria-modal="true" aria-label="Judul Dokumen"><div class="wz-dh"><b>Judul Dokumen</b>' +
            '<button type="button" class="x" data-act="close" aria-label="Tutup"><svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div>' +
            '<div class="wz-db"><p class="wz-tlh">Beri judul untuk setiap dokumen. Judul bersifat opsional, boleh dikosongkan.</p><div class="wz-tlst">' +
            files
                .map(function (file, index) {
                    return (
                        '<div class="wz-trow"><div class="wz-tn"><b title="' +
                        esc(file.name) +
                        '">' +
                        esc(file.name) +
                        '</b><small>' +
                        (/\.pdf$/i.test(file.name) ? 'PDF' : /\.png$/i.test(file.name) ? 'PNG' : 'JPG') +
                        ' · ' +
                        docSize(file.size) +
                        '</small></div><input class="fld" data-title="' +
                        index +
                        '" maxlength="120" autocomplete="off" placeholder="Judul dokumen (opsional)"></div>'
                    );
                })
                .join('') +
            '</div></div><div class="wz-df"><button type="button" class="btn" data-act="close">Batal</button>' +
            '<button type="button" class="btn go" data-act="upload-lain">Unggah</button></div></div>';

        ov.hidden = false;
        document.body.style.overflow = 'hidden';

        const first = ov.querySelector('[data-title]');

        if (first) {
            first.focus();
        }
    }

    function closeTitles() {
        ov.hidden = true;
        ov.innerHTML = '';
        pendingFiles = null;
        document.body.style.overflow = '';
    }

    function deleteDoc(id) {
        if (!employeeId) {
            return;
        }

        window.axios
            .delete('/api/data-pegawai/wizard/' + employeeId + '/dokumen/' + id)
            .then(function (res) {
                docs = docs.filter(function (doc) {
                    return String(doc.id) !== String(id);
                });

                applyProgress(res.data.progress);
                renderDocs();
                say('Dokumen dihapus.');
            })
            .catch(fail);
    }

    // ---- navigasi simpan ----
    function saveStep() {
        if (step === 1) {
            return saveDataPribadi();
        }

        if (!employeeId) {
            return Promise.reject({
                response: { data: { message: 'Lengkapi Data Pribadi terlebih dahulu.' } },
            });
        }

        if (step === 2) {
            return savePendidikan();
        }

        if (step === 3) {
            return saveKeluarga();
        }

        if (step === 4) {
            return saveCiriFisik();
        }

        return saveNomorDokumen();
    }

    function finish() {
        window.location.href = root.dataset.back || '/modul/data-pegawai';
    }

    function advance() {
        if (busy) {
            return;
        }

        busy = true;
        btnNext.disabled = true;
        btnNext.textContent = 'Menyimpan…';

        Promise.resolve()
            .then(saveStep)
            .then(function () {
                if (step < TOTAL) {
                    goTo(step + 1);
                } else {
                    finish();
                }
            })
            .catch(fail)
            .finally(function () {
                busy = false;
                btnNext.disabled = false;
                paintNav();
            });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        advance();
    });

    btnNext.addEventListener('click', advance);

    btnPrev.addEventListener('click', function () {
        goTo(step - 1);
    });

    bindTable(
        pendidikanBox,
        function () {
            return pendidikanGroups;
        },
        paintPendidikan,
        blankPendidikan,
    );

    bindTable(
        keluargaBox,
        function () {
            return keluargaGroups;
        },
        paintKeluarga,
        blankKeluarga,
    );

    // ---- unggah & hapus dokumen ----
    root.addEventListener('change', function (e) {
        const input = e.target.closest('input[data-upload]');

        if (!input) {
            return;
        }

        const cat = input.dataset.upload;
        const files = Array.prototype.slice.call(input.files || []);

        input.value = '';
        handleFiles(cat, files);
    });

    root.addEventListener('input', function (e) {
        const el = e.target;

        if (el.dataset && el.dataset.cat && el.id === 'w-nomor-' + el.dataset.cat) {
            nomor[el.dataset.cat] = el.value;
        }
    });

    root.addEventListener('click', function (e) {
        const button = e.target.closest('[data-act]');

        if (!button) {
            return;
        }

        const action = button.dataset.act;

        if (action === 'pick') {
            const zone = button.closest('.dz');

            if (zone) {
                const input = zone.querySelector('input[type=file]');

                if (input) {
                    input.click();
                }
            }
        } else if (action === 'view') {
            const doc = docById(button.dataset.id);

            if (doc) {
                window.open(doc.url, '_blank', 'noopener');
            }
        } else if (action === 'del-doc') {
            const doc = docById(button.dataset.id);

            if (doc && window.confirm('Hapus dokumen "' + (doc.title || doc.name) + '"?')) {
                deleteDoc(doc.id);
            }
        }
    });

    ov.addEventListener('click', function (e) {
        if (e.target === ov) {
            closeTitles();
            return;
        }

        const button = e.target.closest('[data-act]');

        if (!button) {
            return;
        }

        if (button.dataset.act === 'close') {
            closeTitles();
        } else if (button.dataset.act === 'upload-lain') {
            const files = pendingFiles;
            const titles = {};

            ov.querySelectorAll('[data-title]').forEach(function (input) {
                titles[input.dataset.title] = input.value.trim();
            });

            closeTitles();

            if (files) {
                uploadFiles('LAIN', files, titles);
            }
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && ov && !ov.hidden) {
            closeTitles();
        }
    });

    ['dragover', 'dragleave', 'drop'].forEach(function (type) {
        root.addEventListener(type, function (e) {
            const zone = e.target.closest && e.target.closest('.dz');

            if (!zone) {
                return;
            }

            e.preventDefault();

            if (type === 'dragover') {
                zone.classList.add('ov');
            } else {
                zone.classList.remove('ov');
            }

            if (type === 'drop' && e.dataTransfer) {
                handleFiles(zone.dataset.dz, e.dataTransfer.files);
            }
        });
    });

    window.addEventListener('dragover', function (e) {
        if (root.isConnected) {
            e.preventDefault();
        }
    });

    window.addEventListener('drop', function (e) {
        if (root.isConnected) {
            e.preventDefault();
        }
    });

    // ---- muat data yang sudah tersimpan ----
    function loadState() {
        return window.axios
            .get('/api/data-pegawai/wizard/' + employeeId)
            .then(function (res) {
                const data = res.data;

                fillDataPribadi(data.data_pribadi);
                renderPendidikan(data.pendidikan);
                renderKeluarga(data.keluarga);
                fillCiriFisik(data.ciri_fisik);
                docs = (data.dokumen && data.dokumen.dokumen) || [];
                nomor = (data.dokumen && data.dokumen.nomor) || {};
                progress = data.progress || {};

                renderDocs();
                paintNav();
            })
            .catch(fail);
    }

    renderPendidikan([]);
    renderKeluarga([]);
    renderDocs();
    paintNav();

    if (employeeId) {
        loadState();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataPegawaiWizard);
} else {
    initDataPegawaiWizard();
}

document.addEventListener('livewire:navigated', initDataPegawaiWizard);
