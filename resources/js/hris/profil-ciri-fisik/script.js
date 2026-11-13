const initializedRoots = new WeakSet();

function initProfilCiriFisik() {
    const root = document.getElementById('profil-ciri-fisik');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    var KEY = 'ciri-fisik',
        f = document.getElementById('f'),
        toast = document.getElementById('toast'),
        editBtn = document.getElementById('edit'),
        saveBtn = document.getElementById('save'),
        bar = document.getElementById('bar');

    function fields() {
        return Array.prototype.slice.call(f.querySelectorAll('.fld'));
    }

    function mode(on) {
        fields().forEach(function (el) {
            el.disabled = !on;
            el.placeholder = on ? '' : '-';
        });
        editBtn.hidden = on;
        bar.hidden = !on;
    }

    function load() {
        var d = {};

        try {
            d = JSON.parse(localStorage.getItem(KEY)) || {};
        } catch (e) {
            d = {};
        }

        fields().forEach(function (el) {
            el.value = d[el.id] || '';
        });
    }

    editBtn.onclick = function () {
        mode(true);
        fields()[0].focus();
    };

    document.getElementById('cancel').onclick = function () {
        load();
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

        try {
            localStorage.setItem(KEY, JSON.stringify(d));
        } catch (e) {
            // abaikan bila penyimpanan lokal penuh
        }

        mode(false);
        document.dispatchEvent(new CustomEvent('cirifisik-save', { detail: d }));
        toast.textContent = 'Ciri fisik berhasil disimpan.';
        toast.classList.add('on');
        clearTimeout(toast.t);
        toast.t = setTimeout(function () {
            toast.classList.remove('on');
        }, 2400);
    };

    load();
    mode(false);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilCiriFisik);
} else {
    initProfilCiriFisik();
}

document.addEventListener('livewire:navigated', initProfilCiriFisik);
