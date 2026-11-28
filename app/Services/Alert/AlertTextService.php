<?php

namespace App\Services\Alert;

class AlertTextService
{
    /**
     * Teks bawaan tiap alert. Nilai yang dioper (tidak null/kosong)
     * menimpa teks bawaan, sehingga pemanggil cukup mengubah teksnya.
     */
    public function get(string $type, array $overrides = []): array
    {
        $defaults = [
            'confirm' => [
                'title' => 'Apakah Anda yakin?',
                'message' => 'Lanjutkan proses ini?',
                'yes' => 'Ya',
                'no' => 'Tidak',
            ],
            'success' => [
                'title' => 'Berhasil',
                'message' => 'Proses berhasil dilakukan.',
                'ok' => 'OK',
            ],
            'error' => [
                'title' => 'Gagal',
                'message' => 'Terjadi kesalahan. Silakan coba lagi.',
                'ok' => 'Tutup',
            ],
            'save' => [
                'title' => 'Simpan data?',
                'message' => 'Data yang Anda isi akan disimpan.',
                'yes' => 'Ya, simpan',
                'no' => 'Tidak',
            ],
            'update' => [
                'title' => 'Ubah data?',
                'message' => 'Perubahan yang Anda buat akan menggantikan data sebelumnya.',
                'yes' => 'Ya, ubah',
                'no' => 'Tidak',
            ],
            'logout' => [
                'title' => 'Keluar dari akun?',
                'message' => 'Anda harus masuk kembali untuk mengakses halaman ini.',
                'yes' => 'Ya, keluar',
                'no' => 'Batal',
            ],
        ];

        return array_replace(
            $defaults[$type] ?? [],
            array_filter($overrides, fn ($value) => $value !== null && $value !== '')
        );
    }
}
