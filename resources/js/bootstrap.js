import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const CSRF_META = 'meta[name="csrf-token"]';

function readCsrfToken() {
    const meta = document.querySelector(CSRF_META);

    return meta ? meta.getAttribute('content') || '' : '';
}

function writeCsrfToken(token) {
    const meta = document.querySelector(CSRF_META);

    if (meta && token) {
        meta.setAttribute('content', token);
    }
}

function setCsrfHeader(config, token) {
    if (!token) {
        return;
    }

    if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('X-CSRF-TOKEN', token);

        return;
    }

    config.headers = Object.assign({}, config.headers, { 'X-CSRF-TOKEN': token });
}

// Selalu kirim token dari <meta name="csrf-token"> agar tidak bergantung pada
// cookie XSRF-TOKEN yang bisa basi (mis. setelah sesi kedaluwarsa).
window.axios.interceptors.request.use(function (config) {
    setCsrfHeader(config, readCsrfToken());

    return config;
});

// Jika server mengembalikan 401 (sesi habis / tidak terautentikasi),
// langsung arahkan pengguna ke halaman login agar tidak terjebak di
// halaman yang tidak merespons.
window.axios.interceptors.response.use(
    function (res) { return res; },
    function (error) {
        if (error && error.response && error.response.status === 401) {
            window.location.href = '/login';
            return new Promise(function () {});
        }
        return Promise.reject(error);
    }
);

// Bila token ternyata sudah tidak cocok (419), ambil token baru dari server lalu
// ulangi permintaan satu kali. Hanya jika masih gagal, halaman dimuat ulang agar
// pengguna tidak melihat pesan "CSRF token mismatch." berulang-ulang.
window.axios.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        const response = error && error.response;
        const config = error && error.config;

        if (!response || response.status !== 419 || !config || config.__csrfRetried) {
            return Promise.reject(error);
        }

        config.__csrfRetried = true;

        return fetch('/csrf-token', {
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(function (res) {
                if (!res.ok || res.redirected) {
                    window.location.reload();

                    return new Promise(function () {});
                }

                return res.json();
            })
            .then(function (data) {
                if (!data || !data.token) {
                    return Promise.reject(error);
                }

                writeCsrfToken(data.token);
                setCsrfHeader(config, data.token);

                return window.axios(config).catch(function (retryError) {
                    if (retryError && retryError.response && retryError.response.status === 419) {
                        window.location.reload();

                        return new Promise(function () {});
                    }

                    return Promise.reject(retryError);
                });
            });
    },
);
