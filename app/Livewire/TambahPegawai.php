<?php

namespace App\Livewire;

use App\Models\Employee;
use App\Models\EmployeeJabatan;
use Livewire\Component;

class TambahPegawai extends Component
{
    public ?int $employeeId = null;

    public function mount(): void
    {
        $employee = request()->query('employee');

        if (! is_numeric($employee)) {
            return;
        }

        $this->employeeId = (int) $employee;

        abort_unless(Employee::query()->whereKey($this->employeeId)->exists(), 404);
    }

    public function render()
    {
        return view('hris.data-pegawai.tambah', [
            'employeeId' => $this->employeeId,
            'jabatans' => EmployeeJabatan::query()->orderBy('nama')->pluck('nama')->all(),
        ])->layout('components.layouts.app', [
            'title' => 'Tambah Karyawan',
            'active' => 'data-pegawai',
        ]);
    }
}
