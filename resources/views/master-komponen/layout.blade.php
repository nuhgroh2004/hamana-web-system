@props(['title' => 'Hamana', 'main' => '', 'active' => null])

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>{{ $title }}</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
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
</body>
</html>
