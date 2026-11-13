const SETTING_PREFIX = 'set:';
const initializedRoots = new WeakSet();

function readSetting(key, fallback) {
    try {
        const value = localStorage.getItem(key);

        return value === null ? fallback : value;
    } catch (error) {
        return fallback;
    }
}

function writeSetting(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        // localStorage dapat tidak tersedia (mode privat / penyimpanan dimatikan).
    }
}

function initPengaturanAbsensiByFoto() {
    const root = document.getElementById('set-page');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    const inputs = Array.from(root.querySelectorAll('input[type="checkbox"][data-key]'));

    if (!inputs.length) {
        return;
    }

    initializedRoots.add(root);

    inputs.forEach((input) => {
        const key = SETTING_PREFIX + input.dataset.key;
        const fallback = input.dataset.default || '0';

        input.checked = readSetting(key, fallback) === '1';

        input.addEventListener('change', () => {
            writeSetting(key, input.checked ? '1' : '0');
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPengaturanAbsensiByFoto);
} else {
    initPengaturanAbsensiByFoto();
}

document.addEventListener('livewire:navigated', initPengaturanAbsensiByFoto);
