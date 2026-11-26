<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PayrollModulePageTest extends TestCase
{
    use DatabaseTransactions;

    public function test_payroll_module_routes_render_their_views_in_the_shared_layout(): void
    {
        $admin = User::factory()->create([
            'email' => 'payroll-modules@hamana.co.id',
            'nik' => '9111.00.00.20',
            'role' => 'admin',
        ]);

        $modules = [
            'master-data-pegawai' => 'payroll-master-data-pegawai',
            'master-data-hari-libur' => 'payroll-data-hari-libur',
            'master-data-bpjs-tenaga-kerja' => 'payroll-pengaturan-bpjs-tk',
            'master-data-bpjs-kesehatan' => 'payroll-pengaturan-bpjs-kesehatan',
            'master-data-aturan-potongan-bpjs' => 'payroll-golongan-bpjs',
            'generate-payroll' => 'payroll-generate-payroll',
            'payroll-slip-gaji' => 'payroll-slip-gaji',
            'transaksi-makan-lembur' => 'payroll-makan-lembur',
            'transaksi-lembur' => 'payroll-data-lembur',
            'transaksi-rapel' => 'payroll-data-rapel',
            'transaksi-kehadiran' => 'payroll-data-kehadiran',
        ];

        foreach ($modules as $slug => $pageId) {
            $this->actingAs($admin)
                ->get('/modul/'.$slug)
                ->assertOk()
                ->assertSee('id="'.$pageId.'"', false)
                ->assertSee('id="nav"', false)
                ->assertSee('aria-current="page"', false);
        }
    }
}
