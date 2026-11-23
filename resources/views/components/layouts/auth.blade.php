<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'Masuk · Hamana Works Indonesia' }}</title>

    <link rel="stylesheet" href="{{ mix('css/auth/style.css') }}">
    <script src="{{ mix('js/auth/script.js') }}" defer></script>
    @livewireStyles
</head>
<body>
    {{ $slot }}
    @livewireScripts
</body>
</html>
