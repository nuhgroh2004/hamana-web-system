<div class="set-panel" data-panel="ubah-password">
    <h2>Ubah Password</h2>
    <p class="ds">
        @if ($passwordTargetMissing)
            Pegawai {{ $passwordTargetName !== '' ? $passwordTargetName.' ' : '' }}({{ $passwordTargetNik }}) belum memiliki akun pengguna.
        @elseif ($passwordTargetUserId !== null && $passwordTargetUserId !== auth()->id())
            Perbarui kata sandi untuk <strong>{{ $passwordTargetName }}</strong> ({{ $passwordTargetNik }}).
        @else
            Perbarui kata sandi akun Anda.
        @endif
    </p>

    <div class="cd">
        @if ($passwordStatus)
            <p class="ustat">{{ $passwordStatus }}</p>
        @endif

        <p class="pwarn">
            <x-master-komponen::icon name="warning" />
            <span>Keamanan akun anda, ada di tangan anda sendiri, jangan membuat password yang mudah di tebak orang lain.</span>
        </p>

        <form class="ufm" wire:submit="updatePassword">
            <div class="ufm-g">
                <label for="new-password">
                    Password Baru
                    <div class="pw-wrap">
                        <input id="new-password" type="password" wire:model="newPassword" autocomplete="new-password" placeholder="Masukkan password baru">
                        <button class="pw-eye" type="button" data-pw-toggle="#new-password" aria-label="Tampilkan password" aria-pressed="false">
                            <x-master-komponen::icon name="eye-slash" class="eye-show" />
                            <x-master-komponen::icon name="eye" class="eye-hide" />
                        </button>
                    </div>
                    @error('newPassword') <span class="err-line">{{ $message }}</span> @enderror
                </label>
            </div>

            <div class="ufm-f">
                <button type="submit" class="ubtn primary" wire:loading.attr="disabled" wire:target="updatePassword">
                    Simpan Password
                </button>
            </div>
        </form>
    </div>

    <p class="nt">
        <x-master-komponen::icon name="info" />
        Perubahan langsung tersimpan.
    </p>
</div>
