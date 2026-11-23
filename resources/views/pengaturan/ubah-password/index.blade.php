<div class="set-panel" data-panel="ubah-password">
    <h2>Ubah Password</h2>
    <p class="ds">Perbarui kata sandi akun Anda.</p>

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
                <label>
                    Password Saat Ini
                    <input type="password" wire:model="currentPassword" autocomplete="current-password" placeholder="Masukkan password saat ini">
                    @error('currentPassword') <span class="err-line">{{ $message }}</span> @enderror
                </label>
                <label>
                    Password Baru
                    <input type="password" wire:model="newPassword" autocomplete="new-password" placeholder="Masukkan password baru">
                    @error('newPassword') <span class="err-line">{{ $message }}</span> @enderror
                </label>
                <label>
                    Konfirmasi Password Baru
                    <input type="password" wire:model="newPasswordConfirmation" autocomplete="new-password" placeholder="Ulangi password baru">
                    @error('newPasswordConfirmation') <span class="err-line">{{ $message }}</span> @enderror
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
