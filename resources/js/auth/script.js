(function () {
    var f = document.getElementById('f'),
        email = document.getElementById('email'),
        pw = document.getElementById('pw'),
        err = document.getElementById('err'),
        go = document.getElementById('go');

    if (!f) {
        return;
    }

    function bad(el, msg) {
        err.textContent = msg;
        el.classList.add('bad');
        el.focus();
    }

    function clear() {
        err.textContent = '';
        email.classList.remove('bad');
        pw.classList.remove('bad');
    }

    email.addEventListener('input', clear);
    pw.addEventListener('input', clear);

    var toggle = document.getElementById('toggle-pw');

    if (toggle) {
        toggle.addEventListener('click', function () {
            var visible = pw.type === 'text';

            pw.type = visible ? 'password' : 'text';
            toggle.classList.toggle('is-visible', !visible);
            toggle.setAttribute('aria-label', visible ? 'Tampilkan password' : 'Sembunyikan password');
            toggle.setAttribute('aria-pressed', String(!visible));
            pw.focus();
        });
    }

    f.addEventListener('submit', function (e) {
        e.preventDefault();
        clear();

        var v = email.value.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
            bad(email, 'Masukkan alamat email yang valid.');
            return;
        }

        if (pw.value.length < 6) {
            bad(pw, 'Password minimal 6 karakter.');
            return;
        }

        go.disabled = true;
        go.textContent = 'Memproses…';

        setTimeout(function () {
            go.textContent = 'Berhasil masuk ✓';

            // Hubungkan ke backend Anda di sini:
            document.dispatchEvent(new CustomEvent('login', { detail: { email: v } }));

            setTimeout(function () {
                go.disabled = false;
                go.textContent = 'Login';
            }, 1500);
        }, 900);
    });
})();
