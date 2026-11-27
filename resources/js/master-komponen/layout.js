const mobileQuery = window.matchMedia('(max-width: 900px)');
let globalListenersBound = false;

/* ── Penyimpanan status sidebar ────────────────────────────────────────────
 * Sidebar ikut diganti setiap kali Livewire (wire:navigate) berpindah page,
 * sehingga posisi scroll dan grup yang terbuka kembali ke awal. Status
 * tersebut disimpan di browser dan dipulihkan setelah navigasi.
 * Sematan (pin) disimpan di localStorage agar bertahan antar sesi; kuncinya
 * memakai id user supaya tidak tercampur antar akun di browser yang sama.
 */
let storageScope = null;
let scrollSaveFrame = null;

function storageKey(name) {
    return `hamana.sidebar.${storageScope || 'guest'}.${name}`;
}

function initStorageScope() {
    const nav = document.getElementById('nav');

    if (nav && nav.dataset.user) {
        storageScope = nav.dataset.user;
    }
}

function readJson(storage, key, fallback) {
    try {
        const raw = storage.getItem(key);

        if (!raw) {
            return fallback;
        }

        const value = JSON.parse(raw);

        return value === null ? fallback : value;
    } catch (error) {
        return fallback;
    }
}

function writeJson(storage, key, value) {
    try {
        storage.setItem(key, JSON.stringify(value));
    } catch (error) {
        /* Penyimpanan penuh atau diblokir: fitur tetap jalan di sesi ini. */
    }
}

function escapeSelector(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
        return window.CSS.escape(String(value));
    }

    return String(value).replace(/["\\]/g, '\\$&');
}

/* ── Semat / lepas semat menu ────────────────────────────────────────────── */

function readPins() {
    const pins = readJson(window.localStorage, storageKey('pins'), []);

    return Array.isArray(pins) ? pins.filter((key) => typeof key === 'string') : [];
}

function writePins(pins) {
    writeJson(window.localStorage, storageKey('pins'), pins);
}

function navMainList(nav) {
    return nav.querySelector('ul:not(.lf)');
}

/* Header "Disematkan" diletakkan di awal daftar menu utama. */
function ensurePinnedHeader(nav) {
    const main = navMainList(nav);
    let head = main.querySelector('li.pin-head');
    let sep = main.querySelector('li.pin-head-sep');

    if (!head) {
        head = document.createElement('li');
        head.className = 'grp pin-head';
        head.textContent = 'Disematkan';
        main.insertBefore(head, main.firstElementChild);
    }

    if (!sep) {
        sep = document.createElement('li');
        sep.className = 'sep pin-head-sep';
        head.after(sep);
    }

    return { head, sep };
}

function removePinnedHeader(nav) {
    nav.querySelectorAll('li.pin-head, li.pin-head-sep').forEach((node) => node.remove());
}

function restorePinnedItem(nav, item) {
    const key = escapeSelector(item.dataset.key);
    const slot = nav.querySelector(`li.pin-slot[data-pin-slot="${key}"]`);

    item.classList.remove('is-pinned');

    if (slot) {
        slot.replaceWith(item);

        return;
    }

    const main = navMainList(nav);

    if (main) {
        main.appendChild(item);
    }
}

function updatePinButtons(nav) {
    const pins = readPins();

    nav.querySelectorAll('button.pin[data-pin]').forEach((button) => {
        const pinned = pins.includes(button.dataset.pin);
        const label = button.closest('li')?.querySelector('a')?.textContent.trim() || 'menu';
        const text = `${pinned ? 'Lepas sematan' : 'Sematkan'} ${label}`;

        button.setAttribute('aria-pressed', pinned ? 'true' : 'false');
        button.setAttribute('aria-label', text);
        button.setAttribute('title', text);
    });
}

/* Sembunyikan label/separator grup yang seluruh menunya sudah disematkan. */
function updateGroupVisibility(nav) {
    const main = navMainList(nav);

    if (!main) {
        return;
    }

    const nodes = Array.from(main.children);

    const hasItemAhead = (start, stopClasses) => {
        for (let i = start + 1; i < nodes.length; i += 1) {
            const node = nodes[i];

            if (stopClasses.some((className) => node.classList.contains(className))) {
                return false;
            }

            if (node.classList.contains('t')) {
                return true;
            }
        }

        return false;
    };

    nodes.forEach((node, index) => {
        if (node.classList.contains('grp')) {
            node.classList.toggle('pin-empty', !hasItemAhead(index, ['grp', 'sep']));
        } else if (node.classList.contains('sep')) {
            node.classList.toggle('pin-empty', !hasItemAhead(index, ['sep']));
        }
    });
}

function applyPins(nav) {
    if (!nav) {
        return;
    }

    const pins = readPins();
    const main = navMainList(nav);

    if (!main) {
        return;
    }

    // Kembalikan item yang sematannya dilepas ke posisi asalnya.
    main.querySelectorAll('li.t.is-pinned[data-key]').forEach((item) => {
        if (!pins.includes(item.dataset.key)) {
            restorePinnedItem(nav, item);
        }
    });

    if (pins.length === 0) {
        removePinnedHeader(nav);
        updatePinButtons(nav);
        updateGroupVisibility(nav);

        return;
    }

    const { sep } = ensurePinnedHeader(nav);

    pins.forEach((key) => {
        const item = main.querySelector(`li.t[data-key="${escapeSelector(key)}"]`);

        if (!item) {
            return;
        }

        if (!item.classList.contains('is-pinned')) {
            // Tinggalkan penanda di posisi asal agar item bisa dikembalikan.
            const slot = document.createElement('li');
            slot.className = 'pin-slot';
            slot.dataset.pinSlot = key;
            item.parentElement.insertBefore(slot, item);
            item.classList.add('is-pinned');
        }

        main.insertBefore(item, sep);
    });

    // Buang header bila tidak ada satu pun menu yang valid di dalamnya.
    if (!main.querySelector('li.t.is-pinned')) {
        removePinnedHeader(nav);
    }

    updatePinButtons(nav);
    updateGroupVisibility(nav);
}

function togglePin(button) {
    const nav = document.getElementById('nav');
    const key = button.dataset.pin;

    if (!nav || !key) {
        return;
    }

    const pins = readPins();
    const index = pins.indexOf(key);

    if (index === -1) {
        pins.push(key);
    } else {
        pins.splice(index, 1);
    }

    writePins(pins);
    applyPins(nav);

    // Pertahankan fokus pada tombol setelah DOM dipindahkan.
    const moved = nav.querySelector(`li.t[data-key="${escapeSelector(key)}"] button.pin`);

    if (moved) {
        moved.focus({ preventScroll: true });
    }
}

/* ── Posisi scroll & grup terbuka ───────────────────────────────────────── */

function saveSidebarScrollNow() {
    const nav = document.getElementById('nav');

    if (!nav) {
        return;
    }

    try {
        window.sessionStorage.setItem(storageKey('scroll'), String(nav.scrollTop));
    } catch (error) {
        /* abaikan */
    }
}

function saveSidebarScroll() {
    if (scrollSaveFrame !== null) {
        return;
    }

    scrollSaveFrame = window.requestAnimationFrame(() => {
        scrollSaveFrame = null;
        saveSidebarScrollNow();
    });
}

function saveOpenGroups() {
    const nav = document.getElementById('nav');

    if (!nav) {
        return;
    }

    const open = Array.from(nav.querySelectorAll('li.t.has.open[data-key]'))
        .map((item) => item.dataset.key)
        .filter(Boolean);

    writeJson(window.sessionStorage, storageKey('open'), open);
}

function restoreOpenGroups(nav) {
    const open = readJson(window.sessionStorage, storageKey('open'), []);

    if (!Array.isArray(open)) {
        return;
    }

    open.forEach((key) => {
        const item = nav.querySelector(`li.t.has[data-key="${escapeSelector(key)}"]`);

        if (item) {
            item.classList.add('open');
        }
    });
}

function restoreSidebarScroll(nav) {
    let top = 0;

    try {
        top = parseInt(window.sessionStorage.getItem(storageKey('scroll')) || '0', 10);
    } catch (error) {
        top = 0;
    }

    if (!top) {
        return;
    }

    const previousBehavior = nav.style.scrollBehavior;

    // Lompat langsung ke posisi tersimpan tanpa animasi smooth.
    nav.style.scrollBehavior = 'auto';
    nav.scrollTop = top;

    window.requestAnimationFrame(() => {
        nav.scrollTop = top;
        nav.style.scrollBehavior = previousBehavior;
    });
}

/* ── Interaksi sidebar ──────────────────────────────────────────────────── */

function initAvatar() {
    const avatar = document.getElementById('av1');

    if (!avatar) {
        return;
    }

    const pattern = ['01010', '11111', '01110', '11011', '01010'];
    let markup = '<rect width="5" height="5" fill="#fbeaf5"/>';

    pattern.forEach((row, y) => {
        for (let x = 0; x < 5; x += 1) {
            if (row[x] === '1') {
                const color = (x + y) % 2 ? '#e279bd' : '#d65aab';
                markup += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
            }
        }
    });

    avatar.innerHTML = markup;
}

function isSidebarOpen() {
    return mobileQuery.matches
        ? document.body.classList.contains('nav-open')
        : !document.body.classList.contains('nav-closed');
}

function syncSidebarButton() {
    const button = document.getElementById('menu');

    if (button) {
        button.setAttribute('aria-expanded', String(isSidebarOpen()));
    }
}

function closeMobileSidebar() {
    document.body.classList.remove('nav-open');
    syncSidebarButton();
}

function handleGlobalClick(event) {
    const menuButton = event.target.closest('#menu');

    if (menuButton) {
        if (mobileQuery.matches) {
            document.body.classList.toggle('nav-open');
        } else {
            document.body.classList.toggle('nav-closed');
        }

        syncSidebarButton();
        return;
    }

    if (event.target.closest('#bd')) {
        closeMobileSidebar();
        return;
    }

    const bell = event.target.closest('#bell');

    if (bell) {
        bell.classList.add('read');
        return;
    }

    const pinButton = event.target.closest('nav button.pin[data-pin]');

    if (pinButton) {
        event.preventDefault();
        togglePin(pinButton);
        return;
    }

    const nav = document.getElementById('nav');
    const link = event.target.closest('nav a');

    if (!nav || !link || !nav.contains(link)) {
        return;
    }

    const item = link.closest('li');

    if (item.classList.contains('has')) {
        event.preventDefault();
        item.classList.toggle('open');
        saveOpenGroups();
        return;
    }

    const isPlaceholder = link.getAttribute('href') === '#' || link.dataset.placeholder === 'true';

    if (isPlaceholder) {
        event.preventDefault();

        nav.querySelectorAll('li.act, li.has-act').forEach((element) => {
            element.classList.remove('act', 'has-act');
        });

        item.classList.add('act');

        const parent = item.parentElement.closest('li.has');
        if (parent) {
            parent.classList.add('has-act', 'open');
        }

        saveOpenGroups();
    }

    if (mobileQuery.matches) {
        closeMobileSidebar();
    }
}

function bindGlobalListeners() {
    if (globalListenersBound) {
        return;
    }

    document.addEventListener('click', handleGlobalClick);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileQuery.matches) {
            closeMobileSidebar();
        }
    });

    // Scroll tidak bubbling; tangkap pada fase capture agar tetap terdeteksi.
    document.addEventListener('scroll', (event) => {
        if (event.target instanceof Element && event.target.id === 'nav') {
            saveSidebarScroll();
        }
    }, true);

    // Simpan status sebelum halaman ditinggalkan (navigasi Livewire maupun reload).
    document.addEventListener('livewire:navigating', () => {
        saveSidebarScrollNow();
        saveOpenGroups();
    });

    window.addEventListener('pagehide', () => {
        saveSidebarScrollNow();
        saveOpenGroups();
    });

    const handleMediaChange = () => {
        document.body.classList.remove('nav-open');
        syncSidebarButton();
    };

    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener('change', handleMediaChange);
    } else {
        mobileQuery.addListener(handleMediaChange);
    }

    globalListenersBound = true;
}

function initLayout() {
    initStorageScope();
    initAvatar();
    bindGlobalListeners();
    syncSidebarButton();

    const nav = document.getElementById('nav');

    if (nav) {
        applyPins(nav);
        restoreOpenGroups(nav);
        restoreSidebarScroll(nav);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
} else {
    initLayout();
}

document.addEventListener('livewire:navigated', initLayout);
