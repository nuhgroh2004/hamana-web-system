const initializedRoots = new WeakSet();

const ICONS = {
    inbox: '<path d="M2 9l2-6h8l2 6v4H2zM2 9h4l1 2h2l1-2h4"/>',
    req: '<path d="M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3M5.5 8h5M5.5 11h5"/>',
    cal: '<rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 7h12M5 1.5v3M11 1.5v3M5.5 10.5l1.7 1.5 3.3-3"/>',
    exit: '<path d="M6 2.5H3v11h3M10 5l3 3-3 3M13 8H6"/>',
    brief: '<rect x="1.5" y="5" width="13" height="8.5" rx="1"/><path d="M5.5 5V3h5v2M1.5 9h13"/>',
    pin: '<path d="M8 14.5s4.5-4 4.5-7.5a4.5 4.5 0 00-9 0c0 3.5 4.5 7.5 4.5 7.5z"/><circle cx="8" cy="7" r="1.6"/>',
    clock: '<circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/>',
};

const QUICK_ACCESS = [
    ['inbox', 'Permohonan Masuk', 'Permohonan Masuk'],
    ['req', 'Permohonan Saya', 'Permohonan Saya'],
    ['cal', 'Izin Cuti atau Sakit', 'Izin Cuti atau Sakit'],
    ['exit', 'Izin Keluar Kantor', 'Izin Keluar Kantor'],
    ['brief', 'Izin Dinas Dalam Kota', 'Izin Dinas Dalam Kota'],
    ['pin', 'Izin Dinas Luar Kota (SPT)', 'Izin Dinas Luar Kota'],
    ['clock', 'Form Pengajuan Absensi', 'Form Absensi'],
];

const REQUESTS = {
    Menunggu: [['Form Pengajuan Absensi', '10 Nov 2026', 'Absensi', 'Menunggu', 'w']],
    Riwayat: [
        ['Izin Cuti atau Sakit', '28 Okt 2026', 'Cuti', 'Disetujui', 'o'],
        ['Izin Keluar Kantor', '20 Okt 2026', 'Izin', 'Disetujui', 'o'],
        ['Izin Dinas Dalam Kota', '12 Okt 2026', 'Dinas', 'Ditolak', 'x'],
    ],
};

function svg(path) {
    return `<svg class="i" viewBox="0 0 16 16">${path}</svg>`;
}

function renderAvatar() {
    const avatar = document.getElementById('av3');

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

function renderQuickAccess(routes) {
    const container = document.getElementById('qa');

    if (!container) {
        return;
    }

    container.innerHTML = QUICK_ACCESS.map(([icon, label, target]) => {
        const href = routes[target] ? ` data-href="${routes[target]}"` : '';

        return `<button class="qi" data-go="${target}"${href}><span class="qic">${svg(ICONS[icon])}</span>${label}</button>`;
    }).join('');
}

function renderRequests(tabName) {
    const tabs = document.getElementById('tabs');
    const list = document.getElementById('rl');

    if (!tabs || !list) {
        return;
    }

    tabs.innerHTML = Object.keys(REQUESTS).map((name) => (
        `<button class="tb${name === tabName ? ' on' : ''}" data-t="${name}">${name}<em>${REQUESTS[name].length}</em></button>`
    )).join('');

    list.innerHTML = REQUESTS[tabName].length
        ? REQUESTS[tabName].map((row) => (
            `<div class="ri"><div><b>${row[0]} · ${row[1]}</b><small>${row[2]}</small></div><span class="bdg ${row[4]}">${row[3]}</span></div>`
        )).join('')
        : '<div class="em2">Tidak ada permohonan.</div>';
}

function navigateTo(href) {
    if (!href) {
        return;
    }

    if (window.Livewire && typeof window.Livewire.navigate === 'function') {
        window.Livewire.navigate(href);
        return;
    }

    window.location.assign(href);
}

function initDashboard() {
    const root = document.getElementById('dash');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    let routes = {};

    try {
        routes = JSON.parse(root.dataset.routes || '{}');
    } catch (error) {
        routes = {};
    }

    renderAvatar();
    renderQuickAccess(routes);
    renderRequests('Menunggu');

    root.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-go]');

        if (trigger) {
            navigateTo(trigger.dataset.href || routes[trigger.dataset.go]);
            return;
        }

        const tab = event.target.closest('.tb');

        if (tab) {
            renderRequests(tab.dataset.t);
        }
    });

    const progress = document.getElementById('pfill');

    if (progress) {
        window.setTimeout(() => {
            progress.style.width = '72%';
        }, 250);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

document.addEventListener('livewire:navigated', initDashboard);
