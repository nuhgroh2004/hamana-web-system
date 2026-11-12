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

function initSidebar() {
    const body = document.body;
    const button = document.getElementById('menu');
    const nav = document.getElementById('nav');
    const backdrop = document.getElementById('bd');
    const media = window.matchMedia('(max-width: 900px)');

    if (!button || !nav) {
        return;
    }

    const isOpen = () => (media.matches ? body.classList.contains('nav-open') : !body.classList.contains('nav-closed'));

    const sync = () => {
        button.setAttribute('aria-expanded', String(isOpen()));
    };

    const closeMobile = () => {
        body.classList.remove('nav-open');
        sync();
    };

    button.addEventListener('click', () => {
        if (media.matches) {
            body.classList.toggle('nav-open');
        } else {
            body.classList.toggle('nav-closed');
        }
        sync();
    });

    if (backdrop) {
        backdrop.addEventListener('click', closeMobile);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && media.matches) {
            closeMobile();
        }
    });

    const handleMediaChange = () => {
        body.classList.remove('nav-open');
        sync();
    };

    if (media.addEventListener) {
        media.addEventListener('change', handleMediaChange);
    } else {
        media.addListener(handleMediaChange);
    }

    nav.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link || !nav.contains(link)) {
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

        if (media.matches) {
            closeMobile();
        }
    });

    sync();
}

function initNotification() {
    const bell = document.getElementById('bell');

    if (!bell) {
        return;
    }

    bell.addEventListener('click', () => {
        bell.classList.add('read');
    });
}

function initLayout() {
    initAvatar();
    initSidebar();
    initNotification();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
} else {
    initLayout();
}
