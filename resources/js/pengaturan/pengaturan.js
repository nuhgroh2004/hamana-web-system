const initializedRoots = new WeakSet();

function initPengaturan() {
    const root = document.getElementById('set-page');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    root.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-pw-toggle]');

        if (!toggle) {
            return;
        }

        const input = root.querySelector(toggle.dataset.pwToggle);

        if (!input) {
            return;
        }

        const visible = input.type === 'text';

        input.type = visible ? 'password' : 'text';
        toggle.classList.toggle('is-visible', !visible);
        toggle.setAttribute('aria-label', visible ? 'Tampilkan password' : 'Sembunyikan password');
        toggle.setAttribute('aria-pressed', String(!visible));
        input.focus();
    });

    const search = root.querySelector('#sq');
    const links = Array.from(root.querySelectorAll('#sl .si'));

    if (!search) {
        return;
    }

    search.addEventListener('input', () => {
        const query = search.value.toLowerCase();

        links.forEach((link) => {
            const name = (link.dataset.name || '').toLowerCase();
            link.style.display = name.includes(query) ? '' : 'none';
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPengaturan);
} else {
    initPengaturan();
}

document.addEventListener('livewire:navigated', initPengaturan);
