const mobileQuery = window.matchMedia('(max-width: 900px)');
let globalListenersBound = false;

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

    const nav = document.getElementById('nav');
    const link = event.target.closest('nav a');

    if (!nav || !link || !nav.contains(link)) {
        return;
    }

    const item = link.parentElement;

    if (item.classList.contains('has')) {
        event.preventDefault();
        item.classList.toggle('open');
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
    initAvatar();
    bindGlobalListeners();
    syncSidebarButton();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
} else {
    initLayout();
}

document.addEventListener('livewire:navigated', initLayout);
