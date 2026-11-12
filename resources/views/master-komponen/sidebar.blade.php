@props(['active' => null])

@php
    $menu = [
        'HRIS',
        ['icon' => 'dash', 'label' => 'Dashboard'],
        ['icon' => 'req', 'label' => 'Permohonan', 'children' => [
            'Permohonan Masuk',
            'Permohonan Saya',
            'Izin Cuti atau Sakit',
            'Izin Keluar Kantor',
            'Izin Dinas Dalam Kota',
            'Izin Dinas Luar Kota',
            'Form Absensi',
        ]],
        ['icon' => 'clock', 'label' => 'Absensi'],
        ['icon' => 'edit', 'label' => 'Input', 'children' => [
            'Cuti dan Sakit',
            'Buku Hamana',
        ]],
        ['icon' => 'money', 'label' => 'Slip Gaji'],
        ['icon' => 'book', 'label' => 'Buku Hamana'],
        ['icon' => 'user', 'label' => 'Profil', 'children' => [
            'Data Pribadi',
            'Riwayat Pendidikan',
            'Anggota Keluarga',
            'Ciri Fisik',
            'Kelola File',
        ]],
        ['icon' => 'msg', 'label' => 'Saran'],
        ['icon' => 'inbox', 'label' => 'Saran Masuk'],
        ['icon' => 'users', 'label' => 'Data Pegawai'],
        ['icon' => 'folder', 'label' => 'Dokumen Pegawai'],
        ['icon' => 'brief', 'label' => 'Rekrutmen', 'children' => [
            'Pelamar Baru',
            'Pelamar Diterima',
            'Talent Pool',
            'Kirim Pesan',
        ]],
        ['icon' => 'shield', 'label' => 'Data Admin', 'children' => [
            'List Admin',
            'Data Tingkat',
            'Data Golongan',
            'Data Jabatan',
            'Data Faskes BPJS',
        ]],
        ['icon' => 'pen', 'label' => 'Tanda Tangan'],
        ['icon' => 'lock', 'label' => 'Ubah Password'],
        '-',
        'Payroll Sistem',
        ['icon' => 'db', 'label' => 'Master Data', 'children' => [
            'Data Pegawai',
            'Data Hari Libur',
            'BPJS Tenaga Kerja',
            'BPJS Kesehatan',
            'Aturan Potongan BPJS',
        ]],
        ['icon' => 'swap', 'label' => 'Transaksi Payroll', 'children' => [
            'Lembur',
            'Makan Lembur',
            'Kehadiran',
            'Rapel',
            'Adjustment',
            'Tunjangan Lain-lain',
        ]],
        ['icon' => 'calc', 'label' => 'Generate Payroll'],
        ['icon' => 'money', 'label' => 'Slip Gaji'],
        ['icon' => 'chart', 'label' => 'Laporan', 'children' => [
            'Laporan Akhir',
            'Rekap ke Direksi',
            'Rekap Lembur',
            'Rekap Gaji',
            'Rekap per Karyawan',
            'Rekap Kenaikan Gaji',
        ]],
        '-',
        ['icon' => 'gear', 'label' => 'Pengaturan', 'href' => route('pengaturan')],
    ];

    $current = $active ?? (request()->routeIs('pengaturan') ? 'Pengaturan' : 'Dashboard');
@endphp

<nav id="nav" aria-label="Menu utama">
    <ul>
        @foreach ($menu as $item)
            @if ($item === '-')
                <li class="sep"></li>
            @elseif (is_string($item))
                <li class="grp">{{ $item }}</li>
            @else
                @php
                    $hasChildren = ! empty($item['children']);
                    $href = $item['href'] ?? '#';
                    $isActive = $current === $item['label'];
                @endphp
                <li class="t{{ $hasChildren ? ' has' : '' }}{{ $isActive ? ' act' : '' }}">
                    <a href="{{ $href }}" @if ($href === '#') data-placeholder="true" @endif @if ($isActive) aria-current="page" @endif>
                        <x-master-komponen::icon :name="$item['icon']" />
                        {{ $item['label'] }}
                        @if ($hasChildren)
                            <x-master-komponen::icon name="down" class="ch" />
                        @endif
                    </a>
                    @if ($hasChildren)
                        <div class="sw">
                            <ul>
                                @foreach ($item['children'] as $child)
                                    <li><a href="#" data-placeholder="true">{{ $child }}</a></li>
                                @endforeach
                            </ul>
                        </div>
                    @endif
                </li>
            @endif
        @endforeach
    </ul>
</nav>
