const initializedRoots = new WeakSet();

function initProfilDataPribadi() {
    const root = document.getElementById('profil-data-pribadi');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    const params = {};
    const nik = new URLSearchParams(window.location.search).get('nik');

    if (nik) {
        params.nik = nik;
    }

    var f = document.getElementById('f'),
        bar = document.getElementById('bar'),
        editBtn = document.getElementById('edit'),
        phbtn = document.getElementById('phbtn'),
        phimg = document.getElementById('phimg'),
        av = document.getElementById('av'),
        fkdel = document.getElementById('fkdel'),
        fkd = document.getElementById('fkd'),
        fkn = document.getElementById('fkn'),
        toast = document.getElementById('toast'),
        editing = false,
        last = {},
        state = { faskes: false, photo: '' };

    // avatar piksel bawaan
    (function () {
        var p = ['01010', '11111', '01110', '11011', '01010'],
            h = '<rect width="5" height="5" fill="#fbeaf5"/>';

        p.forEach(function (r, y) {
            for (var x = 0; x < 5; x += 1) {
                if (r[x] === '1') {
                    h += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + ((x + y) % 2 ? '#e279bd' : '#d65aab') + '"/>';
                }
            }
        });

        av.innerHTML = h;
    })();

    function fields() {
        return Array.prototype.slice.call(f.querySelectorAll('.fld'));
    }

    function say(m) {
        toast.textContent = m;
        toast.classList.add('on');
        clearTimeout(say.t);
        say.t = setTimeout(function () {
            toast.classList.remove('on');
        }, 2600);
    }

    function fail(e) {
        var errors = e && e.response && e.response.data && e.response.data.errors;
        var first = errors ? Object.keys(errors)[0] : null;

        if (first) {
            say(errors[first][0]);
            return;
        }

        say((e && e.response && e.response.data && e.response.data.message) || 'Data gagal disimpan.');
    }

    function apply(d) {
        last = d || {};

        fields().forEach(function (el) {
            el.value = d[el.id] == null ? '' : d[el.id];
            el.classList.remove('bad');
        });

        f.querySelectorAll('input[name="gender"]').forEach(function (r) {
            r.checked = d.gender === r.value;
        });

        state.faskes = d.faskes_terpilih === true;
        state.photo = d.photo_url || '';
        showFaskes();
        showPhoto();
        head();
    }

    function hasFaskes() {
        return [
            'faskes_provinsi',
            'faskes_kantor_regional',
            'faskes_kantor_cabang',
            'faskes_kabupaten_kota',
            'faskes_kode_ppk',
            'faskes_nama_ppk',
            'faskes_alamat_ppk',
            'faskes_telp_ppk',
        ].some(function (id) {
            return document.getElementById(id).value.trim() !== '';
        });
    }

    function collect() {
        var d = {};

        fields().forEach(function (el) {
            d[el.id] = el.value.trim();
        });

        ['code_pajak', 'code_nikah', 'code_status'].forEach(function (k) {
            d[k] = (d[k] || '').toUpperCase();
        });

        var g = f.querySelector('input[name="gender"]:checked');

        d.gender = g ? g.value : '';
        d.faskes_terpilih = state.faskes || hasFaskes();
        return d;
    }

    function showFaskes() {
        var show = state.faskes || editing;

        fkd.hidden = !show;
        fkn.hidden = show;
    }

    function showPhoto() {
        if (state.photo) {
            phimg.src = state.photo;
            phimg.hidden = false;
            av.style.display = 'none';
        } else {
            phimg.hidden = true;
            av.style.display = '';
        }
    }

    function head() {
        document.getElementById('nm').textContent = document.getElementById('nama').value.trim() || 'Karyawan HWI';

        var sub = [document.getElementById('jabatan').value, document.getElementById('departemen').value.trim()]
                .filter(Boolean)
                .join(' · '),
            s = document.getElementById('sub');

        s.textContent = sub;
        s.hidden = !sub;
    }

    function mode(on) {
        editing = on;
        f.classList.toggle('view', !on);
        fields().forEach(function (el) {
            el.disabled = !on;
            el.placeholder = on ? '' : '-';
        });
        f.querySelectorAll('input[name="gender"]').forEach(function (r) {
            r.disabled = !on;
        });
        fkdel.disabled = !on;
        bar.hidden = !on;
        editBtn.hidden = on;
        phbtn.hidden = !on;
        showFaskes();
    }

    function load() {
        window.axios
            .get('/api/profil/data-pribadi', { params: params })
            .then(function (res) {
                apply(res.data);
                mode(false);
            })
            .catch(fail);
    }

    editBtn.onclick = function () {
        mode(true);
        document.getElementById('nik').focus();
    };

    document.getElementById('cancel').onclick = function () {
        apply(last);
        mode(false);
    };

    fkdel.onclick = function () {
        [
            'faskes_provinsi',
            'faskes_kantor_regional',
            'faskes_kantor_cabang',
            'faskes_kabupaten_kota',
            'faskes_kode_ppk',
            'faskes_nama_ppk',
            'faskes_alamat_ppk',
            'faskes_telp_ppk',
        ].forEach(function (id) {
            document.getElementById(id).value = '';
        });

        state.faskes = false;
        showFaskes();
    };

    f.addEventListener('input', function (e) {
        e.target.classList.remove('bad');
        head();
    });

    document.getElementById('phfile').onchange = function () {
        var file = this.files[0];

        if (!file) {
            return;
        }

        var body = new FormData();
        body.append('photo', file);

        window.axios
            .post('/api/profil/data-pribadi/photo', body, { params: params })
            .then(function (res) {
                state.photo = res.data.photo_url || '';
                showPhoto();
                say('Foto profil berhasil diperbarui.');
            })
            .catch(fail);
    };

    f.addEventListener('submit', function (e) {
        e.preventDefault();

        var first = null;

        fields().forEach(function (el) {
            var v = el.value.trim(),
                bad = el.required && !v;

            if (el.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
                bad = true;
            }

            el.classList.toggle('bad', bad);

            if (bad && !first) {
                first = el;
            }
        });

        if (first) {
            say('Lengkapi kolom bertanda * dengan benar.');
            first.scrollIntoView({ behavior: 'smooth', block: 'center' });
            first.focus();
            return;
        }

        window.axios
            .put('/api/profil/data-pribadi', collect(), { params: params })
            .then(function (res) {
                apply(res.data);
                mode(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                say('Profil berhasil disimpan.');
            })
            .catch(fail);
    });

    load();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilDataPribadi);
} else {
    initProfilDataPribadi();
}

document.addEventListener('livewire:navigated', initProfilDataPribadi);
