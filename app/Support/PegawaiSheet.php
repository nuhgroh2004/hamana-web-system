<?php

namespace App\Support;

class PegawaiSheet
{
    /**
     * Education levels used by the spreadsheet columns.
     *
     * @var array<string, string> Spreadsheet label => stored jenjang value.
     */
    public const EDUCATION_LEVELS = [
        'SD' => 'SD',
        'SMP' => 'SMP',
        'SMA/SMK' => 'SMA/SMK',
        'Diploma' => 'DIPLOMA',
        'Sarjana' => 'SARJANA',
        'Magister' => 'MAGISTER',
        'Doktoral' => 'DOKTORAL',
    ];

    /**
     * Family slots used by the spreadsheet columns.
     *
     * @var list<array{label: string, hubungan: string, urutan: int, spouse?: bool}>
     */
    public const FAMILY_SLOTS = [
        ['label' => 'Ayah', 'hubungan' => 'AYAH', 'urutan' => 1],
        ['label' => 'Ibu', 'hubungan' => 'IBU', 'urutan' => 1],
        ['label' => 'Saudara 1', 'hubungan' => 'SAUDARA', 'urutan' => 1],
        ['label' => 'Saudara 2', 'hubungan' => 'SAUDARA', 'urutan' => 2],
        ['label' => 'Saudara 3', 'hubungan' => 'SAUDARA', 'urutan' => 3],
        ['label' => 'Saudara 4', 'hubungan' => 'SAUDARA', 'urutan' => 4],
        ['label' => 'Saudara 5', 'hubungan' => 'SAUDARA', 'urutan' => 5],
        ['label' => 'Suami', 'hubungan' => 'SUAMI', 'urutan' => 1, 'spouse' => true],
        ['label' => 'Anak 1', 'hubungan' => 'ANAK', 'urutan' => 1],
        ['label' => 'Anak 2', 'hubungan' => 'ANAK', 'urutan' => 2],
        ['label' => 'Anak 3', 'hubungan' => 'ANAK', 'urutan' => 3],
        ['label' => 'Anak 4', 'hubungan' => 'ANAK', 'urutan' => 4],
        ['label' => 'Anak 5', 'hubungan' => 'ANAK', 'urutan' => 5],
    ];

    /**
     * Physical trait columns, in spreadsheet order.
     *
     * @var list<string>
     */
    public const PHYSICAL_COLUMNS = [
        'Warna Kulit',
        'Golongan Darah',
        'Warna Rambut',
        'Ukuran Baju',
        'Warna Mata',
        'Ukuran Celana',
        'Tinggi Badan',
        'Berat Badan',
        'Ukuran Sepatu',
    ];

    /**
     * Build the full spreadsheet header row.
     *
     * @return list<string>
     */
    public static function headers(): array
    {
        $headers = [
            'No',
            'Ref ID',
            'NIK',
            'No. KTP',
            'Nama Lengkap',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Agama',
            'Status Nikah',
            'Jumlah Anak',
            'Email',
            'No. HP 1',
            'No. HP 2',
            'Rumah yang Ditinggali',
            'Alamat KTP',
            'Alamat Domisili',
            'Propinsi',
            'No. Passport',
            'NPWP',
            'BPJS Ketenagakerjaan',
            'BPJS Kesehatan',
            'Rekening Mandiri',
            'Faskes Tingkat I',
            'Tingkat',
            'Golongan',
            'Jabatan',
            'Departemen',
            'Posisi',
            'Tanggal Bergabung',
            'Status Pegawai',
            'Nama Darurat 1',
            'No. Telp Darurat 1',
            'Hubungan Darurat 1',
            'Nama Darurat 2',
            'No. Telp Darurat 2',
            'Hubungan Darurat 2',
            'Instagram',
            'Facebook',
            'Twitter',
            'Code Grup Pajak',
            'Code Grup Status Pernikahan',
            'Code Status Pajak',
        ];

        foreach (array_keys(self::EDUCATION_LEVELS) as $level) {
            $headers[] = 'Pendidikan '.$level.' - Nama Sekolah';
            $headers[] = 'Pendidikan '.$level.' - Jurusan';
            $headers[] = 'Pendidikan '.$level.' - Tahun';
        }

        foreach (self::FAMILY_SLOTS as $slot) {
            $headers[] = 'Keluarga '.$slot['label'].' - Nama';
            $headers[] = 'Keluarga '.$slot['label'].' - Usia';
            $headers[] = 'Keluarga '.$slot['label'].' - Pekerjaan';
        }

        return array_merge($headers, self::PHYSICAL_COLUMNS);
    }

    /**
     * Normalize a spreadsheet header so labels can be matched safely.
     */
    public static function normalize(string $header): string
    {
        return preg_replace('/[^a-z0-9]/', '', mb_strtolower(trim($header))) ?? '';
    }

    /**
     * Build the normalized key prefix for an education level.
     */
    public static function educationKey(string $level): string
    {
        return 'pendidikan'.self::normalize($level);
    }

    /**
     * Build the normalized key prefix for a family slot.
     *
     * @param  array{label: string, hubungan: string, urutan: int, spouse?: bool}  $slot
     */
    public static function familyKey(array $slot): string
    {
        return 'keluarga'.self::normalize($slot['label']);
    }
}
