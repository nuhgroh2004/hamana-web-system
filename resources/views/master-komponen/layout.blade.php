@props(['title' => 'Hamana', 'main' => '', 'active' => null])

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title }}</title>

    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
    <script src="{{ mix('js/app.js') }}" defer></script>
    @livewireStyles
</head>
<body>
    <x-master-komponen::navbar :title="$title" />

    <div class="shell">
        <div class="bd" id="bd"></div>
        <x-master-komponen::sidebar :active="$active" />

        <main id="main" class="{{ $main }}">
            {{ $slot }}
        </main>
    </div>

    @livewireScripts
</body>
</html>
