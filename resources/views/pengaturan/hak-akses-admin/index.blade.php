@php
    $totalModules = count(\App\Support\Modules::all());
    $opened = false;
@endphp

<div class="set-panel" data-panel="hak-akses-admin">
    <h2>Hak Akses Admin</h2>
    <p class="ds">Atur halaman yang dapat diakses oleh setiap pengguna. Admin selalu memiliki akses penuh.</p>

    <div class="cd">
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
    </div>

    <p class="nt">
        <x-master-komponen::icon name="info" />
        Perubahan langsung tersimpan.
    </p>
</div>
