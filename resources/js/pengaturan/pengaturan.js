const initializedRoots = new WeakSet();

function initPengaturan() {
    const root = document.getElementById('set-page');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

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
