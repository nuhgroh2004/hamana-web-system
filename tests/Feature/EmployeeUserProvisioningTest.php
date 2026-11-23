<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use App\Services\Pegawai\CreateUserFromEmployeeProfileService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class EmployeeUserProvisioningTest extends TestCase
{
    use DatabaseTransactions;

    public function test_backfill_command_creates_accounts_idempotently(): void
    {
        $employee = Employee::query()->create([
            'nik' => 'PROVISION.01',
            'nama' => 'Nuhgroh Ramadani',
            'status_pegawai' => Employee::STATUS_AKTIF,
        ]);
        $employee->profile()->create([
            'email' => 'nuhgroh@example.test',
            'tanggal_lahir' => '2004-09-11',
        ]);

        Artisan::call('employees:provision-users');

        $employee->refresh();
        $user = User::query()->findOrFail($employee->user_id);

        $this->assertSame('karyawan', $user->role);
        $this->assertNull($user->permissions);
        $this->assertTrue(Hash::check('nuhgroh1109', $user->password));

        Artisan::call('employees:provision-users');
        $this->assertSame(1, User::query()->where('email', 'nuhgroh@example.test')->count());
        $this->assertStringContainsString('Sudah terhubung', Artisan::output());
    }

    public function test_existing_non_employee_email_is_reported_as_a_conflict(): void
    {
        User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email' => 'dipakai@example.test',
        ]);
        $employee = Employee::query()->create([
            'nik' => 'PROVISION.02',
            'nama' => 'Pegawai Konflik',
            'status_pegawai' => Employee::STATUS_AKTIF,
        ]);
        $employee->profile()->create([
            'email' => 'dipakai@example.test',
            'tanggal_lahir' => '1990-01-02',
        ]);

        $status = app(CreateUserFromEmployeeProfileService::class)->handle($employee);

        $this->assertSame(CreateUserFromEmployeeProfileService::CONFLICT, $status);
        $this->assertNull($employee->fresh()->user_id);
        $this->assertSame(1, User::query()->where('email', 'dipakai@example.test')->count());
    }
}
