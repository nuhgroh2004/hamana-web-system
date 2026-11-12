@php
    $languages = [
        ['ID', 'Bahasa Indonesia', 'Bahasa Indonesia'],
        ['GB', 'English', 'Bahasa Inggris'],
        ['JP', '日本語', 'Bahasa Jepang'],
    ];

    $settings = [
        [
            'name' => 'Bahasa',
            'icon' => 'globe',
            'description' => 'Pilih bahasa tampilan aplikasi. Pilihan ini akan tersimpan pada perangkat Anda dan tetap berlaku setelah refresh maupun logout.',
            'type' => 'language',
        ],
        [
            'name' => 'Hak Akses Admin',
            'icon' => 'shield',
            'description' => 'Atur hal-hal yang boleh dilakukan oleh admin.',
            'type' => 'toggles',
            'options' => [
                'Admin dapat menyetujui permohonan',
                'Admin dapat mengubah data pegawai',
                'Admin dapat melihat slip gaji',
            ],
            'defaults' => [1, 1, 0],
        ],
        [
            'name' => 'Absensi by Foto',
            'icon' => 'camera',
            'description' => 'Atur apakah absensi pegawai harus disertai foto.',
            'type' => 'toggles',
            'options' => [
                'Wajibkan foto saat absen masuk',
                'Wajibkan foto saat absen pulang',
            ],
            'defaults' => [1, 0],
        ],
        [
            'name' => 'Daftar Hitam Presensi',
            'icon' => 'ban',
            'description' => 'Pegawai dalam daftar ini tidak dapat melakukan presensi.',
            'type' => 'empty',
        ],
    ];
@endphp

<div class="set" id="set-page">
        <aside class="spn">
            <label class="srch">
                <x-master-komponen::icon name="search" />
                <input id="sq" type="text" placeholder="Cari pengaturan" autocomplete="off">
            </label>

            <div id="sl">
                @foreach ($settings as $setting)
                    <button type="button"
                            class="si{{ $loop->first ? ' on' : '' }}"
                            data-name="{{ $setting['name'] }}"
                            aria-current="{{ $loop->first ? 'true' : 'false' }}">
                        <span class="ic">
                            <x-master-komponen::icon :name="$setting['icon']" />
                        </span>
                        {{ $setting['name'] }}
                    </button>
                @endforeach
            </div>
        </aside>

        <section class="scn" id="scn">
            @foreach ($settings as $setting)
                <div class="set-panel" data-panel="{{ $setting['name'] }}" @if (! $loop->first) hidden @endif>
                    <h2>{{ $setting['name'] }}</h2>
                    <p class="ds">{{ $setting['description'] }}</p>

                    <div class="cd">
                        @if ($setting['type'] === 'language')
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
                        @elseif ($setting['type'] === 'toggles')
                            <div class="hd">Opsi</div>
                            @foreach ($setting['options'] as $i => $option)
                                <label class="tr">
                                    <span>{{ $option }}</span>
                                    <input type="checkbox"
                                           data-key="{{ $setting['name'] }}|{{ $i }}"
                                           data-default="{{ $setting['defaults'][$i] ? '1' : '0' }}"
                                           @checked($setting['defaults'][$i])>
                                    <i class="tk"></i>
                                </label>
                            @endforeach
                        @else
                            <div class="em">Belum ada pegawai dalam daftar hitam presensi.</div>
                        @endif
                    </div>

                    <p class="nt">
                        <x-master-komponen::icon name="info" />
                        Perubahan langsung tersimpan.
                    </p>
                </div>
            @endforeach
        </section>
    </div>
