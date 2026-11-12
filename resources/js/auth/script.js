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
})();
