const LANG_KEY = 'lang';
const initializedRoots = new WeakSet();

function readLang() {
    try {
        const value = localStorage.getItem(LANG_KEY);

        return value === null ? 'ID' : value;
    } catch (error) {
        return 'ID';
    }
}

function writeLang(value) {
    try {
        localStorage.setItem(LANG_KEY, value);
    } catch (error) {
        // localStorage dapat tidak tersedia (mode privat / penyimpanan dimatikan).
    }
}

function initPengaturanBahasa() {
    const root = document.getElementById('set-page');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    const buttons = Array.from(root.querySelectorAll('.lr[data-lang]'));

    if (!buttons.length) {
        return;
    }

    initializedRoots.add(root);

    const render = () => {
        const current = readLang();

        buttons.forEach((button) => {
            const isSelected = button.dataset.lang === current;
            button.classList.toggle('selected', isSelected);
            button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        });
    };

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            writeLang(button.dataset.lang);
            render();
        });
    });

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPengaturanBahasa);
} else {
    initPengaturanBahasa();
}

document.addEventListener('livewire:navigated', initPengaturanBahasa);
