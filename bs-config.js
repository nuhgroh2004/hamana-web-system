module.exports = {
    proxy: '127.0.0.1:8000',
    open: false,
    reloadDelay: 1500,
    files: [
        'app/**/*.php',
        'config/**/*.php',
        'resources/views/**/*.blade.php',
        'routes/**/*.php',
        'public/css/**/*.css',
        'public/js/**/*.js',
    ],
};
