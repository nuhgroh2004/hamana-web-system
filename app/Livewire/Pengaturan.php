<?php

namespace App\Livewire;

use App\Models\User;
use App\Support\Modules;
use Illuminate\Validation\Rule;
use Livewire\Component;

class Pengaturan extends Component
{
    public bool $showUserForm = false;

    public ?int $editingUserId = null;

    public string $formNik = '';

    public string $formName = '';

    public string $formEmail = '';

    public string $formPassword = '';

    public string $formRole = 'karyawan';

    public string $formPosition = '';

    public string $userStatus = '';

    /**
     * Open an empty user form.
     */
    public function openCreateForm(): void
    {
        $this->authorizeAdmin();
        $this->resetUserForm();
        $this->userStatus = '';
        $this->showUserForm = true;
    }

    /**
     * Open the user form pre-filled with an existing user.
     */
    public function openEditForm(int $userId): void
    {
        $this->authorizeAdmin();

        $user = User::findOrFail($userId);

        $this->resetUserForm();
        $this->userStatus = '';
        $this->editingUserId = $user->id;
        $this->formNik = $user->nik ?? '';
        $this->formName = $user->name;
        $this->formEmail = $user->email;
        $this->formRole = $user->role;
        $this->formPosition = $user->position ?? '';
        $this->showUserForm = true;
    }

    /**
     * Close and clear the user form.
     */
    public function cancelUserForm(): void
    {
        $this->showUserForm = false;
        $this->resetUserForm();
    }

    /**
     * Create or update a user.
     */
    public function saveUser(): void
    {
        $this->authorizeAdmin();
        $this->userStatus = '';
        $this->validate();

        $data = [
            'nik' => $this->formNik,
            'name' => $this->formName,
            'email' => $this->formEmail,
            'role' => $this->formRole,
            'position' => $this->formPosition,
        ];

        if ($this->formPassword !== '') {
            $data['password'] = $this->formPassword;
        }

        if ($this->editingUserId) {
            $user = User::findOrFail($this->editingUserId);
            $oldRole = $user->role;

            if ($user->id === auth()->id() && $this->formRole !== 'admin') {
                $this->addError('formRole', 'Role akun sendiri tidak dapat diubah.');

                return;
            }

            if ($user->isAdmin() && $this->formRole !== 'admin' && $this->isLastAdmin($user)) {
                $this->addError('formRole', 'Minimal harus ada satu admin.');

                return;
            }

            $user->update($data);

            if ($oldRole !== $this->formRole) {
                $user->permissions = null;
                $user->save();
            }

            $this->userStatus = 'Data pengguna diperbarui.';
        } else {
            $data['email_verified_at'] = now();

            User::create($data);
            $this->userStatus = 'Pengguna baru ditambahkan.';
        }

        $this->showUserForm = false;
        $this->resetUserForm();
    }

    /**
     * Delete a user.
     */
    public function deleteUser(int $userId): void
    {
        $this->authorizeAdmin();
        $this->userStatus = '';
        $this->resetValidation();

        $user = User::findOrFail($userId);

        if ($user->id === auth()->id()) {
            $this->addError('user', 'Tidak dapat menghapus akun sendiri.');

            return;
        }

        if ($user->isAdmin() && $this->isLastAdmin($user)) {
            $this->addError('user', 'Minimal harus ada satu admin.');

            return;
        }

        $user->delete();

        if ($this->editingUserId === $userId) {
            $this->cancelUserForm();
        }

        $this->userStatus = 'Pengguna dihapus.';
    }

    /**
     * Turn one page permission on or off for a user.
     */
    public function toggleAccess(int $userId, string $slug): void
    {
        $this->authorizeAdmin();

        $user = User::findOrFail($userId);

        if ($user->isAdmin() || ! Modules::find($slug)) {
            return;
        }

        $allowed = $user->permissionList();

        if (in_array($slug, $allowed, true)) {
            $allowed = array_values(array_diff($allowed, [$slug]));
        } else {
            $allowed[] = $slug;
        }

        $user->permissions = array_values(array_unique($allowed));
        $user->save();
    }

    /**
     * Restore the default karyawan permissions.
     */
    public function resetAccess(int $userId): void
    {
        $this->authorizeAdmin();

        $user = User::findOrFail($userId);

        if ($user->isAdmin()) {
            return;
        }

        $user->permissions = null;
        $user->save();
    }

    public function render()
    {
        return view('pengaturan.index', [
            'users' => User::query()
                ->orderByRaw("case when role = 'admin' then 0 else 1 end")
                ->orderBy('name')
                ->get(),
            'moduleGroups' => Modules::menu(),
        ])->layout('components.layouts.app', [
            'title' => 'Pengaturan',
            'active' => 'Pengaturan',
            'main' => 'set-page',
        ]);
    }

    /**
     * Validation rules for the user form.
     *
     * @return array<string, array<int, mixed>>
     */
    protected function rules(): array
    {
        return [
            'formNik' => [
                'required',
                'string',
                'regex:/^\d{4}\.\d{2}\.\d{2}\.\d{2}$/',
                Rule::unique('users', 'nik')->ignore($this->editingUserId),
            ],
            'formName' => ['required', 'string', 'max:255'],
            'formEmail' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->editingUserId),
            ],
            'formPassword' => [$this->editingUserId ? 'nullable' : 'required', 'string', 'min:6'],
            'formRole' => ['required', Rule::in(['admin', 'karyawan'])],
            'formPosition' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Validation messages in Indonesian.
     *
     * @return array<string, string>
     */
    protected function messages(): array
    {
        return [
            'formNik.required' => 'NIK wajib diisi.',
            'formNik.regex' => 'Format NIK harus seperti 1232.31.23.12.',
            'formNik.unique' => 'NIK sudah digunakan.',
            'formName.required' => 'Nama wajib diisi.',
            'formEmail.required' => 'Email wajib diisi.',
            'formEmail.email' => 'Format email tidak valid.',
            'formEmail.unique' => 'Email sudah digunakan.',
            'formPassword.required' => 'Password wajib diisi.',
            'formPassword.min' => 'Password minimal 6 karakter.',
            'formRole.required' => 'Role wajib dipilih.',
            'formPosition.required' => 'Posisi wajib diisi.',
        ];
    }

    protected function resetUserForm(): void
    {
        $this->reset([
            'editingUserId',
            'formNik',
            'formName',
            'formEmail',
            'formPassword',
            'formRole',
            'formPosition',
        ]);

        $this->resetValidation();
        $this->formRole = 'karyawan';
    }

    protected function authorizeAdmin(): void
    {
        abort_unless(auth()->user()?->isAdmin(), 403);
    }

    protected function isLastAdmin(User $user): bool
    {
        return User::query()
            ->where('role', 'admin')
            ->whereKeyNot($user->id)
            ->doesntExist();
    }
}
