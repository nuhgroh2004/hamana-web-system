<?php

return [
    'groups' => [
        [
            'label' => 'HRIS',
            'items' => [
                ['label' => 'Dashboard', 'icon' => 'dash', 'slug' => 'dashboard', 'route' => 'dashboard'],
                ['label' => 'Permohonan', 'icon' => 'req', 'children' => [
                    ['label' => 'Permohonan Masuk', 'slug' => 'permohonan-masuk'],
                    ['label' => 'Permohonan Saya', 'slug' => 'permohonan-saya'],
                    ['label' => 'Izin Cuti atau Sakit', 'slug' => 'izin-cuti-atau-sakit'],
                    ['label' => 'Izin Keluar Kantor', 'slug' => 'izin-keluar-kantor'],
                    ['label' => 'Izin Dinas Dalam Kota', 'slug' => 'izin-dinas-dalam-kota'],
                    ['label' => 'Izin Dinas Luar Kota', 'slug' => 'izin-dinas-luar-kota'],
                    ['label' => 'Form Absensi', 'slug' => 'form-absensi'],
                ]],
                ['label' => 'Absensi', 'icon' => 'clock', 'slug' => 'absensi'],
                ['label' => 'Input', 'icon' => 'edit', 'children' => [
                    ['label' => 'Cuti dan Sakit', 'slug' => 'input-cuti-dan-sakit'],
                    ['label' => 'Buku Hamana', 'slug' => 'input-buku-hamana'],
                ]],
                ['label' => 'Slip Gaji', 'icon' => 'money', 'slug' => 'slip-gaji'],
                ['label' => 'Buku Hamana', 'icon' => 'book', 'slug' => 'buku-hamana'],
                ['label' => 'Profil', 'icon' => 'user', 'children' => [
                    ['label' => 'Data Pribadi', 'slug' => 'profil-data-pribadi'],
                    ['label' => 'Riwayat Pendidikan', 'slug' => 'profil-riwayat-pendidikan'],
                    ['label' => 'Anggota Keluarga', 'slug' => 'profil-anggota-keluarga'],
                    ['label' => 'Ciri Fisik', 'slug' => 'profil-ciri-fisik'],
                    ['label' => 'Kelola File', 'slug' => 'profil-kelola-file'],
                ]],
                ['label' => 'Saran', 'icon' => 'msg', 'slug' => 'saran'],
                ['label' => 'Saran Masuk', 'icon' => 'inbox', 'slug' => 'saran-masuk'],
                ['label' => 'Data Pegawai', 'icon' => 'users', 'slug' => 'data-pegawai'],
                ['label' => 'Dokumen Pegawai', 'icon' => 'folder', 'slug' => 'dokumen-pegawai'],
                ['label' => 'Rekrutmen', 'icon' => 'brief', 'children' => [
                    ['label' => 'Pelamar Baru', 'slug' => 'rekrutmen-pelamar-baru'],
                    ['label' => 'Pelamar Diterima', 'slug' => 'rekrutmen-pelamar-diterima'],
                    ['label' => 'Talent Pool', 'slug' => 'rekrutmen-talent-pool'],
                    ['label' => 'Kirim Pesan', 'slug' => 'rekrutmen-kirim-pesan'],
                ]],
                ['label' => 'Data Admin', 'icon' => 'shield', 'children' => [
                    ['label' => 'List Admin', 'slug' => 'data-admin-list-admin'],
                    ['label' => 'Data Tingkat', 'slug' => 'data-admin-tingkat'],
                    ['label' => 'Data Golongan', 'slug' => 'data-admin-golongan'],
                    ['label' => 'Data Jabatan', 'slug' => 'data-admin-jabatan'],
                    ['label' => 'Data Faskes BPJS', 'slug' => 'data-admin-faskes-bpjs'],
                ]],
                ['label' => 'Tanda Tangan', 'icon' => 'pen', 'slug' => 'tanda-tangan'],
                ['label' => 'Ubah Password', 'icon' => 'lock', 'slug' => 'ubah-password'],
            ],
        ],
        [
            'label' => 'Payroll Sistem',
            'separator' => true,
            'items' => [
                ['label' => 'Master Data', 'icon' => 'db', 'children' => [
                    ['label' => 'Data Pegawai', 'slug' => 'master-data-pegawai'],
                    ['label' => 'Data Hari Libur', 'slug' => 'master-data-hari-libur'],
                    ['label' => 'BPJS Tenaga Kerja', 'slug' => 'master-data-bpjs-tenaga-kerja'],
                    ['label' => 'BPJS Kesehatan', 'slug' => 'master-data-bpjs-kesehatan'],
                    ['label' => 'Aturan Potongan BPJS', 'slug' => 'master-data-aturan-potongan-bpjs'],
                ]],
                ['label' => 'Transaksi Payroll', 'icon' => 'swap', 'children' => [
                    ['label' => 'Lembur', 'slug' => 'transaksi-lembur'],
                    ['label' => 'Makan Lembur', 'slug' => 'transaksi-makan-lembur'],
                    ['label' => 'Kehadiran', 'slug' => 'transaksi-kehadiran'],
                    ['label' => 'Rapel', 'slug' => 'transaksi-rapel'],
                    ['label' => 'Adjustment', 'slug' => 'transaksi-adjustment'],
                    ['label' => 'Tunjangan Lain-lain', 'slug' => 'transaksi-tunjangan-lain-lain'],
                ]],
                ['label' => 'Generate Payroll', 'icon' => 'calc', 'slug' => 'generate-payroll'],
                ['label' => 'Slip Gaji', 'icon' => 'money', 'slug' => 'payroll-slip-gaji'],
                ['label' => 'Laporan', 'icon' => 'chart', 'children' => [
                    ['label' => 'Laporan Akhir', 'slug' => 'laporan-akhir'],
                    ['label' => 'Rekap ke Direksi', 'slug' => 'laporan-rekap-ke-direksi'],
                    ['label' => 'Rekap Lembur', 'slug' => 'laporan-rekap-lembur'],
                    ['label' => 'Rekap Gaji', 'slug' => 'laporan-rekap-gaji'],
                    ['label' => 'Rekap per Karyawan', 'slug' => 'laporan-rekap-per-karyawan'],
                    ['label' => 'Rekap Kenaikan Gaji', 'slug' => 'laporan-rekap-kenaikan-gaji'],
                ]],
            ],
        ],
        [
            'separator' => true,
            'items' => [
                ['label' => 'Pengaturan', 'icon' => 'gear', 'slug' => 'pengaturan', 'route' => 'pengaturan'],
            ],
        ],
    ],
];
