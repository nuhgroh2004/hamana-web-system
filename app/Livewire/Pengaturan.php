<?php

namespace App\Livewire;

use App\Models\User;
use App\Services\Access\SetUserCustomAccessService;
use App\Services\Access\SetUserDefaultAccessService;
use App\Services\Access\ToggleUserModuleAccessService;
use App\Services\Access\ToggleUserModuleGroupAccessService;
use App\Services\Employee\SyncEmployeeFromUserService;
use App\Support\Modules;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Livewire\Component;

class Pengaturan extends Component
{
    public string $panel = 'bahasa';

    public bool $showUserForm = false;

    public ?int $editingUserId = null;

    public string $formNik = '';

    public string $formName = '';

    public string $formEmail = '';

    public string $formPassword = '';

    public string $formRole = 'karyawan';

    public string $formPosition = '';

    public string $userStatus = '';

    public ?int $selectedUserId = null;

    public string $userQuery = '';

    public string $roleFilter = 'all';

    public string $moduleQuery = '';

    public string $currentPassword = '';

    public string $newPassword = '';

    public string $newPasswordConfirmation = '';

    public string $passwordStatus = '';

    /**
     * Set the active settings panel from the URL.
     */
    public function mount(?string $panel = null): void
    {
        $panels = $this->panels();

        if ($panel === null) {
            $panel = $panels[0]['slug'] ?? null;
        }

        abort_unless($panel !== null && in_array($panel, array_column($panels, 'slug'), true), 403);

        $this->panel = $panel;

        if ($this->panel === 'hak-akses' && $this->selectedUserId === null) {
            $this->selectedUserId = User::query()
                ->where('role', 'karyawan')
                ->orderBy('name')
                ->value('id')
                ?? User::query()->orderBy('name')->value('id');
        }
    }

    /**
     * Settings panels available to the current user.
     *
     * @return list<array{slug: string, name: string, icon: string}>
     */
    public function panels(): array
    {
        $user = auth()->user();

        $panels = [];

        foreach (Modules::settings() as $item) {
            $slug = $item['slug'] ?? null;

            if (! $slug || ! $user?->canAccess($slug)) {
                continue;
            }

            $panels[] = [
                'slug' => $slug,
                'name' => $item['label'],
                'icon' => $item['icon'] ?? 'gear',
            ];
        }

        return $panels;
    }

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

            $this->syncEmployee($user);

            $this->userStatus = 'Data pengguna diperbarui.';
        } else {
            $data['email_verified_at'] = now();

            $user = User::create($data);
            $this->syncEmployee($user);

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

        if ($this->selectedUserId === $userId) {
            $this->selectedUserId = null;
        }

        $this->userStatus = 'Pengguna dihapus.';
    }

    /**
     * Select a user whose access is shown on the right panel.
     */
    public function selectUser(int $userId): void
    {
        $this->selectedUserId = $userId;
    }

    /**
     * Change the role filter of the user list.
     */
    public function setRoleFilter(string $role): void
    {
        if (! in_array($role, ['all', 'admin', 'karyawan', 'satpam'], true)) {
            return;
        }

        $this->roleFilter = $role;
    }

    /**
     * Turn every module in one group on or off for a user.
     */
    public function toggleGroup(int $userId, int $groupKey, bool $on): void
    {
        $this->authorizeAdmin();

        $group = collect($this->buildGroups())->firstWhere('key', $groupKey);

        if (! $group) {
            return;
        }

        $user = User::findOrFail($userId);

        if ($user->isAdmin()) {
            return;
        }

        app(ToggleUserModuleGroupAccessService::class)->handle(
            $user,
            $group['slugs'],
            $on,
        );
    }

    /**
     * Turn one page permission on or off for a user.
     */
    public function toggleAccess(int $userId, string $slug): void
    {
        $this->authorizeAdmin();

        $user = User::findOrFail($userId);

        app(ToggleUserModuleAccessService::class)->handle(
            $user,
            $slug,
        );
    }

    /**
     * Restore the default permissions (karyawan baseline).
     */
    public function useDefaultAccess(int $userId): void
    {
        $this->authorizeAdmin();

        $user = User::findOrFail($userId);

        app(SetUserDefaultAccessService::class)->handle($user);
    }

    /**
     * Switch the user to a custom permission set.
     *
     * Starts from the current permissions so the switches do not change.
     */
    public function useCustomAccess(int $userId): void
    {
        $this->authorizeAdmin();

        $user = User::findOrFail($userId);

        app(SetUserCustomAccessService::class)->handle($user);
    }

    /**
     * Users shown in the left-hand list.
     */
    protected function filteredUsers()
    {
        return User::query()
            ->when(trim($this->userQuery) !== '', function ($query) {
                $term = '%'.trim($this->userQuery).'%';

                $query->where(function ($query) use ($term) {
                    $query->where('name', 'like', $term)
                        ->orWhere('nik', 'like', $term)
                        ->orWhere('email', 'like', $term)
                        ->orWhere('position', 'like', $term);
                });
            })
            ->when($this->roleFilter !== 'all', fn ($query) => $query->where('role', $this->roleFilter))
            ->orderByRaw("case when role = 'admin' then 0 else 1 end")
            ->orderBy('name')
            ->get();
    }

    /**
     * Page groups shown in the selected user's access panel.
     *
     * @return list<array{key: int, label: string, pages: list<array{slug: string, label: string, section: ?string}>, slugs: list<string>, total: int}>
     */
    protected function buildGroups(): array
    {
        $needle = mb_strtolower(trim($this->moduleQuery));
        $groups = [];

        foreach (Modules::menu() as $groupKey => $group) {
            // Grup navigasi (mis. pintu masuk Pengaturan) bukan halaman.
            if (! empty($group['nav_only'])) {
                continue;
            }

            $pages = [];

            foreach ($group['items'] ?? [] as $item) {
                if (! empty($item['children'])) {
                    foreach ($item['children'] as $child) {
                        if (empty($child['slug'])) {
                            continue;
                        }

                        $page = [
                            'slug' => $child['slug'],
                            'label' => $child['label'],
                            'section' => $item['label'] ?? null,
                        ];

                        if ($this->matchesModule($page, $needle)) {
                            $pages[] = $page;
                        }
                    }

                    continue;
                }

                if (empty($item['slug'])) {
                    continue;
                }

                $page = [
                    'slug' => $item['slug'],
                    'label' => $item['label'],
                    'section' => null,
                ];

                if ($this->matchesModule($page, $needle)) {
                    $pages[] = $page;
                }
            }

            if ($pages === []) {
                continue;
            }

            $groups[] = [
                'key' => $groupKey,
                'label' => $group['label'] ?? 'Lainnya',
                'pages' => $pages,
                'slugs' => array_column($pages, 'slug'),
                'total' => count($pages),
            ];
        }

        return $groups;
    }

    /**
     * Check whether a page matches the module search query.
     */
    protected function matchesModule(array $page, string $needle): bool
    {
        if ($needle === '') {
            return true;
        }

        $haystack = mb_strtolower($page['label'].' '.($page['section'] ?? ''));

        return str_contains($haystack, $needle);
    }

    /**
     * Change the authenticated user's password.
     */
    public function updatePassword(): void
    {
        $this->resetErrorBag();
        $this->passwordStatus = '';

        $this->validate([
            'currentPassword' => ['required', 'string'],
            'newPassword' => ['required', 'string', 'min:6', 'same:newPasswordConfirmation'],
            'newPasswordConfirmation' => ['required', 'string'],
        ], [
            'currentPassword.required' => 'Password saat ini wajib diisi.',
            'newPassword.required' => 'Password baru wajib diisi.',
            'newPassword.min' => 'Password baru minimal 6 karakter.',
            'newPassword.same' => 'Konfirmasi password baru tidak cocok.',
            'newPasswordConfirmation.required' => 'Konfirmasi password baru wajib diisi.',
        ]);

        $user = auth()->user();

        if (! Hash::check($this->currentPassword, $user->password)) {
            $this->addError('currentPassword', 'Password saat ini tidak sesuai.');

            return;
        }

        $user->password = $this->newPassword;
        $user->save();

        $this->reset(['currentPassword', 'newPassword', 'newPasswordConfirmation']);
        $this->passwordStatus = 'Password berhasil diubah.';
    }

    public function render()
    {
        $users = $this->filteredUsers();

        $selectedUser = $this->selectedUserId
            ? User::query()->find($this->selectedUserId)
            : null;

        return view('pengaturan.index', [
            'panels' => $this->panels(),
            'panel' => $this->panel,
            'users' => $users,
            'selectedUser' => $selectedUser,
            'moduleGroups' => $this->buildGroups(),
            'totalModules' => count(Modules::all()),
            'canManage' => auth()->user()?->isAdmin() ?? false,
        ])->layout('components.layouts.app', [
            'title' => 'Pengaturan',
            'active' => 'pengaturan',
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
            'formRole' => ['required', Rule::in(['admin', 'karyawan', 'satpam'])],
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

    /**
     * Keep the employee record aligned with the saved user account.
     */
    protected function syncEmployee(User $user): void
    {
        app(SyncEmployeeFromUserService::class)->handle($user);
    }

    protected function isLastAdmin(User $user): bool
    {
        return User::query()
            ->where('role', 'admin')
            ->whereKeyNot($user->id)
            ->doesntExist();
    }
}
