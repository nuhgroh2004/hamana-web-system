@php
    $isAdmin = auth()->user()?->isAdmin() ?? false;
    $totalModules = count(\App\Support\Modules::all());

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
    ];

    if ($isAdmin) {
        $settings[] = [
            'name' => 'Hak Akses Admin',
            'icon' => 'shield',
            'description' => 'Atur halaman yang dapat diakses oleh setiap pengguna. Admin selalu memiliki akses penuh.',
            'type' => 'users',
        ];

        $settings[] = [
            'name' => 'Absensi by Foto',
            'icon' => 'camera',
            'description' => 'Atur apakah absensi pegawai harus disertai foto.',
            'type' => 'toggles',
            'options' => [
                'Wajibkan foto saat absen masuk',
                'Wajibkan foto saat absen pulang',
            ],
            'defaults' => [1, 0],
        ];

        $settings[] = [
            'name' => 'Daftar Hitam Presensi',
            'icon' => 'ban',
            'description' => 'Pegawai dalam daftar ini tidak dapat melakukan presensi.',
            'type' => 'empty',
        ];
    }

    $opened = false;
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
                        @elseif ($setting['type'] === 'users')
                            <div class="us">
                                @foreach ($users as $user)
                                    @php
                                        $locked = $user->isAdmin();
                                        $open = ! $locked && ! $opened;
                                        $opened = $opened || $open;
                                    @endphp

                                    <article class="uc" wire:key="user-{{ $user->id }}">
                                        <div class="uh">
                                            <span class="ua">{{ mb_strtoupper(mb_substr($user->name, 0, 1)) }}</span>
                                            <div class="ui">
                                                <b>{{ $user->name }}</b>
                                                <small>{{ $user->nik }} · {{ $user->position }}</small>
                                            </div>
                                            <span class="ub {{ $user->role }}">{{ ucfirst($user->role) }}</span>
                                        </div>

                                        <details class="ud" @if ($open) open @endif>
                                            <summary>
                                                <span>{{ $locked ? 'Akses penuh (tidak dapat diubah)' : 'Atur akses halaman' }}</span>
                                                <span class="cnt">{{ count($user->permissionList()) }}/{{ $totalModules }} aktif</span>
                                            </summary>

                                            @if ($locked)
                                                <p class="un">
                                                    <x-master-komponen::icon name="shield" />
                                                    Admin memiliki akses penuh ke semua halaman.
                                                </p>
                                            @endif

                                            <div class="ug-list">
                                                @foreach ($moduleGroups as $group)
                                                    <div class="ug" wire:key="g-{{ $user->id }}-{{ $loop->index }}">
                                                        <div class="ugh">{{ $group['label'] ?? 'Lainnya' }}</div>

                                                        @foreach ($group['items'] ?? [] as $item)
                                                            @if (! empty($item['children']))
                                                                <div class="ugs">{{ $item['label'] }}</div>

                                                                @foreach ($item['children'] as $child)
                                                                    <label class="tr" wire:key="m-{{ $user->id }}-{{ $child['slug'] }}">
                                                                        <span>{{ $child['label'] }}</span>
                                                                        <input type="checkbox"
                                                                               @disabled($locked)
                                                                               wire:click="toggleAccess({{ $user->id }}, '{{ $child['slug'] }}')"
                                                                               @checked($user->canAccess($child['slug']))>
                                                                        <i class="tk"></i>
                                                                    </label>
                                                                @endforeach
                                                            @else
                                                                <label class="tr" wire:key="m-{{ $user->id }}-{{ $item['slug'] }}">
                                                                    <span>{{ $item['label'] }}</span>
                                                                    <input type="checkbox"
                                                                           @disabled($locked)
                                                                           wire:click="toggleAccess({{ $user->id }}, '{{ $item['slug'] }}')"
                                                                           @checked($user->canAccess($item['slug']))>
                                                                    <i class="tk"></i>
                                                                </label>
                                                            @endif
                                                        @endforeach
                                                    </div>
                                                @endforeach
                                            </div>

                                            @unless ($locked)
                                                <div class="uf">
                                                    <button type="button"
                                                            class="rst"
                                                            wire:click="resetAccess({{ $user->id }})"
                                                            wire:loading.attr="disabled"
                                                            wire:target="resetAccess({{ $user->id }})">
                                                        Kembalikan akses default
                                                    </button>
                                                </div>
                                            @endunless
                                        </details>
                                    </article>
                                @endforeach
                            </div>
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
