@php
    $languages = [
        ['ID', 'Bahasa Indonesia', 'Bahasa Indonesia'],
        ['GB', 'English', 'Bahasa Inggris'],
        ['JP', '日本語', 'Bahasa Jepang'],
    ];
@endphp

<div class="set-panel" data-panel="bahasa">
    <h2>Bahasa</h2>
    <p class="ds">Pilih bahasa tampilan aplikasi. Pilihan ini akan tersimpan pada perangkat Anda dan tetap berlaku setelah refresh maupun logout.</p>

    <div class="cd">
        <div class="hd">Bahasa tampilan</div>
        @foreach ($languages as $language)
            <button type="button"
                    class="lr{{ $language[0] === 'ID' ? ' selected' : '' }}"
                    data-lang="{{ $language[0] }}"
                    aria-pressed="{{ $language[0] === 'ID' ? 'true' : 'false' }}">
                <b class="cc">{{ $language[0] }}</b>
                <span>
                    <b>{{ $language[1] }}</b>
                    <small>{{ $language[2] }}</small>
                </span>
                <x-master-komponen::icon name="check" class="check" />
            </button>
        @endforeach
    </div>

    <p class="nt">
        <x-master-komponen::icon name="info" />
        Perubahan langsung tersimpan.
    </p>
</div>
