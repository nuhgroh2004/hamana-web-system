/* Pemakaian:
   Alert.confirm({ title, message, yes, no, danger }).then(function (ok) { ... });
   Alert.save() / Alert.update() / Alert.logout()
   Alert.success('Pesan', 'Judul opsional')
   Alert.error('Pesan', 'Judul opsional') */
const ALERT_COLORS = ['#2da44e', '#0969da', '#8250df', '#d4a72c', '#bf3989', '#fb8500'];
let alertSequence = 0;

function alertTemplate(type) {
    return document.querySelector('template[data-alert="' + type + '"]');
}

function setAlertText(root, selector, value) {
    if (value == null) {
        return;
    }

    const el = root.querySelector(selector);

    if (el) {
        el.textContent = value;
    }
}

function alertConfetti(box) {
    for (let i = 0; i < 26; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 100;
        const size = 6 + Math.random() * 5;
        const piece = document.createElement('i');

        piece.className = 'alert-cf';
        piece.style.cssText =
            '--dx:' + Math.cos(angle) * distance + 'px;' +
            '--dy:' + (Math.sin(angle) * distance - 20) + 'px;' +
            '--r:' + (360 + Math.random() * 540) + 'deg;' +
            '--s:' + size + 'px;' +
            '--c:' + ALERT_COLORS[i % ALERT_COLORS.length] + ';' +
            '--d:' + (0.3 + Math.random() * 0.12) + 's;' +
            '--rd:' + (Math.random() < 0.4 ? '50%' : '2px');
        box.appendChild(piece);
    }
}

function alertShow(type, options) {
    const template = alertTemplate(type);

    if (!template) {
        return Promise.resolve(false);
    }

    const o = options || {};

    return new Promise(function (resolve) {
        const previous = document.activeElement;
        const overlay = document.createElement('div');
        const dialog = template.content.firstElementChild.cloneNode(true);
        const kind = template.dataset.kind || type;
        const ms = Number(o.ms != null ? o.ms : template.dataset.ms || 0);
        const id = 'alert-' + ++alertSequence;
        const title = dialog.querySelector('.alert-t');
        const message = dialog.querySelector('.alert-m');
        let timer = null;
        let left = ms;
        let startedAt = 0;
        let closed = false;

        overlay.className = 'alert-ov';
        overlay.appendChild(dialog);

        title.id = id + '-t';
        message.id = id + '-m';
        dialog.setAttribute('aria-labelledby', title.id);
        dialog.setAttribute('aria-describedby', message.id);

        setAlertText(dialog, '.alert-t', o.title);
        setAlertText(dialog, '.alert-m', o.message);

        if (type === 'confirm' || type === 'save' || type === 'update' || type === 'logout') {
            setAlertText(dialog, '[data-r="0"]', o.no);
            setAlertText(dialog, '[data-r="1"]', o.yes);
        }

        if (type === 'confirm') {
            const icon = dialog.querySelector('.alert-icw');
            const no = dialog.querySelector('[data-r="0"]');
            const yes = dialog.querySelector('[data-r="1"]');
            const danger = !!o.danger;

            icon.classList.toggle('danger', danger);
            icon.classList.toggle('er', danger);
            icon.classList.toggle('q', !danger);
            yes.classList.toggle('go', !danger);
            yes.classList.toggle('dgb', danger);

            if (danger) {
                no.setAttribute('data-f', '');
                yes.removeAttribute('data-f');
            } else {
                yes.setAttribute('data-f', '');
                no.removeAttribute('data-f');
            }
        }

        if (ms) {
            dialog.style.setProperty('--ms', ms + 'ms');
        }

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        const first = dialog.querySelector('[data-f]') || dialog.querySelector('[data-r]');

        if (kind === 'ok') {
            alertConfetti(dialog.querySelector('.alert-icw'));
        }

        first.focus();

        function end(value) {
            if (closed) {
                return;
            }

            closed = true;
            clearTimeout(timer);
            document.removeEventListener('keydown', onKey, true);
            overlay.classList.add('out');

            setTimeout(function () {
                overlay.remove();
                document.body.style.overflow = '';

                if (previous && previous.focus) {
                    previous.focus();
                }

                resolve(value);
            }, 180);
        }

        function run() {
            startedAt = Date.now();
            timer = setTimeout(function () {
                end(true);
            }, left);
        }

        function onKey(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                end(false);
            } else if (event.key === 'Tab') {
                event.preventDefault();

                const buttons = Array.from(overlay.querySelectorAll('[data-r]'));
                const index = buttons.indexOf(document.activeElement);

                buttons[(index + (event.shiftKey ? buttons.length - 1 : 1)) % buttons.length].focus();
            }
        }

        document.addEventListener('keydown', onKey, true);

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                end(false);
            }

            const button = event.target.closest('[data-r]');

            if (button) {
                end(button.dataset.r === '1');
            }
        });

        if (ms) {
            run();

            dialog.addEventListener('mouseenter', function () {
                clearTimeout(timer);
                left -= Date.now() - startedAt;
                dialog.classList.add('hold');
            });

            dialog.addEventListener('mouseleave', function () {
                dialog.classList.remove('hold');
                run();
            });
        }
    });
}

window.Alert = {
    confirm: function (o) {
        return alertShow('confirm', o);
    },
    success: function (message, title) {
        return alertShow('success', { message: message, title: title });
    },
    error: function (message, title) {
        return alertShow('error', { message: message, title: title });
    },
    save: function (o) {
        return alertShow('save', o);
    },
    update: function (o) {
        return alertShow('update', o);
    },
    logout: function (o) {
        return alertShow('logout', o);
    },
};
