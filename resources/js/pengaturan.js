const LANG_KEY = 'lang';

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
        // localStorage can be unavailable (private mode / disabled storage).
    }
}

function initPengaturan() {
    const root = document.getElementById('set-page');
    if (!root) {
        return;
    }

    const nav = root.querySelector('#sl');
    const content = root.querySelector('#scn');
    const search = root.querySelector('#sq');
    const buttons = Array.from(root.querySelectorAll('.si'));
    const panels = Array.from(root.querySelectorAll('.set-panel'));

    if (!buttons.length) {
        return;
    }

    const activate = (name) => {
        buttons.forEach((button) => {
            const isActive = button.dataset.name === name;
            button.classList.toggle('on', isActive);
            button.setAttribute('aria-current', isActive ? 'true' : 'false');
        });

        panels.forEach((panel) => {
            panel.hidden = panel.dataset.panel !== name;
        });

        if (content) {
            content.scrollTop = 0;
        }
    };

    const findButtonByName = (name) => buttons.find((button) => button.dataset.name === name);
    const hash = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : '';
    const initial =
        findButtonByName(hash)?.dataset.name ||
        buttons.find((button) => button.classList.contains('on'))?.dataset.name ||
        buttons[0].dataset.name;

    activate(initial);

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            activate(button.dataset.name);

            if (window.matchMedia('(max-width: 900px)').matches && content) {
                content.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    if (search) {
        search.addEventListener('input', () => {
            const query = search.value.toLowerCase();

            buttons.forEach((button) => {
                const name = (button.dataset.name || '').toLowerCase();
                button.style.display = name.includes(query) ? '' : 'none';
            });
        });
    }

    const languageButtons = Array.from(root.querySelectorAll('.lr[data-lang]'));

    const renderLanguage = () => {
        const current = readSetting(LANG_KEY, 'ID');

        languageButtons.forEach((button) => {
            const isSelected = button.dataset.lang === current;
            button.classList.toggle('selected', isSelected);
            button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        });
    };

    languageButtons.forEach((button) => {
        button.addEventListener('click', () => {
            writeSetting(LANG_KEY, button.dataset.lang);
            renderLanguage();
        });
    });

    renderLanguage();

    root.querySelectorAll('input[type="checkbox"][data-key]').forEach((input) => {
        const key = `set:${input.dataset.key}`;
        const fallback = input.dataset.default || '0';

        input.checked = readSetting(key, fallback) === '1';

        input.addEventListener('change', () => {
            writeSetting(key, input.checked ? '1' : '0');
        });
    });

    window.addEventListener('hashchange', () => {
        const name = decodeURIComponent(window.location.hash.slice(1));
        if (findButtonByName(name)) {
            activate(name);
        }
    });

    if (nav) {
        nav.addEventListener('click', (event) => {
            if (event.target.closest('.si')) {
                history.replaceState(null, '', `#${encodeURIComponent(event.target.closest('.si').dataset.name)}`);
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPengaturan);
} else {
    initPengaturan();
}
