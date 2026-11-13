@php
    $options = [
        ['label' => 'Wajibkan foto saat absen masuk', 'default' => true],
        ['label' => 'Wajibkan foto saat absen pulang', 'default' => false],
    ];
@endphp

<div class="set-panel" data-panel="absensi-by-foto">
    <h2>Absensi by Foto</h2>
    <p class="ds">Atur apakah absensi pegawai harus disertai foto.</p>

    <div class="cd">
        <div class="hd">Opsi</div>
        @foreach ($options as $i => $option)
            <label class="tr">
                <span>{{ $option['label'] }}</span>
                <input type="checkbox"
                       data-key="absensi-by-foto|{{ $i }}"
                       data-default="{{ $option['default'] ? '1' : '0' }}"
                       @checked($option['default'])>
                <i class="tk"></i>
            </label>
        @endforeach
    </div>

    <p class="nt">
        <x-master-komponen::icon name="info" />
        Perubahan langsung tersimpan.
    </p>
</div>
