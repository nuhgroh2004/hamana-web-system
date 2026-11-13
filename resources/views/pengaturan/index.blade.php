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
                            <div class="ua-bar">
                                <button type="button" class="ubtn primary" wire:click="openCreateForm">
                                    <x-master-komponen::icon name="plus" />
                                    Tambah Pengguna
                                </button>
                            </div>

                            @if ($userStatus)
                                <p class="ustat">{{ $userStatus }}</p>
                            @endif

                            @error('user')
                                <p class="ustat error">{{ $message }}</p>
                            @enderror

                            @if ($showUserForm)
                                <form class="ufm" wire:submit="saveUser">
                                    <div class="ufm-h">
                                        <b>{{ $editingUserId ? 'Edit Pengguna' : 'Tambah Pengguna' }}</b>
                                        <button type="button" class="icb" wire:click="cancelUserForm" aria-label="Tutup formulir">
                                            <x-master-komponen::icon name="close" />
                                        </button>
                                    </div>

                                    <div class="ufm-g">
                                        <label>
                                            NIK
                                            <input id="user-nik" type="text" wire:model="formNik" inputmode="numeric" maxlength="13" placeholder="1232.31.23.12">
                                            @error('formNik') <span class="err-line">{{ $message }}</span> @enderror
                                        </label>
                                        <label>
                                            Nama
                                            <input id="user-name" type="text" wire:model="formName" placeholder="Nama lengkap">
                                            @error('formName') <span class="err-line">{{ $message }}</span> @enderror
                                        </label>
                                        <label>
                                            Email
                                            <input id="user-email" type="email" wire:model="formEmail" placeholder="nama@hamana.co.id">
                                            @error('formEmail') <span class="err-line">{{ $message }}</span> @enderror
                                        </label>
                                        <label>
                                            Password
                                            <input id="user-password" type="password" wire:model="formPassword" autocomplete="new-password" placeholder="{{ $editingUserId ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter' }}">
                                            @error('formPassword') <span class="err-line">{{ $message }}</span> @enderror
                                        </label>
                                        <label>
                                            Role
                                            <select id="user-role" wire:model="formRole">
                                                <option value="karyawan">Karyawan</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            @error('formRole') <span class="err-line">{{ $message }}</span> @enderror
                                        </label>
                                        <label>
                                            Posisi
                                            <input id="user-position" type="text" wire:model="formPosition" placeholder="Contoh: Staff Operasional">
                                            @error('formPosition') <span class="err-line">{{ $message }}</span> @enderror
                                        </label>
                                    </div>

                                    <div class="ufm-f">
                                        <button type="submit" class="ubtn primary" wire:loading.attr="disabled" wire:target="saveUser">
                                            {{ $editingUserId ? 'Simpan Perubahan' : 'Tambah Pengguna' }}
                                        </button>
                                        <button type="button" class="ubtn" wire:click="cancelUserForm">Batal</button>
                                    </div>
                                </form>
                            @endif

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

                                            <div class="ua-actions">
                                                <button type="button"
                                                        class="icb"
                                                        wire:click="openEditForm({{ $user->id }})"
                                                        aria-label="Edit {{ $user->name }}"
                                                        title="Edit">
                                                    <x-master-komponen::icon name="edit" />
                                                </button>
                                                @if ($user->id !== auth()->id())
                                                    <button type="button"
                                                            class="icb danger"
                                                            wire:click="deleteUser({{ $user->id }})"
                                                            wire:confirm="Hapus pengguna ini?"
                                                            aria-label="Hapus {{ $user->name }}"
                                                            title="Hapus">
                                                        <x-master-komponen::icon name="trash" />
                                                    </button>
                                                @endif
                                            </div>
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
