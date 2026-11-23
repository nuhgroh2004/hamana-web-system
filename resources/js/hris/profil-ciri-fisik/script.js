const initializedRoots = new WeakSet();

function initProfilCiriFisik() {
    const root = document.getElementById('profil-ciri-fisik');

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
        toast = document.getElementById('toast'),
        editBtn = document.getElementById('edit'),
        saveBtn = document.getElementById('save'),
        bar = document.getElementById('bar'),
        last = {};

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

        say(first ? errors[first][0] : (e && e.response && e.response.data && e.response.data.message) || 'Data gagal disimpan.');
    }

    function mode(on) {
        fields().forEach(function (el) {
            el.disabled = !on;
            el.placeholder = on ? '' : '-';
        });
        editBtn.hidden = on;
        bar.hidden = !on;
    }

    function apply(d) {
        last = d || {};

        fields().forEach(function (el) {
            el.value = d[el.id] == null ? '' : d[el.id];
            el.classList.remove('bad');
        });
    }

    function load() {
        window.axios
            .get('/api/profil/ciri-fisik', { params: params })
            .then(function (res) {
                apply(res.data);
                mode(false);
            })
            .catch(fail);
    }

    editBtn.onclick = function () {
        mode(true);
        fields()[0].focus();
    };

    document.getElementById('cancel').onclick = function () {
        apply(last);
        mode(false);
    };

    document.getElementById('golongan_darah').addEventListener('input', function () {
        this.value = this.value.toUpperCase();
    });

    saveBtn.onclick = function () {
        var d = {};

        fields().forEach(function (el) {
            el.value = el.value.trim();
            d[el.id] = el.value;
        });

        window.axios
            .put('/api/profil/ciri-fisik', d, { params: params })
            .then(function (res) {
                apply(res.data);
                mode(false);
                say('Ciri fisik berhasil disimpan.');
            })
            .catch(fail);
    };

    load();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilCiriFisik);
} else {
    initProfilCiriFisik();
}

document.addEventListener('livewire:navigated', initProfilCiriFisik);
