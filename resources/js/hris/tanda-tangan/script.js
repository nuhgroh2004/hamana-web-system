const initializedRoots = new WeakSet();

function initTandaTangan() {
    const root = document.getElementById('tanda-tangan');

    if (!root || initializedRoots.has(root)) {
        return;
    }

    initializedRoots.add(root);

    (function () {
        var $ = function (id) {
                return document.getElementById(id);
            },
            cv = $('cv'),
            ctx = cv.getContext('2d'),
            pad = $('pad');
        var states = [[]],
            W = 0,
            H = 0,
            dpr = 1,
            drawing = null,
            KEY = 'ttd-v1',
            saved = null,
            busy = false;

        try {
            saved = JSON.parse(localStorage.getItem(KEY));
        } catch (e) {}

        if (window.ttdTersimpan) {
            saved = window.ttdTersimpan; // {png:"data:image/png;base64,...", tgl:"ISO"} dari server
        }

        function note(m) {
            var n = $('tn');

            n.querySelector('p').textContent = m || '';
            n.hidden = !m;
        }

        function cur() {
            return states[states.length - 1];
        }

        function push(s) {
            states.push(s);

            if (states.length > 60) {
                states.shift();
            }
        }

        // ---- kanvas ----
        function size() {
            var r = cv.getBoundingClientRect();

            if (!r.width) {
                return;
            }

            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = r.width;
            H = r.height;
            cv.width = Math.round(W * dpr);
            cv.height = Math.round(H * dpr);
            paint(cur(), drawing);
        }

        function lw() {
            return Math.max(2, W / 260);
        }

        function one(it) {
            if (it.img) {
                var s = Math.min((W * 0.9) / it.img.naturalWidth, (H * 0.9) / it.img.naturalHeight, 2),
                    w = it.img.naturalWidth * s,
                    h = it.img.naturalHeight * s;

                ctx.drawImage(it.img, (W - w) / 2, (H - h) / 2, w, h);
                return;
            }

            var p = it.p,
                i;

            ctx.strokeStyle = ctx.fillStyle = '#1f2328';
            ctx.lineWidth = lw();
            ctx.lineCap = ctx.lineJoin = 'round';

            if (p.length === 1) {
                ctx.beginPath();
                ctx.arc(p[0][0] * W, p[0][1] * W, ctx.lineWidth / 2, 0, 6.2832);
                ctx.fill();
                return;
            }

            ctx.beginPath();
            ctx.moveTo(p[0][0] * W, p[0][1] * W);

            for (i = 1; i < p.length - 1; i++) {
                ctx.quadraticCurveTo(p[i][0] * W, p[i][1] * W, ((p[i][0] + p[i + 1][0]) / 2) * W, ((p[i][1] + p[i + 1][1]) / 2) * W);
            }

            ctx.lineTo(p[p.length - 1][0] * W, p[p.length - 1][1] * W);
            ctx.stroke();
        }

        function paint(items, extra) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, W, H);
            items.forEach(one);

            if (extra) {
                one(extra);
            }
        }

        function update() {
            var empty = cur().length === 0;

            $('clr').disabled = empty;
            $('sv').disabled = empty || busy;
            $('und').disabled = states.length < 2;
            $('ph').style.opacity = empty && !drawing ? 1 : 0;
        }

        function pt(e) {
            var r = cv.getBoundingClientRect();

            return [(e.clientX - r.left) / W, (e.clientY - r.top) / W];
        }

        cv.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) {
                return;
            }

            e.preventDefault();
            cv.setPointerCapture(e.pointerId);
            drawing = { p: [pt(e)] };
            paint(cur(), drawing);
            update();
        });

        cv.addEventListener('pointermove', function (e) {
            if (!drawing) {
                return;
            }

            var ev = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];

            if (!ev.length) {
                ev = [e];
            }

            ev.forEach(function (x) {
                drawing.p.push(pt(x));
            });
            paint(cur(), drawing);
        });

        function end() {
            if (!drawing) {
                return;
            }

            push(cur().concat([drawing]));
            drawing = null;
            paint(cur());
            update();
        }

        cv.addEventListener('pointerup', end);
        cv.addEventListener('pointercancel', end);

        if (window.ResizeObserver) {
            new ResizeObserver(size).observe(pad);
        } else {
            window.addEventListener('resize', size);
        }

        $('clr').onclick = function () {
            if (cur().length) {
                push([]);
                paint(cur());
                update();
                note('');
            }
        };

        $('und').onclick = function () {
            if (states.length > 1) {
                states.pop();
                paint(cur());
                update();
            }
        };

        // ---- upload PNG ----
        $('up').onclick = function () {
            $('fin').click();
        };

        $('fin').onchange = function () {
            var f = this.files[0];

            this.value = '';

            if (!f) {
                return;
            }

            note('');

            function bad(m) {
                note(m);
            }

            if (f.type !== 'image/png' || !/\.png$/i.test(f.name)) {
                return bad('Hanya file PNG yang diterima.');
            }

            if (f.size > 2 * 1048576) {
                return bad('Ukuran file maksimal 2 MB.');
            }

            f.slice(0, 8)
                .arrayBuffer()
                .then(function (b) {
                    var h = new Uint8Array(b),
                        sig = [137, 80, 78, 71, 13, 10, 26, 10];

                    if (
                        !sig.every(function (v, i) {
                            return h[i] === v;
                        })
                    ) {
                        return bad('File bukan PNG yang valid.');
                    }

                    var img = new Image();

                    img.onload = function () {
                        note(hasAlpha(img) ? '' : 'File yang diupload tidak transparan, hasil tanda tangan akan tampak memiliki background.');
                        push([{ img: img }]);
                        paint(cur());
                        update();
                    };
                    img.onerror = function () {
                        bad('File gambar tidak dapat dibaca.');
                    };
                    img.src = URL.createObjectURL(f);
                });
        };

        function hasAlpha(img) {
            try {
                var s = Math.min(1, 200 / Math.max(img.naturalWidth, img.naturalHeight)),
                    c = document.createElement('canvas'),
                    w = (c.width = Math.max(1, Math.round(img.naturalWidth * s))),
                    h = (c.height = Math.max(1, Math.round(img.naturalHeight * s))),
                    x = c.getContext('2d');

                x.drawImage(img, 0, 0, w, h);

                var d = x.getImageData(0, 0, w, h).data;

                for (var i = 3; i < d.length; i += 4) {
                    if (d[i] < 250) {
                        return true;
                    }
                }

                return false;
            } catch (e) {
                return true;
            }
        }

        // ---- simpan ----
        function exportPng() {
            paint(cur());

            var w = cv.width,
                h = cv.height,
                d = ctx.getImageData(0, 0, w, h).data,
                x0 = w,
                y0 = h,
                x1 = -1,
                y1 = -1,
                x,
                y;

            for (y = 0; y < h; y++) {
                for (x = 0; x < w; x++) {
                    if (d[(y * w + x) * 4 + 3] > 8) {
                        if (x < x0) {
                            x0 = x;
                        }

                        if (x > x1) {
                            x1 = x;
                        }

                        if (y < y0) {
                            y0 = y;
                        }

                        if (y > y1) {
                            y1 = y;
                        }
                    }
                }
            }

            if (x1 < 0) {
                return null;
            }

            var p = Math.round(8 * dpr);

            x0 = Math.max(0, x0 - p);
            y0 = Math.max(0, y0 - p);
            x1 = Math.min(w - 1, x1 + p);
            y1 = Math.min(h - 1, y1 + p);

            var c = document.createElement('canvas');

            c.width = x1 - x0 + 1;
            c.height = y1 - y0 + 1;
            c.getContext('2d').drawImage(cv, x0, y0, c.width, c.height, 0, 0, c.width, c.height);

            return c.toDataURL('image/png');
        }

        var kirim =
            window.ttdSimpan ||
            function () {
                return new Promise(function (r) {
                    setTimeout(r, 600);
                });
            };

        $('sv').onclick = function () {
            if (!cur().length || busy) {
                return;
            }

            var png = exportPng();

            if (!png) {
                return;
            }

            busy = true;
            update();
            note('');
            document.dispatchEvent(new CustomEvent('ttd-simpan', { detail: { png: png } }));

            Promise.resolve(kirim({ png: png }))
                .then(
                    function () {
                        saved = { png: png, tgl: new Date().toISOString() };

                        try {
                            localStorage.setItem(KEY, JSON.stringify(saved));
                        } catch (e) {}

                        states = [[]];
                        paint(cur());
                        showSaved();
                    },
                    function () {
                        note('Tanda tangan gagal disimpan. Silakan coba lagi.');
                    },
                )
                .then(function () {
                    busy = false;
                    update();
                });
        };

        // ---- tersimpan ----
        function showSaved() {
            $('nb').hidden = !!saved;

            if (!saved) {
                $('sa').innerHTML = '<div class="emp">Belum ada tanda tangan.</div>';
                return;
            }

            var tgl = '';

            try {
                tgl = new Date(saved.tgl).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            } catch (e) {}

            $('sa').innerHTML =
                '<div class="sv"><img src="' + saved.png + '" alt="Tanda tangan tersimpan"></div>' + (tgl ? '<p class="mt">Disimpan pada ' + tgl + '</p>' : '');
        }

        showSaved();
        size();
        update();
    })();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTandaTangan);
} else {
    initTandaTangan();
}

document.addEventListener('livewire:navigated', initTandaTangan);
