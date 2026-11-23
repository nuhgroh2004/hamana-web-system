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

    let employeeId = Number(root.dataset.employee) || null;
    let step = 1;
    let busy = false;
    let progress = {};
    let docs = [];

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

    // ---- kartu dinamis: pendidikan & keluarga ----
    function buildCard(config) {
        const card = document.createElement('div');
        card.className = 'wz-card';

        const fields = config.fields
            .map(function (field) {
                const label =
                    '<label class="lb">' +
                    esc(field.label) +
                    (field.required ? ' <span class="rq">*</span>' : '') +
                    '</label>';
                const cls = field.wide ? 'f wide' : 'f';
                let control;

                if (field.type === 'select') {
                    control =
                        '<select class="fld" data-f="' +
                        field.key +
                        '">' +
                        field.options
                            .map(function (option) {
                                return '<option>' + esc(option) + '</option>';
                            })
                            .join('') +
                        '</select>';
                } else {
                    control =
                        '<input class="fld" data-f="' +
                        field.key +
                        '" autocomplete="off"' +
                        (field.numeric ? ' inputmode="numeric"' : '') +
                        (field.maxlength ? ' maxlength="' + field.maxlength + '"' : '') +
                        '>';
                }

                return '<div class="' + cls + '">' + label + control + '</div>';
            })
            .join('');

        card.innerHTML =
            '<div class="wz-card-head">' +
            '<b data-title>' +
            esc(config.label) +
            '</b>' +
            '<label class="chk"><input type="checkbox" data-f="aktif"> Aktif</label>' +
            '<button type="button" class="btn sm dgb" data-remove>Hapus</button>' +
            '</div>' +
            '<div class="wz-grid">' +
            fields +
            '</div>';

        config.fields.forEach(function (field) {
            const el = card.querySelector('[data-f="' + field.key + '"]');
            const value = config.values ? config.values[field.key] : null;

            if (!el) {
                return;
            }

            if (field.type === 'select') {
                el.value = value || (config.defaults && config.defaults[field.key]) || field.options[0];
            } else {
                el.value = value == null ? '' : value;
            }
        });

        const aktif = card.querySelector('[data-f="aktif"]');
        aktif.checked = config.values ? config.values.aktif !== false : true;

        card.querySelector('[data-remove]').addEventListener('click', function () {
            card.remove();
            renumber(config.box, config.label);
        });

        return card;
    }

    function renumber(box, label) {
        Array.from(box.querySelectorAll('.wz-card')).forEach(function (card, index) {
            const title = card.querySelector('[data-title]');

            if (title) {
                title.textContent = label + ' ' + (index + 1);
            }
        });
    }

    const PENDIDIKAN_FIELDS = [
        { key: 'jenjang', label: 'Jenjang', type: 'select', options: JENJANG, required: true },
        { key: 'nama_sekolah', label: 'Nama Sekolah', wide: true },
        { key: 'jurusan', label: 'Jurusan' },
        { key: 'tahun', label: 'Tahun', numeric: true, maxlength: 10 },
    ];

    const KELUARGA_FIELDS = [
        { key: 'hubungan', label: 'Hubungan', type: 'select', options: HUBUNGAN, required: true },
        { key: 'urutan', label: 'Urutan', numeric: true, maxlength: 3 },
        { key: 'nama', label: 'Nama Lengkap', wide: true },
        { key: 'usia', label: 'Usia', numeric: true, maxlength: 3 },
        { key: 'pekerjaan', label: 'Pekerjaan' },
    ];

    function addPendidikan(values) {
        const card = buildCard({
            box: pendidikanBox,
            label: 'Pendidikan',
            fields: PENDIDIKAN_FIELDS,
            values: values,
            defaults: { jenjang: 'SMA/SMK' },
        });

        pendidikanBox.appendChild(card);
        renumber(pendidikanBox, 'Pendidikan');

        return card;
    }

    function addKeluarga(values) {
        const card = buildCard({
            box: keluargaBox,
            label: 'Anggota Keluarga',
            fields: KELUARGA_FIELDS,
            values: values,
            defaults: { hubungan: 'AYAH' },
        });

        keluargaBox.appendChild(card);
        renumber(keluargaBox, 'Anggota Keluarga');

        return card;
    }

    function renderPendidikan(items) {
        pendidikanBox.innerHTML = '';

        (items && items.length ? items : [{}]).forEach(function (item) {
            addPendidikan(item);
        });
    }

    function renderKeluarga(items) {
        keluargaBox.innerHTML = '';

        (items && items.length ? items : [{}]).forEach(function (item) {
            addKeluarga(item);
        });
    }

    function collectCards(box, fields) {
        return Array.from(box.querySelectorAll('.wz-card'))
            .map(function (card) {
                const item = {};

                fields.forEach(function (field) {
                    const el = card.querySelector('[data-f="' + field + '"]');
                    item[field] = el ? el.value.trim() : '';
                });

                const aktif = card.querySelector('[data-f="aktif"]');
                item.aktif = aktif ? aktif.checked : true;

                return item;
            })
            .filter(function (item) {
                return ['nama_sekolah', 'jurusan', 'tahun', 'nama', 'usia', 'pekerjaan'].some(function (field) {
                    return item[field] !== undefined && item[field] !== '';
                });
            });
    }

    function savePendidikan() {
        const items = collectCards(pendidikanBox, ['jenjang', 'nama_sekolah', 'jurusan', 'tahun']);

        return window.axios
            .put('/api/data-pegawai/wizard/' + employeeId + '/pendidikan', { items: items })
            .then(function (res) {
                renderPendidikan(res.data.items);
                applyProgress(res.data.progress);
            });
    }

    function saveKeluarga() {
        const items = collectCards(keluargaBox, ['hubungan', 'urutan', 'nama', 'usia', 'pekerjaan']).map(function (item) {
            item.urutan = item.urutan === '' ? null : Number(item.urutan);
            item.usia = item.usia === '' ? null : Number(item.usia);

            return item;
        });

        return window.axios
            .put('/api/data-pegawai/wizard/' + employeeId + '/keluarga', { items: items })
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
    function fillNomor(nomor) {
        nomor = nomor || {};

        ['KK', 'KTP', 'NPWP'].forEach(function (cat) {
            setVal('nomor-' + cat, nomor[cat]);
        });
    }

    function renderDocs() {
        ['KK', 'KTP', 'NPWP'].forEach(function (cat) {
            const block = root.querySelector('.wz-doc[data-cat="' + cat + '"]');
            const doc = docs.filter(function (item) {
                return item.cat === cat;
            })[0];
            const badge = block.querySelector('[data-file]');
            const del = block.querySelector('[data-del]');

            if (doc) {
                badge.textContent = doc.name;
                del.hidden = false;
                del.dataset.id = doc.id;
            } else {
                badge.textContent = 'Belum ada';
                del.hidden = true;
                delete del.dataset.id;
            }
        });

        const lain = root.querySelector('.wz-doc[data-cat="LAIN"]');
        const list = lain.querySelector('[data-list]');
        const others = docs.filter(function (item) {
            return item.cat === 'LAIN';
        });

        list.innerHTML = others
            .map(function (doc) {
                return (
                    '<div class="wz-file"><span>' +
                    esc(doc.title || doc.name) +
                    '</span><button type="button" class="btn sm dgb" data-del-id="' +
                    esc(doc.id) +
                    '">Hapus</button></div>'
                );
            })
            .join('');

        lain.querySelector('[data-file]').textContent = others.length ? others.length + ' file' : 'Belum ada';
    }

    function saveNomorDokumen() {
        return window.axios
            .put('/api/data-pegawai/wizard/' + employeeId + '/nomor-dokumen', {
                nomor: {
                    KK: val('nomor-KK'),
                    KTP: val('nomor-KTP'),
                    NPWP: val('nomor-NPWP'),
                },
            })
            .then(function (res) {
                applyProgress(res.data.progress);
            });
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

    document.getElementById('wz-add-pendidikan').addEventListener('click', function () {
        addPendidikan({});
    });

    document.getElementById('wz-add-keluarga').addEventListener('click', function () {
        addKeluarga({});
    });

    // ---- unggah & hapus dokumen ----
    root.addEventListener('change', function (e) {
        const input = e.target.closest('[data-upload]');

        if (!input) {
            return;
        }

        const file = input.files && input.files[0];

        if (!file) {
            return;
        }

        if (!employeeId) {
            input.value = '';
            say('Simpan Data Pribadi terlebih dahulu.');
            return;
        }

        const cat = input.dataset.upload;
        const body = new FormData();
        body.append('kategori', cat);
        body.append('file', file);

        if (cat === 'LAIN') {
            body.append('judul', val('lain-judul'));
        }

        input.disabled = true;

        window.axios
            .post('/api/data-pegawai/wizard/' + employeeId + '/dokumen', body)
            .then(function (res) {
                docs = docs.filter(function (doc) {
                    return doc.cat !== cat || cat === 'LAIN';
                });
                docs.push(res.data.dokumen);

                if (cat === 'LAIN') {
                    setVal('lain-judul', '');
                }

                applyProgress(res.data.progress);
                renderDocs();
                say('Dokumen berhasil diunggah.');
            })
            .catch(fail)
            .finally(function () {
                input.disabled = false;
                input.value = '';
            });
    });

    root.addEventListener('click', function (e) {
        const del = e.target.closest('[data-del], [data-del-id]');

        if (!del || !employeeId) {
            return;
        }

        const id = del.dataset.id || del.dataset.delId;

        if (!id) {
            return;
        }

        del.disabled = true;

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
            .catch(fail)
            .finally(function () {
                del.disabled = false;
            });
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
                fillNomor((data.dokumen && data.dokumen.nomor) || {});
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
