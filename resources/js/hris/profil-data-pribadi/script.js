const initializedRoots = new WeakSet();

function initProfilDataPribadi() {
    const root = document.getElementById('profil-data-pribadi');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    var KEY = 'profil-karyawan',
        f = document.getElementById('f'),
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
        state = { faskes: true, photo: '' };

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
        }, 2400);
    }

    function read() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function write(d) {
        try {
            localStorage.setItem(KEY, JSON.stringify(d));
        } catch (e) {
            say('Penyimpanan lokal penuh, data tidak tersimpan.');
        }
    }

    function apply(d) {
        fields().forEach(function (el) {
            el.value = d[el.id] || '';
            el.classList.remove('bad');
        });
        f.querySelectorAll('input[name="gender"]').forEach(function (r) {
            r.checked = d.gender === r.value;
        });
        state.faskes = d.faskes !== false;
        state.photo = d.photo || '';
        showFaskes();
        showPhoto();
        head();
    }

    function collect() {
        var d = {};
        fields().forEach(function (el) {
            d[el.id] = el.value.trim();
        });
        ['code_pajak', 'code_nikah', 'code_status'].forEach(function (k) {
            d[k] = d[k].toUpperCase();
        });
        var g = f.querySelector('input[name="gender"]:checked');
        d.gender = g ? g.value : '';
        d.faskes = state.faskes;
        d.photo = state.photo;
        return d;
    }

    function showFaskes() {
        fkd.hidden = !state.faskes;
        fkn.hidden = state.faskes;
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
    }

    editBtn.onclick = function () {
        mode(true);
        document.getElementById('nik').focus();
    };

    document.getElementById('cancel').onclick = function () {
        apply(read());
        mode(false);
    };

    fkdel.onclick = function () {
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

        var rd = new FileReader();

        rd.onload = function () {
            var im = new Image();

            im.onload = function () {
                var c = document.createElement('canvas'),
                    s = Math.min(im.width, im.height),
                    n = 256;

                c.width = c.height = n;
                c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, n, n);
                state.photo = c.toDataURL('image/jpeg', 0.85);
                showPhoto();
            };

            im.src = rd.result;
        };

        rd.readAsDataURL(file);
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

        var d = collect();

        write(d);
        apply(d);
        mode(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        say('Profil berhasil disimpan.');

        // Hubungkan ke backend Anda lewat event ini:
        document.dispatchEvent(new CustomEvent('profile-save', { detail: d }));
    });

    apply(read());
    mode(false);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilDataPribadi);
} else {
    initProfilDataPribadi();
}

document.addEventListener('livewire:navigated', initProfilDataPribadi);
