(function () {
    document.addEventListener('click', function (event) {
        var toggle = event.target.closest('#toggle-pw');

        if (!toggle) {
            return;
        }

        var pw = document.getElementById('pw');

        if (!pw) {
            return;
        }

        var visible = pw.type === 'text';

        pw.type = visible ? 'password' : 'text';
        toggle.classList.toggle('is-visible', !visible);
        toggle.setAttribute('aria-label', visible ? 'Tampilkan password' : 'Sembunyikan password');
        toggle.setAttribute('aria-pressed', String(!visible));
        pw.focus();
    });

    function refreshCsrfToken() {
        return fetch('/csrf-token', {
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(function (res) {
                return res.ok ? res.json() : null;
            })
            .then(function (data) {
                if (!data || !data.token) {
                    return null;
                }

                var meta = document.querySelector('meta[name="csrf-token"]');
                if (meta) {
                    meta.setAttribute('content', data.token);
                }

                var input = document.querySelector('#f input[name="_token"]');
                if (input) {
                    input.value = data.token;
                }

                return data.token;
            })
            .catch(function () {
                return null;
            });
    }

    // Jaga token CSRF halaman login selalu segar walaupun tab ditinggalkan lama.
    setInterval(refreshCsrfToken, 10 * 60 * 1000);
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            refreshCsrfToken();
        }
    });

    var form = document.getElementById('f');
    var submitBtn = document.getElementById('go');
    var submitting = false;

    if (form && submitBtn) {
        form.addEventListener('submit', function (event) {
            if (submitting) {
                return;
            }

            event.preventDefault();
            submitting = true;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Memproses…';

            // Selalu sinkronkan token CSRF terbaru sebelum POST login agar tidak pernah 419.
            refreshCsrfToken().finally(function () {
                form.submit();
            });
        });
    }
})();
