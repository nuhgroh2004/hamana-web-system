const mix = require('laravel-mix');

mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css', ['@tailwindcss/postcss'])
    .js('resources/js/auth/script.js', 'public/js/auth')
    .postCss('resources/css/auth/style.css', 'public/css/auth')
    .version();
