@php
    $roleLabels = ['admin' => 'Admin', 'karyawan' => 'Karyawan', 'satpam' => 'Satpam'];
    $initial = fn ($name) => mb_strtoupper(mb_substr(trim((string) $name), 0, 1));
    $allowed = $selectedUser ? $selectedUser->permissionList() : [];
    $selectedCount = count($allowed);
@endphp

<div class="set-panel ha" data-panel="hak-akses">
    <div class="ha-head">
        <div>
            <h2>Hak Akses</h2>
            <p class="ds">Atur halaman yang dapat diakses oleh setiap pengguna. Admin selalu memiliki akses penuh.</p>
        </div>
    </div>

    @if ($userStatus)
        <p class="ustat">{{ $userStatus }}</p>
    @endif

    @error('user')
        <p class="ustat error">{{ $message }}</p>
    @enderror

    @if ($showUserForm)
        <div class="cd ha-form">
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
                            <option value="satpam">Satpam</option>
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
        </div>
    @endif

    <div class="ha-grid">
        <aside class="ha-left">
            <div class="ha-left-head">
                <label class="ha-search">
                    <x-master-komponen::icon name="search" />
                    <input type="search"
                           wire:model.live.debounce.300ms="userQuery"
                           placeholder="Cari nama, NIK, atau posisi"
                           autocomplete="off"
                           aria-label="Cari pengguna">
                </label>

                <div class="ha-tabs" role="tablist" aria-label="Filter role pengguna">
                    <button type="button"
                            role="tab"
                            class="ha-tab{{ $roleFilter === 'all' ? ' on' : '' }}"
                            wire:click="setRoleFilter('all')"
                            aria-selected="{{ $roleFilter === 'all' ? 'true' : 'false' }}">
                        Semua
                    </button>
                    <button type="button"
                            role="tab"
                            class="ha-tab{{ $roleFilter === 'admin' ? ' on' : '' }}"
                            wire:click="setRoleFilter('admin')"
                            aria-selected="{{ $roleFilter === 'admin' ? 'true' : 'false' }}">
                        Admin
                    </button>
                    <button type="button"
                            role="tab"
                            class="ha-tab{{ $roleFilter === 'karyawan' ? ' on' : '' }}"
                            wire:click="setRoleFilter('karyawan')"
                            aria-selected="{{ $roleFilter === 'karyawan' ? 'true' : 'false' }}">
                        Karyawan
                    </button>
                    <button type="button"
                            role="tab"
                            class="ha-tab{{ $roleFilter === 'satpam' ? ' on' : '' }}"
                            wire:click="setRoleFilter('satpam')"
                            aria-selected="{{ $roleFilter === 'satpam' ? 'true' : 'false' }}">
                        Satpam
                    </button>
                </div>
            </div>

            <div class="ha-users">
                @forelse ($users as $user)
                    <div class="ha-item{{ $selectedUser && $selectedUser->id === $user->id ? ' on' : '' }}"
                         wire:key="user-{{ $user->id }}">
                        <button type="button" class="ha-open" wire:click="selectUser({{ $user->id }})">
                            <span class="ha-avatar {{ $user->role }}">{{ $initial($user->name) }}</span>
                            <span class="ha-who">
                                <b>{{ $user->name }}</b>
                                <small>{{ $user->position ?: 'Tanpa posisi' }}</small>
                            </span>
                            <span class="ha-tally">{{ count($user->permissionList()) }}/{{ $totalModules }}</span>
                        </button>
                    </div>
                @empty
                    <p class="ha-empty">
                        <x-master-komponen::icon name="users" />
                        Tidak ada pengguna yang cocok.
                    </p>
                @endforelse
            </div>

            <div class="ha-left-foot">
                <span>{{ $users->count() }} pengguna</span>
            </div>
        </aside>

        <div class="ha-right-col">
            <section class="ha-right">
                @if ($selectedUser)
                    @php $locked = $selectedUser->isAdmin(); @endphp

                    <div class="ha-profile">
                        <span class="ha-avatar lg {{ $selectedUser->role }}">{{ $initial($selectedUser->name) }}</span>

                        <div class="ha-profile-info">
                            <h3>{{ $selectedUser->name }}</h3>
                            <p>{{ $selectedUser->position ?: 'Tanpa posisi' }}</p>
                            <p class="ha-email">{{ $selectedUser->email }}</p>
                            <div class="ha-profile-badges">
                                <span class="ha-badge {{ $selectedUser->role }}">{{ $roleLabels[$selectedUser->role] ?? ucfirst($selectedUser->role) }}</span>
                                @if ($selectedUser->nik)
                                    <span class="ha-meta">NIK {{ $selectedUser->nik }}</span>
                                @endif
                            </div>
                        </div>
                    </div>

                    <div class="ha-access">
                        <div class="ha-access-head">
                            <div>
                                <h4>Atur akses halaman</h4>
                                <p>
                                    @if ($locked)
                                        Admin memiliki akses penuh ke semua halaman.
                                    @else
                                        {{ $selectedCount }} dari {{ $totalModules }} halaman aktif
                                    @endif
                                </p>
                            </div>

                            <div class="ha-access-actions">
                                @if (! $canManage)
                                    <span class="ha-bulk">
                                        <x-master-komponen::icon name="shield" />
                                        Hanya admin yang dapat mengubah
                                    </span>
                                @endif

                                @unless ($locked)
                                    <div class="ha-modes" role="radiogroup" aria-label="Mode hak akses">
                                        <label class="ha-mode{{ $selectedUser->permissions === null ? ' on' : '' }}">
                                            <input type="radio"
                                                   name="access-mode-{{ $selectedUser->id }}"
                                                   @checked($selectedUser->permissions === null)
                                                   @disabled(! $canManage)
                                                   wire:click="useDefaultAccess({{ $selectedUser->id }})">
                                            <span class="ha-mode-text">
                                                <b>Default</b>
                                                <small>Akses bawaan</small>
                                            </span>
                                            <span class="ha-mode-mark" aria-hidden="true">
                                                <x-master-komponen::icon name="check" />
                                            </span>
                                        </label>

                                        <label class="ha-mode{{ $selectedUser->permissions !== null ? ' on' : '' }}">
                                            <input type="radio"
                                                   name="access-mode-{{ $selectedUser->id }}"
                                                   @checked($selectedUser->permissions !== null)
                                                   @disabled(! $canManage)
                                                   wire:click="useCustomAccess({{ $selectedUser->id }})">
                                            <span class="ha-mode-text">
                                                <b>Custom</b>
                                                <small>Atur sendiri</small>
                                            </span>
                                            <span class="ha-mode-mark" aria-hidden="true">
                                                <x-master-komponen::icon name="check" />
                                            </span>
                                        </label>
                                    </div>
                                @endunless
                            </div>
                        </div>

                        <label class="ha-search ha-module-search">
                            <x-master-komponen::icon name="search" />
                            <input type="search"
                                   wire:model.live.debounce.250ms="moduleQuery"
                                   placeholder="Cari halaman"
                                   autocomplete="off"
                                   aria-label="Cari halaman">
                        </label>

                        @if ($locked)
                            <p class="ha-locked">
                                <x-master-komponen::icon name="shield" />
                                Akun admin otomatis memiliki akses ke seluruh halaman.
                            </p>
                        @endif

                        @forelse ($moduleGroups as $group)
                            @php
                                $enabled = $locked ? $group['total'] : count(array_intersect($group['slugs'], $allowed));
                                $allOn = $enabled === $group['total'];
                            @endphp

                            <section class="ha-group" wire:key="group-{{ $selectedUser->id }}-{{ $group['key'] }}">
                                <div class="ha-group-head">
                                    <label class="ha-switch" title="Aktifkan semua halaman di grup ini">
                                        <input type="checkbox"
                                               wire:change="toggleGroup({{ $selectedUser->id }}, {{ $group['key'] }}, $event.target.checked)"
                                               @checked($allOn)
                                               @disabled($locked || ! $canManage)
                                               aria-label="Semua halaman {{ $group['label'] }}">
                                        <span class="ha-track"></span>
                                    </label>

                                    <span class="ha-group-name">{{ $group['label'] }}</span>
                                    <span class="ha-group-count">{{ $enabled }}/{{ $group['total'] }}</span>
                                </div>

                                <div class="ha-pages">
                                    @foreach ($group['pages'] as $page)
                                        <label class="ha-page" wire:key="page-{{ $selectedUser->id }}-{{ $page['slug'] }}">
                                            <span class="ha-page-label">
                                                @if ($page['section'])
                                                    <small>{{ $page['section'] }}</small>
                                                @endif
                                                {{ $page['label'] }}
                                            </span>

                                            <span class="ha-switch">
                                                <input type="checkbox"
                                                       wire:change="toggleAccess({{ $selectedUser->id }}, '{{ $page['slug'] }}')"
                                                       @checked($locked || in_array($page['slug'], $allowed, true))
                                                       @disabled($locked || ! $canManage)
                                                       aria-label="Akses {{ $page['label'] }}">
                                                <span class="ha-track"></span>
                                            </span>
                                        </label>
                                    @endforeach
                                </div>
                            </section>
                        @empty
                            <p class="ha-empty">
                                <x-master-komponen::icon name="search" />
                                Tidak ada halaman yang cocok dengan pencarian.
                            </p>
                        @endforelse
                    </div>
                @else
                    <div class="ha-placeholder">
                        <x-master-komponen::icon name="shield" />
                        <b>Pilih pengguna</b>
                        <p>Pilih pengguna di daftar sebelah kiri untuk mengatur hak akses halaman.</p>
                    </div>
                @endif
            </section>
            <p class="nt ha-note">
                <x-master-komponen::icon name="info" />
                Perubahan langsung tersimpan.
            </p>
        </div>
    </div>
</div>
