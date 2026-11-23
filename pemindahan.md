# PRD & Strategi Migrasi — Senpai HRIS → Hamana Web System

| Atribut | Nilai |
|---|---|
| Dokumen | Rencana pemindahan logika bisnis, skema database, dan integrasi |
| Sumber | `D:\hamana_app\senpai.hamanaworksindo.com\public_html\senpai` |
| Tujuan | `D:\hamana-web-system` (Laravel 12 + Livewire 3) |
| Status | Draft untuk direview |
| Tanggal | 23 November 2026 |
| Sifat | Audit + strategi. Belum ada perubahan kode. |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang](#2-latar-belakang)
3. [Tujuan & Metrik Keberhasilan](#3-tujuan--metrik-keberhasilan)
4. [Ruang Lingkup](#4-ruang-lingkup)
5. [Audit Sistem Sumber (As-Is)](#5-audit-sistem-sumber-as-is)
6. [Audit Sistem Tujuan (To-Be)](#6-audit-sistem-tujuan-to-be)
7. [Keputusan Arsitektur (ADR Ringkas)](#7-keputusan-arsitektur-adr-ringkas)
8. [Pemetaan Modul Sumber → Target](#8-pemetaan-modul-sumber--target)
9. [Rancangan Database Target](#9-rancangan-database-target)
10. [Autentikasi & Otorisasi](#10-autentikasi--otorisasi)
11. [Strategi Integrasi](#11-strategi-integrasi)
12. [File & Media](#12-file--media)
13. [Spesifikasi Modul (Ringkas)](#13-spesifikasi-modul-ringkas)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Roadmap & Milestone](#15-roadmap--milestone)
16. [Rencana Pengujian & Acceptance](#16-rencana-pengujian--acceptance)
17. [Risiko & Mitigasi](#17-risiko--mitigasi)
18. [Pertanyaan Terbuka / Keputusan yang Dibutuhkan](#18-pertanyaan-terbuka--keputusan-yang-dibutuhkan)
19. [Langkah Berikutnya (2 Minggu Pertama)](#19-langkah-berikutnya-2-minggu-pertama)
- [Lampiran A — Peta Route Sumber](#lampiran-a--peta-route-sumber-ringkas)
- [Lampiran B — Pemetaan Kelas Sumber → Target](#lampiran-b--pemetaan-kelas-sumber--target)
- [Lampiran C — Checklist UI](#lampiran-c--checklist-ui-data-lokalmock--backend)
- [Lampiran D — Definition of Done](#lampiran-d--definition-of-done-per-modul)
- [Lampiran E — Catatan Audit Tambahan](#lampiran-e--catatan-audit-tambahan)

---

## 1. Ringkasan Eksekutif

Aplikasi Senpai yang berjalan sekarang adalah aplikasi HRIS yang **fungsional tetapi menumpuk**:
satu aplikasi Laravel dengan empat koneksi database, autentikasi manual berbasis session,
password SHA1, ratusan query tersebar di controller, dan beberapa integrasi yang sudah tidak
lengkap. Aplikasi tujuan (`hamana-web-system`) sudah memiliki **kerangka UI, navigasi, dan
otorisasi halaman yang jauh lebih rapi**, tetapi hampir seluruh halamannya masih **statis**
(mock data di JavaScript / `localStorage`) dan belum punya backend.

Karena itu pekerjaan ini **bukan sekadar copy-paste controller**. Yang harus dipindahkan adalah:

1. **Aturan bisnis** (cuti, permohonan berjenjang, absensi, rekap, payroll slip, rekrutmen).
2. **Data** (pegawai, keluarga, pendidikan, fisik, dokumen, absensi, cuti, permohonan, dsb).
3. **Integrasi** (API rekap absensi, database payroll, WhatsApp, web push, Google Drive).
4. **Perbaikan keamanan** yang selama ini menjadi utang teknis (SHA1, CSRF, otorisasi per aksi).

**Rekomendasi utama:**

- Gunakan **satu tabel `users`** untuk login, dengan relasi ke `employees`.
- Gunakan **skema baru yang ternormalisasi** untuk domain inti, dan simpan dump lama sebagai
  **staging `legacy_*`** untuk ETL. Jangan mempertahankan nama `t_*` di kode baru.
- Pertahankan **kunci bisnis `refid` dan `nik`** karena dipakai lintas sistem (payroll, API absensi).
- Bangun **lapisan service** (`app/Services/...`) sebagai tempat aturan bisnis; controller/Livewire
  hanya memvalidasi input dan memanggil service.
- Untuk UI yang sudah jadi: gunakan pola **Blade + payload awal + endpoint JSON** (JS hanya
  render & kirim aksi), bukan menulis ulang seluruh UI menjadi Livewire.
- Payroll **dibaca dari database payroll yang ada** pada fase pertama (read-only), lalu
  dipertimbangkan migrasi penuh setelah inventarisasi DB payroll.

**Estimasi kasar:** 8 fase (F0–F7), ± 16–19 minggu untuk 1–2 developer, dengan cutover bertahap.

---

## 2. Latar Belakang

Senpai HRIS melayani kebutuhan:

- Data pegawai dan profil (pribadi, keluarga, pendidikan, fisik, file/dokumen).
- Absensi: rekap bulanan dari API, hitung berangkat, absen by foto + geofencing.
- Cuti dan sakit: jatah cuti, input cuti, pengajuan cuti.
- Permohonan: cuti/sakit, keluar kantor, dinas dalam kota, dinas luar kota (SPT), form absensi.
- Rekrutmen: pelamar baru, pelamar diterima, talent pool, kirim pesan WA.
- Konten: Buku Hamana, saran, tanda tangan digital.
- Payroll: slip gaji (PIN), laporan/transaksi payroll.
- Pengaturan: bahasa, hak akses, absensi by foto, daftar hitam presensi, ubah password.

Aplikasi tujuan sudah punya **semua menu tersebut** di `config/modules.php`, tetapi belum ada
logika maupun data di belakangnya. Migrasi harus memastikan **paritas fungsi** tanpa membawa
masalah arsitektur lama.

---

## 3. Tujuan & Metrik Keberhasilan

### 3.1 Tujuan

1. Semua modul yang ada di `config/modules.php` berfungsi dengan data nyata.
2. Tidak ada kehilangan data: jumlah baris dan nilai kunci terekonsiliasi 100% untuk tabel inti.
3. Pengguna lama dapat login (dengan migrasi password transparan) dan melihat data yang sama.
4. Integrasi berjalan dengan penanganan gagal yang eksplisit (retry, log, status).
5. Tidak ada regresi keamanan: tidak ada SHA1, semua form CSRF-protected, otorisasi per aksi.

### 3.2 Metrik

| Metrik | Target |
|---|---|
| Paritas modul HRIS | 33/33 halaman berfungsi |
| Paritas modul Payroll | 19/19 halaman berfungsi atau ditandai out-of-scope resmi |
| Rekonsiliasi data inti | 100% baris, 0 selisih pada `refid`/`nik` |
| Waktu muat halaman absensi (1 bulan, ± 300 pegawai) | < 2 detik (data tersinkron) |
| Login lama | ≥ 99% berhasil tanpa reset password |
| Error 5xx pasca-rilis | < 0,5% request |
| Kebocoran akses antar-pegawai | 0 (diuji dengan role & IDOR test) |

---

## 4. Ruang Lingkup

### 4.1 Termasuk

- Audit sistem sumber dan sistem tujuan.
- Pemetaan modul, route, controller, service, helper, dan tabel.
- Rancangan skema database target + strategi ETL.
- Strategi autentikasi, otorisasi, dan migrasi password.
- Strategi integrasi eksternal dan penyimpanan file.
- Rencana fase, kriteria penerimaan, risiko, dan pertanyaan terbuka.

### 4.2 Tidak Termasuk (pada dokumen ini)

- Penulisan kode implementasi.
- Perubahan UI/desain halaman.
- Migrasi data produksi secara langsung (hanya prosedurnya).
- Audit keamanan formal / penetration test.
- Keputusan bisnis baru (mis. definisi "talent pool").

---

## 5. Audit Sistem Sumber (As-Is)

### 5.1 Stack & Struktur

| Aspek | Kondisi |
|---|---|
| Framework | Laravel `12.70.1`, PHP `^8.2` |
| Frontend | Blade + jQuery/Bootstrap template lama, Laravel Mix |
| Arsitektur | Controller gemuk, query `DB::table()` langsung, sebagian model Eloquent |
| Autentikasi | Session manual (`Session::put('username', ...)`), bukan guard Laravel |
| Password | `sha1($password)` tanpa salt |
| Otorisasi | Dicek manual per method (`if (!Session::get('username'))`), helper `Akses` |
| Routing | `routes/web.php` manual, 204 definisi route |
| Database | 4 koneksi MySQL |
| Background | 2 command artisan + scheduler |
| Dokumentasi | `docs/*.md` (permohonan, cuti, absensi foto, buku hamana, lampiran, hari libur) |

### 5.2 Koneksi Database

| Koneksi | Database | Isi |
|---|---|---|
| `mysql` (default) | `hamana_senpai_online` | Pegawai, absensi, cuti, permohonan, buku, saran, dokumen, tanda tangan |
| `mysqlweb` | `admin_hamanaweb` | Rekrutmen: `t_pegawai` (pelamar), `tb_lowker`, anak/kursus/bahasa/relasi/organisasi/psikotes/pekerjaan/upload |
| `payroll` | `admin_payrolldb` | `m_pegawai`, `t_gaji`, `m_harilibur` (hari libur nasional) |
| `absensi` | `admin_absensi` | `data_absent`, `outbox` (sinkronisasi/WA) — konfigurasi via `ABSENSI_DB_*` |
| `mysqlwa` (dikomentari) | — | Outbox WA lama, tidak aktif |

> **Temuan penting:** nama tabel `t_pegawai` dipakai di **dua database berbeda** dengan arti
> berbeda: pegawai aktif di `hamana_senpai_online`, pelamar di `admin_hamanaweb`. Ini sumber
> kebingungan dan harus dipisahkan tegas di skema baru (`employees` vs `applicants`).

### 5.3 Inventaris Tabel Sumber

**Dump `hamanwor_senpai_clean.sql` (18 tabel) — schema-only, tanpa `INSERT`:**

`t_admin`, `t_dokumen_log`, `t_golongan`, `t_golongan_tingkat`, `t_jabatan`, `t_pegawai`,
`t_pegawai_file`, `t_pegawai_fisik`, `t_pegawai_keluarga`, `t_pegawai_pendidikan`,
`t_pendidikan`, `t_pesan_wa`, `t_prop`, `t_tandatangan`, `wa_kirim`, `wa_outbox`,
`wa_setting`, `wa_token`.

**Dibuat lewat migration:**

`users`, `t_absensi_foto`, `t_absensi_hariini`, `t_absensi_override`, `t_absensi_rekap`,
`t_absensi_roster`, `t_blacklist_presensi`, `t_buku_hamana`, `t_cuti`, `t_cuti_jatah`,
`t_cuti_setting`, `t_data_karyawan`, `t_faskes`, `t_grup_laporan`, `t_pegawai_dokumen`,
`t_permohonan`, `t_permohonan_absensi`, `t_permohonan_cuti`, `t_permohonan_dinas`,
`t_permohonan_dinas_detail`, `t_permohonan_dinas_luar_kota`, `t_permohonan_keluar_kantor`,
`t_permohonan_lampiran`, `t_permohonan_ttd`, `t_roster_karyawan`, `t_saran`,
`data_absent`, `sync_history`, `notifications`, `push_subscriptions`, `jobs`,
`failed_jobs`, `personal_access_tokens`, `password_resets`.

**Dipakai kode tetapi tidak ada di dump/migration utama:**

`t_log_login`, `t_pegawai_anak`, `t_pegawai_bahasa`, `t_pegawai_course`,
`t_pegawai_organisasi`, `t_pegawai_pekerjaan`, `t_pegawai_psikotes`,
`t_pegawai_relasi_in`, `t_pegawai_relasi_out`, `t_pegawai_upload`, `tb_lowker`
(sebagian di `admin_hamanaweb`).

> Tabel-tabel ini **wajib diinventarisasi langsung dari database produksi** sebelum ETL,
> karena tidak tercakup dump. Lihat §18 Pertanyaan Terbuka.

> **Catatan penting:** dump yang tersedia **hanya berisi struktur** (0 pernyataan `INSERT`),
> sehingga tidak bisa dipakai untuk memindahkan data. ETL harus memakai **export data dari
> database produksi** (mis. `mysqldump --no-create-info` atau CSV per tabel).

### 5.4 Kolom Penting `t_pegawai`

Selain kolom dasar (identitas, alamat, kontak darurat, NPWP, BPJS, rekening, status nikah,
tanggal masuk), ada kolom yang ditambahkan belakangan dan **sering luput**:

- `departemen`, `jabatan`, `posisi`
- `akses_admin` (flag admin/HRD)
- `absen_foto_aktif`
- `blacklist_presensi`
- `faskes_kode`
- `session_id` (hash sesi login lama)

`status` bertipe enum `'1'` (aktif/pelamar baru) dan `'2'` (diterima/pelamar diterima),
sehingga **satu kolom mencampur dua domain** (pegawai vs rekrutmen).

### 5.5 Autentikasi & Sesi

- Login admin: `t_admin.username` + `sha1(password)`.
- Login pegawai: `t_pegawai.email` + `sha1(password)`.
- Tidak ada guard Laravel; semua controller memeriksa `Session::get('username')` sendiri.
- "Remember me" memakai cookie terenkripsi `senpai_remember` yang berisi level, id, refid,
  username, **hash password**, dan waktu kedaluwarsa (default 30 hari); dipulihkan oleh
  middleware `RestoreRememberedLogin`.
- `t_log_login` dipakai untuk membuat `loginkey` saat login pegawai (bukan untuk remember me).
- `t_pegawai.session_id` menyimpan hash session.
- Logout hanya `Session::flush()`.

### 5.6 Integrasi Eksternal

| Integrasi | Mekanisme | Kondisi |
|---|---|---|
| Rekap absensi | `GET {REKAP_API_URL}` + header `X-API-Key`, sinkron ke `t_absensi_rekap`/`t_absensi_roster` | Berjalan; URL tunnel Cloudflare (tidak stabil) |
| Payroll slip | Baca `payroll.m_pegawai`/`t_gaji`, verifikasi PIN `DDMM`, tautan bertanda tangan `PAYROLL_SLIP_SECRET` | Berjalan; secret punya fallback hardcoded di config |
| Hari libur | Baca `payroll.m_harilibur` | Berjalan |
| WhatsApp | `wa_setting`, `wa_token`, `wa_outbox`, `wa_kirim`; HTTP ke `WA_SERVER` | **Rusak**: `App\Helper\ApiToken` dan `App\Helper\Formatnohp` tidak ada |
| Web push | `push_subscriptions`, VAPID | Berjalan |
| Google Drive | `GOOGLE_DRIVE_*` tersedia di `.env` | **Tidak ditemukan pemakaian di kode**; backup perlu dibangun/diverifikasi |
| Email | SMTP (`mailhog` di dev) | Tidak kritis |

### 5.7 File & Storage Sumber

| Lokasi | Isi | Ukuran |
|---|---|---|
| `<docroot>/pegawaifile` | Foto & file pegawai (32 file) | kecil |
| `storage/app/absensi-foto` | Selfie absensi | 0,1 MB |
| `storage/app/permohonan_lampiran` | Lampiran permohonan | 0,8 MB |
| `storage/app/surat_dokter` | Surat dokter | 1 MB |
| `storage/app/documents` | Dokumen | kecil |
| `storage/app/bukuhamana` | PDF Buku Hamana | 0,3 MB |
| `storage/app/public` | File publik | kecil |
| `public/assets` | Aset template lama | ± 5 MB |

Catatan: beberapa file disimpan **di luar `public/`** lalu diakses lewat route controller
(foto pegawai, surat dokter, lampiran). Ini harus dipertahankan sebagai **protected download**,
bukan `public/storage` langsung.

### 5.8 Background Job & Scheduler

| Command | Jadwal | Fungsi |
|---|---|---|
| `absensi:foto-bersihkan` | harian 02:00 | Hapus file selfie melewati retensi (`ABSEN_FOTO_RETENSI_HARI`, default 90 hari) |
| `bukuhamana:pindahkan` | manual/terjadwal | Pindahkan PDF Buku Hamana |

Tidak ada worker queue yang terdokumentasi. `QUEUE_CONNECTION=database`, tetapi notifikasi dan
sinkron absensi dikirim **langsung di request**, bukan lewat queue.

### 5.9 Temuan Teknis & Keamanan

| # | Temuan | Dampak | Severity | Tindakan di target |
|---|---|---|---|---|
| S1 | Password SHA1 tanpa salt | Mudah di-crack; tidak kompatibel dengan `hashed` cast | Kritis | Migrasi transparan + rehash bcrypt/argon2 |
| S2 | 58 tag `<form>`, hanya 10 `@csrf` | CSRF | Kritis | Semua aksi lewat POST + CSRF Laravel |
| S3 | Otorisasi manual & tidak konsisten | IDOR / akses lintas pegawai | Kritis | Policy + `authorize()` per aksi, scope query |
| S4 | `PAYROLL_SLIP_SECRET` fallback hardcoded di config **dan** `PayrollSlip` | Tautan slip bisa dipalsukan bila env kosong | Tinggi | Wajib env, fail-fast saat boot |
| S5 | Helper WA hilang (`ApiToken`, `Formatnohp`) dan `WA_SERVER` tidak ada di `.env` | Fitur WA tidak berfungsi | Tinggi | Tulis ulang gateway + test |
| S6 | URL API absensi memakai tunnel sementara | Sinkron bisa mati sewaktu-waktu | Tinggi | Konfigurasi domain tetap + retry + status |
| S7 | Query `DB::table` + `whereRaw` tersebar | Sulit diuji, rawan bug | Sedang | Service + repository/scope |
| S8 | `status` enum mencampur pegawai & pelamar | Salah klasifikasi data | Sedang | Pisahkan `employees` vs `applicants` |
| S9 | Tabel dipakai kode tapi tak ada di dump | Data hilang saat migrasi | Tinggi | Inventaris DB produksi |
| S10 | Sinkron absensi di request | Timeout & data tidak konsisten | Sedang | Queue job + `sync_runs` |
| S11 | Logika bisnis duplikat di view/JS | Perilaku tidak konsisten | Sedang | Satu sumber aturan di service |
| S12 | Tidak ada audit trail perubahan data | Sulit investigasi | Sedang | `activity_log` + `document_logs` |
| S13 | Cookie "ingat saya" menyimpan hash password | Hash terekspos bila `APP_KEY` bocor | Tinggi | Gunakan `remember_token` bawaan Laravel |
| S14 | `GOOGLE_DRIVE_*` ada di `.env` tetapi tidak dipakai kode | Backup dianggap ada padahal tidak | Tinggi | Bangun job backup + uji restore |

---

## 6. Audit Sistem Tujuan (To-Be)

### 6.1 Stack & Struktur

| Aspek | Kondisi |
|---|---|
| Framework | Laravel `12.70.*`, PHP `^8.2` |
| UI | Livewire `3.8.11`, Vite 6, Tailwind 4 |
| Auth | Guard Laravel, tabel `users`, `password` cast `hashed` |
| Otorisasi | `role` (`admin`/`karyawan`) + `permissions` JSON berisi slug modul |
| Routing | `/modul/{module}` → `ModulePage`, `/pengaturan/{panel}` → `Pengaturan` |
| Modul | Registry di `config/modules.php`, helper `App\Support\Modules` |
| Middleware | `module.access` (`EnsureModuleAccess`) |
| Database | MySQL `hamana-web-system-db`, session/queue/cache di database |
| Halaman | 33 HRIS + 19 Payroll + 5 Setting |
| Kondisi backend | **Belum ada** model/migration domain, hanya `users` |

### 6.2 Mekanisme Halaman

- `ModulePage` memetakan slug → view `hris.{slug}.index` (atau `view` khusus).
- `Pengaturan` menangani 5 panel setting dalam satu komponen.
- Setiap halaman adalah Blade statis dengan skrip di `resources/js/hris/**/script.js`.
- Tidak ada endpoint domain, tidak ada model domain.

### 6.3 Gap Utama

| Gap | Detail |
|---|---|
| G1 | Tidak ada skema domain (pegawai, absensi, cuti, permohonan, dsb.) |
| G2 | Tidak ada backend untuk 33 halaman HRIS |
| G3 | 19 halaman Payroll **belum punya view sama sekali** |
| G4 | 13 skrip HRIS memakai `localStorage` sebagai "database" |
| G5 | Halaman absensi memakai data contoh yang di-hardcode |
| G6 | Login hanya menerima email; sumber menerima username (admin) & email (pegawai) |
| G7 | Permission hanya per halaman, belum per aksi (approve, kelola admin, dsb.) |
| G8 | Belum ada integrasi apa pun |

### 6.4 Skrip yang Masih Memakai Data Lokal/Mock

**Menyimpan data di `localStorage` (harus diganti backend):**

`profil-data-pribadi`, `profil-ciri-fisik`, `profil-anggota-keluarga`,
`profil-riwayat-pendidikan`, `profil-kelola-file`, `tanda-tangan`,
`data-admin-data-tingkat`, `data-admin-data-jabatan`, `data-admin-data-faskes-bpjs`,
`data-pegawai`, `data-admin-list-admin`, `list-satpam`.

**Memakai data contoh di dalam skrip (bukan `localStorage`):**

`absensi` (data absensi mock; `localStorage` hanya untuk tab aktif), `permohonan-saya`,
`permohonan-masuk` (array mock). Semua harus diganti data server.

**Catatan:** `localStorage` untuk preferensi UI (mis. tab terakhir, filter) masih boleh
dipertahankan; yang dilarang adalah menjadikannya **sumber kebenaran data bisnis**.

---

## 7. Keputusan Arsitektur (ADR Ringkas)

| ID | Keputusan | Alasan | Konsekuensi |
|---|---|---|---|
| ADR-01 | Satu `users` + relasi `employees` | Login & otorisasi konsisten | Perlu ETL akun dari 2 tabel |
| ADR-02 | Skema baru ternormalisasi + staging `legacy_*` | Kualitas jangka panjang, ETL aman | Perlu mapping & uji rekonsiliasi |
| ADR-03 | Modular monolith: Livewire + Service layer | Sesuai stack target, aturan terpusat | Refactor controller lama |
| ADR-04 | Payroll read-only dulu | DB payroll milik sistem lain | Butuh koneksi & inventaris |
| ADR-05 | Storage abstraction (disk privat + signed URL) | Data PII | Ganti akses file langsung |
| ADR-06 | Integrasi lewat queue + `sync_runs` | Tidak memblok request | Butuh worker |
| ADR-07 | Pertahankan `refid` & `nik` sebagai kunci bisnis | Kompatibilitas payroll/API | Wajib unik & tervalidasi |
| ADR-08 | Pola UI: Blade + payload awal + endpoint JSON | UI sudah jadi, risiko rendah | Perlu kontrak API konsisten |

**Pola UI yang disepakati (ADR-08):**

```text
Blade (markup existing)
  ├─ @json($initial)  → window.__PAGE_DATA__
  ├─ fetch('/api/v1/...') untuk aksi & refresh
  └─ JS hanya: render, validasi ringan, kirim aksi, tampilkan toast
```

Semua aturan bisnis, perhitungan jatah cuti, geofencing, dan status approval **di server**.

**Amplop respons standar:**

```json
{ "ok": true, "data": {}, "meta": { "page": 1, "per_page": 25, "total": 120 } }
{ "ok": false, "message": "Pesan untuk pengguna", "errors": { "field": ["..."] } }
```

**Konvensi endpoint (contoh, semua di bawah `auth` + `module.access`):**

| Domain | Endpoint | Kegunaan |
|---|---|---|
| Profil | `GET/PUT /api/v1/profile` | Data pribadi |
| Profil | `GET/POST/PUT/DELETE /api/v1/profile/educations` | Riwayat pendidikan |
| Profil | `POST /api/v1/profile/photo` | Unggah foto |
| Pegawai | `GET /api/v1/employees` | List + filter + pagination |
| Pegawai | `POST /api/v1/employees/import` | Import Excel |
| Absensi | `GET /api/v1/attendance?month=YYYY-MM` | Hitung berangkat |
| Absensi | `POST /api/v1/attendance/sync` | Sinkron ulang |
| Absensi | `POST /api/v1/attendance/overrides` | Override harian |
| Permohonan | `GET /api/v1/requests?scope=mine\|inbox` | List |
| Permohonan | `POST /api/v1/requests` | Simpan draft |
| Permohonan | `POST /api/v1/requests/{id}/submit` | Kirim |
| Permohonan | `POST /api/v1/requests/{id}/approve` | Setujui |
| Permohonan | `POST /api/v1/requests/{id}/reject` | Tolak |
| Cuti | `GET/POST /api/v1/leave/allocations` | Jatah cuti |
| Master | `GET/POST/PUT/DELETE /api/v1/master/{resource}` | Master data |
| Notifikasi | `GET /api/v1/notifications`, `POST /api/v1/notifications/read` | In-app |

Aturan: semua endpoint mengembalikan amplop di atas; error validasi `422`; otorisasi `403`;
data tidak ditemukan `404`.

---

## 8. Pemetaan Modul Sumber → Target

Prioritas: **P0** = wajib saat cutover, **P1** = cutover atau segera setelahnya,
**P2** = fase lanjutan, **P3** = perlu keputusan bisnis.

### 8.1 HRIS

| Target (`slug`) | Sumber (route/controller) | Data utama | Kondisi UI target | Prio | Catatan migrasi |
|---|---|---|---|---|---|
| `dashboard` | `DashboardController@index` | agregat `t_pegawai`, permohonan, absensi | Livewire statis | P0 | Widget berbeda untuk admin vs pegawai |
| `profil-data-pribadi` | `MemberController@index`, `update` | `t_pegawai`, `t_prop` | form + `localStorage` | P0 | Validasi & upload foto |
| `profil-riwayat-pendidikan` | `MemberController@pendidikanedit`, `pendidikanupdate` | `t_pegawai_pendidikan`, `t_pendidikan` | `localStorage` | P1 | CRUD baris |
| `profil-anggota-keluarga` | `MemberController@keluargaedit`, `keluargaupdate` | `t_pegawai_keluarga` | `localStorage` | P1 | Enum status keluarga |
| `profil-ciri-fisik` | `MemberController@fisikedit`, `fisikupdate` | `t_pegawai_fisik` | `localStorage` | P1 | Satu baris per pegawai |
| `profil-kelola-file` | `DokumenPegawaiController@form/unggah/hapus`, `MemberController@filepegawaistore` | `t_pegawai_file`, `t_pegawai_dokumen`, `pegawaifile/` | `localStorage` | P1 | File privat + tipe dokumen |
| `permohonan-masuk` | `PermohonanController@masuk` | `t_permohonan*`, `t_permohonan_ttd` | array mock | P0 | Filter approver & status |
| `permohonan-saya` | `@saya` | idem | array mock | P0 | Draft/kirim/batal |
| `izin-cuti-atau-sakit` | `@izincuti`, `POST /cuti` | `t_permohonan_cuti`, `t_cuti_jatah`, `t_cuti_setting` | form statis | P0 | Hitung hari & potong jatah |
| `izin-keluar-kantor` | `@izinkeluarkantor`, `POST /keluarkantor` | `t_permohonan_keluar_kantor` | form statis | P0 | — |
| `izin-dinas-dalam-kota` | `@izindinas`, `POST /izindinas` | `t_permohonan_dinas`, `_detail` | form statis | P1 | Multi baris itinerary |
| `izin-dinas-luar-kota` | `@izindinasluarkota`, `POST /izindinasluarkota` | `t_permohonan_dinas_luar_kota` | form statis | P1 | SPT, 2 blok transport |
| `form-absensi` | `@formabsensi`, `POST /formabsensi` | `t_permohonan_absensi` | form statis | P1 | Alasan & lampiran |
| `data-pegawai` | `PegawaiController`, `MemberController@cetak` | `t_pegawai` + relasi | `localStorage` | P0 | CRUD, import/export, cetak berkas |
| `rekrutmen-pelamar-baru` | `KarirController@index` | `mysqlweb.t_pegawai` status `1`, `tb_lowker` | statis | P2 | Domain `applicants` terpisah |
| `rekrutmen-pelamar-diterima` | `@terima` | status `2` | statis | P2 | — |
| `rekrutmen-talent-pool` | tidak ada padanan eksplisit | kandidat ditolak/alternatif | statis | P3 | **Perlu definisi bisnis** |
| `rekrutmen-kirim-pesan` | `KarirController@wa`, `WakirimController` | `wa_*`, `t_pesan_wa` | statis | P3 | Gateway WA harus ditulis ulang |
| `absensi` | `AbsensiController@hitungberangkat/hariini/rekap`, `RekapAbsensiService` | `t_absensi_rekap/roster/override`, API, `m_harilibur` | mock JS | P0 | Tab Hari Ini/Rekap/Tabel/Grafik |
| `input-cuti-dan-sakit` | `InputCutiController` | `t_cuti`, `t_cuti_jatah`, `t_cuti_setting` | statis | P1 | Import Excel & aturan |
| `input-buku-hamana` | `BukuHamanaController` store/update/delete | `t_buku_hamana` | statis | P2 | Upload PDF ≤ 20 MB |
| `slip-gaji` | `MemberController@payroll`, `PayrollSlip` | `payroll.m_pegawai`, `t_gaji` | statis | P1 | PIN + signed URL |
| `buku-hamana` | `BukuHamanaController`, `AturanHamanaController` | `t_buku_hamana` | statis | P2 | Baca/stream/unduh |
| `saran` | `SaranController@index/simpan` | `t_saran` | statis | P2 | — |
| `saran-masuk` | `@masuk` | `t_saran` | statis | P2 | Hanya admin/HR |
| `dokumen-pegawai` | `DokumenPegawaiController` | `t_pegawai_dokumen` | statis | P1 | Kelola semua dokumen |
| `data-admin-list-admin` | `PenggunaController` | `t_admin` | `localStorage` | P1 | Menjadi `users` |
| `data-admin-tingkat` | `TingkatController` | `t_golongan_tingkat` | `localStorage` | P2 | Master |
| `data-admin-jabatan` | `JabatanController` | `t_jabatan` | `localStorage` | P2 | Master |
| `data-admin-faskes-bpjs` | `FaskesController` | `t_faskes` | `localStorage` | P2 | Import/export + picker |
| `list-satpam` | `RekapAbsensiService::isSatpam`, `t_roster_karyawan` | roster/satpam | `localStorage` | P3 | **Perlu definisi sumber** |
| `tanda-tangan` | `TandatanganController` | `t_tandatangan`, `t_permohonan_ttd` | `localStorage` | P2 | Signature base64 |
| `page-satpam` | route/absensi satpam (perlu konfirmasi) | absensi | statis | P3 | **Perlu konfirmasi fungsi** |

### 8.2 Setting (`Pengaturan`)

| Panel | Sumber | Data | Prio |
|---|---|---|---|
| `bahasa` | `SettingController@bahasa/saveBahasa` | file bahasa + setting | P2 |
| `hak-akses` | `HakAksesAdminController` | `t_pegawai.akses_admin` | P1 |
| `absensi-by-foto` | `AbsenFotoController` (`AksesAbsenFoto`) | `t_pegawai.absen_foto_aktif` | P1 |
| `daftar-hitam-presensi` | `InputBlacklistPresensiController` | `t_blacklist_presensi`, `t_absensi_roster` | P2 |
| `ubah-password` | `MemberController@passwordedit/passwordupdate` | `t_pegawai.password` | P0 |

### 8.3 Payroll

Target memiliki 19 halaman payroll tanpa view. Sumber tidak memiliki modul payroll penuh;
yang ada hanyalah **integrasi baca** ke `admin_payrolldb`.

| Kelompok target | Sumber data | Prio | Catatan |
|---|---|---|---|
| Master: pegawai, hari libur, BPJS TK/Kes, aturan potongan | `payroll.m_pegawai`, `m_harilibur` + tabel payroll lain | P1 | **Inventaris DB payroll diperlukan** |
| Transaksi: lembur, makan lembur, kehadiran, rapel, adjustment, tunjangan | tabel payroll | P2 | Perlu definisi skema |
| Generate payroll | proses payroll | P2 | Mungkin tetap di aplikasi payroll |
| Slip gaji | `t_gaji` | P1 | Integrasi & signed URL |
| Laporan: akhir, direksi, lembur, gaji, per karyawan, kenaikan | `t_gaji` + master | P2 | Laporan read-only |

> **Keputusan yang dibutuhkan:** apakah payroll tetap menjadi aplikasi terpisah (disarankan
> untuk fase 1) atau dimigrasikan penuh ke `hamana-web-system`. Lihat §18.

---

## 9. Rancangan Database Target

### 9.1 Prinsip

1. **Satu database utama** untuk HRIS; database payroll tetap eksternal (read-only) di fase 1.
2. Nama tabel **plural snake_case**; kolom **snake_case**.
3. Gunakan **foreign key** untuk relasi baru; `refid`/`nik` disimpan sebagai kunci bisnis unik.
4. Enumvia `string` + validasi aplikasi (lebih mudah berevolusi daripada `ENUM` MySQL).
5. Semua tabel transaksi punya `created_at`, `updated_at`; tabel penting punya `deleted_at`.
6. Data sensitif (selfie, surat dokter, dokumen) disimpan di disk privat.
7. Staging `legacy_*` hanya untuk ETL dan **tidak dipakai aplikasi**.

> **Alternatif yang dipertimbangkan:** mempertahankan nama tabel `t_*` agar query lama bisa
> diporting hampir apa adanya. Alternatif ini **ditolak** karena mempertahankan pencampuran
> domain (`t_pegawai` untuk pegawai & pelamar), enum kaku, dan query mentah. Namun bila waktu
> cutover sangat ketat, pendekatan hybrid (nama lama + tabel `users` baru) dapat dipakai
> sebagai fallback dengan konsekuensi utang teknis tetap ada.

### 9.2 Domain & Tabel Target

#### A. Identitas & Organisasi

| Tabel | Isi | Asal |
|---|---|---|
| `users` | Akun login, role, permissions | `t_admin`, `t_pegawai` |
| `employees` | Data pegawai utama | `t_pegawai`, `t_data_karyawan` |
| `employee_families` | Anggota keluarga | `t_pegawai_keluarga` |
| `employee_educations` | Riwayat pendidikan | `t_pegawai_pendidikan` |
| `employee_physicals` | Ciri fisik | `t_pegawai_fisik` |
| `employee_files` | Foto & file umum | `t_pegawai_file` |
| `employee_documents` | Dokumen resmi (KTP, NPWP, dsb.) | `t_pegawai_dokumen` |
| `departments` | Master departemen | `t_pegawai.departemen` (distinct) |
| `positions` | Master jabatan | `t_jabatan` |
| `levels` | Tingkat/golongan | `t_golongan_tingkat` |
| `grades` | Golongan | `t_golongan` |
| `provinces` | Provinsi | `t_prop` |
| `education_levels` | Jenjang pendidikan | `t_pendidikan` |
| `health_facilities` | Faskes BPJS | `t_faskes` |

#### B. Rekrutmen

| Tabel | Isi | Asal |
|---|---|---|
| `job_vacancies` | Lowongan | `tb_lowker` |
| `applicants` | Pelamar | `mysqlweb.t_pegawai` |
| `applicant_families` | Anak/keluarga pelamar | `t_pegawai_anak` |
| `applicant_courses` | Kursus | `t_pegawai_course` |
| `applicant_languages` | Bahasa | `t_pegawai_bahasa` |
| `applicant_organizations` | Organisasi | `t_pegawai_organisasi` |
| `applicant_employments` | Riwayat pekerjaan | `t_pegawai_pekerjaan` |
| `applicant_psychotests` | Psikotes | `t_pegawai_psikotes` |
| `applicant_relations` | Relasi masuk/keluar | `t_pegawai_relasi_in/out` |
| `applicant_uploads` | Berkas pelamar | `t_pegawai_upload` |

#### C. Absensi

| Tabel | Isi | Asal |
|---|---|---|
| `attendance_records` | Rekap harian per pegawai | `t_absensi_rekap` |
| `attendance_today` | Snapshot hari ini (opsional/cache) | `t_absensi_hariini` |
| `attendance_rosters` | Roster per bulan | `t_absensi_roster` |
| `attendance_overrides` | Koreksi manual | `t_absensi_override` |
| `attendance_photos` | Selfie + GPS | `t_absensi_foto` |
| `attendance_blacklist` | Daftar hitam presensi | `t_blacklist_presensi` |
| `attendance_sync_runs` | Riwayat sinkron API | `sync_history` |
| `holidays` | Hari libur | `payroll.m_harilibur` (cache/salinan) |
| `attendance_settings` | Pengaturan foto/geofence | config + `t_pegawai` |

#### D. Cuti & Permohonan

| Tabel | Isi | Asal |
|---|---|---|
| `leave_allocations` | Jatah cuti | `t_cuti_jatah` |
| `leave_settings` | Aturan cuti | `t_cuti_setting` |
| `leave_records` | Input cuti/sakit manual | `t_cuti` |
| `requests` | Header semua permohonan | `t_permohonan` |
| `request_leave` | Detail cuti/sakit | `t_permohonan_cuti` |
| `request_office_exits` | Detail keluar kantor | `t_permohonan_keluar_kantor` |
| `request_local_trips` | Detail dinas dalam kota | `t_permohonan_dinas` |
| `request_local_trip_items` | Itinerary dinas dalam kota | `t_permohonan_dinas_detail` |
| `request_out_of_town_trips` | Detail SPT | `t_permohonan_dinas_luar_kota` |
| `request_attendance` | Form pengajuan absensi | `t_permohonan_absensi` |
| `request_attachments` | Lampiran | `t_permohonan_lampiran` |
| `request_signatures` | Tanda tangan berjenjang | `t_permohonan_ttd` |

#### E. Konten, Komunikasi, Log

| Tabel | Isi | Asal |
|---|---|---|
| `books` | Buku Hamana | `t_buku_hamana` |
| `suggestions` | Saran | `t_saran` |
| `signatures` | Tanda tangan pengguna | `t_tandatangan`, `t_pegawai_file` |
| `wa_settings` | Konfigurasi WA | `wa_setting` |
| `wa_tokens` | Token WA | `wa_token` |
| `wa_outbox` | Antrean pesan | `wa_outbox`, `wa_kirim`, `t_pesan_wa` |
| `push_subscriptions` | Web push | `push_subscriptions` |
| `notifications` | Notifikasi | `notifications` |
| `login_logs` | Riwayat login (baru) | baru |
| `login_tokens` | Token login lama (arsip, tidak dipakai) | `t_log_login` |
| `document_logs` | Log akses dokumen | `t_dokumen_log` |
| `activity_logs` | Audit perubahan | baru |
| `app_settings` | Pengaturan aplikasi/bahasa | setting sumber |

### 9.3 Mapping Tabel Legacy → Target

| Legacy | Target | Transformasi |
|---|---|---|
| `t_admin` | `users` (role `admin`) | Password SHA1 → rehash saat login; username → `username` |
| `t_pegawai` (default DB) | `employees` + `users` | Pisahkan akun; `status 1` → `active` |
| `t_pegawai` (`admin_hamanaweb`) | `applicants` | **Jangan digabung** dengan pegawai |
| `t_pegawai_file` | `employee_files` | Path `pegawaifile/{namafile}` |
| `t_pegawai_dokumen` | `employee_documents` | Metadata + path |
| `t_pegawai_fisik` | `employee_physicals` | 1:1 |
| `t_pegawai_keluarga` | `employee_families` | enum status_keluarga |
| `t_pegawai_pendidikan` | `employee_educations` | — |
| `t_pendidikan` | `education_levels` | — |
| `t_prop` | `provinces` | — |
| `t_jabatan` | `positions` | — |
| `t_golongan` | `grades` | — |
| `t_golongan_tingkat` | `levels` | — |
| `t_faskes` | `health_facilities` | Kolom bertitik/spasi dinormalisasi |
| `t_data_karyawan` | `employees`/`departments` | Sumber nama departemen & posisi |
| `t_roster_karyawan` | `attendance_rosters` | Roster absensi |
| `t_absensi_rekap` | `attendance_records` | — |
| `t_absensi_hariini` | `attendance_today` | Bisa dihapus/regenerate |
| `t_absensi_override` | `attendance_overrides` | — |
| `t_absensi_foto` | `attendance_photos` | File → disk privat |
| `t_blacklist_presensi` | `attendance_blacklist` | — |
| `sync_history` | `attendance_sync_runs` | — |
| `t_cuti` | `leave_records` | `jenis` string |
| `t_cuti_jatah` | `leave_allocations` | — |
| `t_cuti_setting` | `leave_settings` | 1 baris aktif (versioning) |
| `t_permohonan` | `requests` | Enum jenis diperluas |
| `t_permohonan_cuti` | `request_leave` | + kolom surat dokter |
| `t_permohonan_keluar_kantor` | `request_office_exits` | — |
| `t_permohonan_dinas` | `request_local_trips` | — |
| `t_permohonan_dinas_detail` | `request_local_trip_items` | — |
| `t_permohonan_dinas_luar_kota` | `request_out_of_town_trips` | 2 blok transport |
| `t_permohonan_absensi` | `request_attendance` | — |
| `t_permohonan_lampiran` | `request_attachments` | — |
| `t_permohonan_ttd` | `request_signatures` | Signature base64 |
| `t_buku_hamana` | `books` | PDF |
| `t_saran` | `suggestions` | — |
| `t_tandatangan` | `signatures` | — |
| `wa_setting` | `wa_settings` | — |
| `wa_token` | `wa_tokens` | — |
| `wa_outbox`, `wa_kirim`, `t_pesan_wa` | `wa_outbox` | Konsolidasi |
| `t_log_login` | `login_tokens` (arsip) | Token login lama; tidak dipakai aplikasi baru |
| `t_dokumen_log` | `document_logs` | — |
| `tmpt_lahir` | `birth_place` | Rename konsisten |
| `jenkel` | `gender` | L/P |
| `stat_nikah` | `marital_status` | — |
| `tgl_masuk` | `joined_at` | — |
| `akses_admin` | `users.role`/`permissions` | — |
| `absen_foto_aktif` | `employees.attendance_photo_enabled` | — |
| `blacklist_presensi` | `attendance_blacklist` | Pindah ke tabel sendiri |

### 9.4 Kunci Stabil & Strategi ID

| Kunci | Sumber | Aturan target |
|---|---|---|
| `employees.refid` | `t_pegawai.refid` | **Unik, tidak berubah**, dipakai payroll & API |
| `employees.nik` | `t_pegawai.nik` | Unik; normalisasi spasi/karakter |
| `users.email` | `t_pegawai.email`/`t_admin.email` | Unik; fallback `nik@hamana.local` bila kosong |
| `users.username` | `t_admin.username` | Unik, nullable untuk pegawai |
| `applicants.session_id` | `t_pegawai.session_id` | Simpan sebagai `legacy_session_id` untuk relasi anak |
| `request.refid` | `t_permohonan.refid` | Tetap |
| `attendance` | `nik` + `tanggal` | Unik gabungan |

**Aturan:** jangan pernah mengubah `refid`. Bila ada duplikasi di sumber, selesaikan lewat
tabel `legacy_id_map` sebelum import.

### 9.5 Pipeline ETL

```text
1. Snapshot     : schema dump + data export DB sumber (4 koneksi) + salinan file storage
2. Staging      : import dump apa adanya ke schema `legacy_*`
3. Profiling    : cek duplikat refid/nik/email, nilai enum tak dikenal, tanggal invalid
4. Mapping      : isi `legacy_id_map` (legacy_table, legacy_id, target_table, target_id)
5. Transform    : normalisasi (trim, uppercase NIK, format tanggal, decode enum)
6. Load         : import ke tabel target (idempotent, upsert by business key)
7. Reconcile    : bandingkan count & checksum kolom kunci
8. Verify       : uji login, uji halaman, uji relasi
9. Archive      : simpan staging + dump + laporan rekonsiliasi
```

Persyaratan:

- Setiap langkah **idempotent** (bisa diulang tanpa duplikasi).
- Ada `legacy_id_map` untuk melacak asal setiap baris.
- Ada laporan **reconciliation** per tabel: `source_count`, `loaded_count`, `skipped`, `errors`.
- Data yang gagal masuk **tidak dibuang**, masuk `etl_rejects` untuk ditinjau manual.

### 9.6 Urutan Migrasi (Dependency Order)

1. Master: `provinces`, `education_levels`, `levels`, `grades`, `positions`, `departments`,
   `health_facilities`.
2. `employees` (tanpa akun) → relasi anak (keluarga, pendidikan, fisik).
3. `users` (admin & pegawai) + permissions.
4. File & dokumen pegawai.
5. `holidays`, `attendance_rosters`, `attendance_records`.
6. `leave_settings`, `leave_allocations`, `leave_records`.
7. `requests` + seluruh detail & lampiran & tanda tangan.
8. `attendance_photos`, `attendance_overrides`, `attendance_blacklist`.
9. `books`, `suggestions`, `signatures`.
10. Rekrutmen: `job_vacancies`, `applicants`, tabel anak.
11. Komunikasi: `wa_*`, `notifications`, `push_subscriptions`.
12. Log: `login_logs`, `document_logs`.

### 9.7 Data yang Tidak Dimigrasi

- `t_absensi_hariini` (snapshot, bisa dibangun ulang).
- `jobs`, `failed_jobs`, `personal_access_tokens`, `password_resets` lama.
- `wa_outbox` yang sudah terkirim (arsipkan, jangan aktifkan ulang).
- `session_id` lama (hanya untuk pemetaan).

---

## 10. Autentikasi & Otorisasi

### 10.1 Skema `users`

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | bigint | — |
| `employee_id` | FK nullable | Null untuk admin murni |
| `username` | string nullable unique | Untuk admin lama |
| `nik` | string nullable unique | Untuk login alternatif |
| `name` | string | — |
| `email` | string unique | — |
| `password` | string | bcrypt/argon2 |
| `role` | string | `admin`, `hr`, `karyawan` |
| `permissions` | json nullable | Slug halaman |
| `is_active` | boolean | Ganti `status` |
| `last_login_at` | timestamp | — |
| `password_migrated_at` | timestamp nullable | Penanda SHA1→bcrypt |
| `remember_token`, `timestamps` | — | — |

### 10.2 Migrasi Password SHA1 (Transparan)

Rekomendasi: **login tetap berhasil tanpa reset massal**.

1. Import hash SHA1 apa adanya ke `users.password`, set `password_migrated_at = null`.
2. Saat login, jika `password_migrated_at` null:
   - Bandingkan `sha1($input)` dengan hash lama.
   - Jika cocok → `Hash::make($input)` → simpan → set `password_migrated_at`.
   - Jika tidak cocok → gagal.
3. Setelah semua pengguna aktif login (atau batas waktu, mis. 60 hari), paksa reset untuk
   akun yang belum termigrasi.

> Jangan memakai cast `hashed` untuk hash lama. Cast hanya untuk password baru.

### 10.3 Role & Permission

| Role | Akses |
|---|---|
| `admin` | Semua halaman + setting (hak akses, daftar hitam, absensi foto, admin) |
| `hr` | Semua HRIS + approval + dokumen + data pegawai; **tanpa** pengelolaan akun admin |
| `karyawan` | `User::DEFAULT_PERMISSIONS` |

Pemetaan dari sumber:

- `t_admin.status = 1` → `users` role `admin`.
- `t_pegawai.akses_admin = 1` atau `t_data_karyawan.now_position` ∈ {`HR Officer`, `HR Expatriate`} → role `hr`.
- `t_pegawai.status = 1` lainnya → role `karyawan`.
- `t_pegawai.status = 2` (pelamar) → **tidak** dibuatkan user.

Tambahan yang dibutuhkan: **permission per aksi** (bukan hanya halaman):

| Aksi | Permission |
|---|---|
| Approve/tolak permohonan | `request.approve` |
| Kelola semua pegawai | `employee.manage` |
| Kelola dokumen pegawai | `document.manage` |
| Kelola akun admin | `user.manage` |
| Lihat saran masuk | `suggestion.read` |
| Kelola master data | `master.manage` |
| Lihat slip semua pegawai | `payroll.read_all` |
| Setujui override absensi | `attendance.override` |

**Matriks akses modul (usulan):**

| Modul | karyawan | hr | admin |
|---|---|---|---|
| `dashboard` | ✓ | ✓ | ✓ |
| `profil-*` | ✓ (milik sendiri) | ✓ | ✓ |
| `permohonan-saya` | ✓ | ✓ | ✓ |
| `permohonan-masuk` | hanya bila approver | ✓ | ✓ |
| `izin-*`, `form-absensi` | ✓ | ✓ | ✓ |
| `data-pegawai`, `dokumen-pegawai` | — | ✓ | ✓ |
| `absensi`, `input-cuti-dan-sakit` | — | ✓ | ✓ |
| `rekrutmen-*`, `list-satpam` | — | ✓ | ✓ |
| `slip-gaji` | ✓ (milik sendiri) | ✓ | ✓ |
| `buku-hamana`, `saran`, `tanda-tangan` | ✓ | ✓ | ✓ |
| `saran-masuk` | — | ✓ | ✓ |
| `input-buku-hamana` | — | ✓ | ✓ |
| `data-admin-*` | — | — | ✓ |
| `page-satpam` | sesuai peran | ✓ | ✓ |
| Payroll (19 halaman) | — | lihat saja | ✓ |
| `bahasa`, `ubah-password` | ✓ | ✓ | ✓ |
| `hak-akses`, `absensi-by-foto`, `daftar-hitam-presensi` | — | — | ✓ |

> `permohonan-masuk` saat ini ada di `User::DEFAULT_PERMISSIONS`; sebaiknya tetap terlihat
> hanya jika pengguna benar-benar menjadi approver, agar sidebar tidak membingungkan.

### 10.4 Alur Login

- Satu form login menerima **email, username, atau NIK**.
- Cari user dengan `email`/`username`/`nik`, lalu verifikasi password.
- Rate limit: 5 percobaan/menit/IP + lock sementara.
- Regenerasi session setelah login.
- Catat `login_logs` (user, IP, user agent, hasil).
- Remember me memakai token Laravel (bukan `t_log_login`).

### 10.5 Otorisasi per Data

- Setiap query pegawai di-scope: karyawan hanya `employee_id` miliknya.
- Approver hanya melihat permohonan yang ditujukan kepadanya.
- Unduh file memakai **signed URL** + policy (bukan URL publik).
- Semua aksi tulis memakai `authorize()` / policy.

---

## 11. Strategi Integrasi

### 11.1 API Rekap Absensi

| Aspek | Rencana |
|---|---|
| Endpoint | `GET {REKAP_API_URL}` (bulanan) |
| Auth | Header `X-API-Key` |
| Waktu | Job queue `SyncAttendanceMonth` |
| Idempotensi | Upsert unik `(nik, tanggal)` |
| Status | `attendance_sync_runs` (start, finish, status, rows, duration, error) |
| Retry | 3x backoff; tombol "Sinkron ulang" untuk admin |
| Fallback | Tampilkan data terakhir + label "terakhir disinkron ..." |
| Timeout | 30 detik; TLS verify aktif (CA bundle opsional di dev) |

Sumber URL **wajib domain tetap**, bukan tunnel sementara. Bila masih tunnel, sediakan
mode manual upload file rekap sebagai fallback.

### 11.2 Payroll

| Aspek | Rencana |
|---|---|
| Koneksi | Read-only user ke `admin_payrolldb` |
| Slip | Query `t_gaji` berdasarkan `m_pegawai.refid` |
| PIN | `DDMM` tanggal lahir; 5 percobaan; lock 60 detik; sesi 30 menit |
| Tautan | Signed URL HMAC-SHA256 atas `id_gaji|refid|expires`, TTL 1 jam |
| Secret | **Wajib env**, tanpa fallback hardcoded (kini ada di config *dan* helper) |
| Keamanan | Jangan pernah menaruh secret di URL/log |
| Laporan | Read-only; cache hasil agregasi |

Bila DB payroll tidak dapat diakses dari server baru, sediakan **API** dari aplikasi payroll
sebagai ganti koneksi langsung.

### 11.3 WhatsApp

Tulis ulang sebagai `WhatsAppGateway` dengan kontrak:

```php
interface WhatsAppGateway {
    public function send(string $phone, string $message): SendResult;
}
```

- Implementasi awal: HTTP gateway yang benar (bukan helper hilang).
- Nomor dinormalisasi (`08xx` → `628xx`).
- Antrean `wa_outbox` + status (`pending`, `sent`, `failed`, `retry`).
- Template pesan di `app_settings`/config, bukan hardcoded di controller.
- Hormati opt-out dan jangan kirim data sensitif.

### 11.4 Web Push

- Pertahankan `push_subscriptions` (polymorphic) + VAPID.
- Kirim lewat queue.
- Notifikasi: permohonan baru, hasil approval, pengingat absensi.

### 11.5 Google Drive Backup

- **Status sumber:** variabel `GOOGLE_DRIVE_*` ada di `.env`, tetapi tidak ditemukan kode yang
  memakainya. Jangan menganggap backup sudah berjalan.
- Target: job terjadwal untuk backup database + file, unggah ke folder Drive, retensi &
  enkripsi, serta uji restore berkala.
- Token disimpan di env/secret manager, bukan di kode.

### 11.6 Hari Libur

- Fase 1: baca `payroll.m_harilibur` dengan cache 1 jam.
- Fase 2: salin ke `holidays` agar tidak bergantung pada DB payroll.

### 11.7 Ringkasan Penanganan Gagal

| Integrasi | Timeout | Retry | Fallback |
|---|---|---|---|
| Rekap absensi | 30 s | 3x | Data terakhir + status |
| Payroll DB | 5 s | 1x | Pesan "payroll tidak tersedia" |
| WhatsApp | 10 s | 3x | Simpan di outbox |
| Web push | 5 s | 2x | Simpan notifikasi in-app |
| Drive backup | 60 s | 1x | Alert admin |

---

## 12. File & Media

### 12.1 Pemetaan Folder

| Sumber | Target | Akses |
|---|---|---|
| `pegawaifile/` | `storage/app/private/employees/photos` | Signed URL + policy |
| `storage/app/documents` | `storage/app/private/employees/documents` | Signed URL |
| `storage/app/surat_dokter` | `storage/app/private/requests/medical` | Signed URL + approver |
| `storage/app/permohonan_lampiran` | `storage/app/private/requests/attachments` | Signed URL + approver |
| `storage/app/absensi-foto` | `storage/app/private/attendance/photos` | Signed URL + pemilik/HR |
| `storage/app/bukuhamana` | `storage/app/private/books` | Signed URL semua user |
| `storage/app/public` | `storage/app/public` (hanya aset non-PII) | Publik |

### 12.2 Aturan

- Nama file disimpan terpisah dari path; gunakan UUID untuk nama fisik.
- Validasi MIME **dan** ekstensi; batas ukuran per jenis:
  - foto pegawai 5 MB, selfie 2 MB, surat dokter 5 MB, dokumen pegawai 5 MB,
    lampiran 5 MB/berkas (maks 10 berkas), PDF Buku Hamana 20 MB.
- Retensi selfie: 90 hari (job harian).
- Hapus file saat data dihapus (soft delete + job pembersihan).
- Jangan menyajikan file PII lewat `public/storage`.

---

## 13. Spesifikasi Modul (Ringkas)

> Format: tujuan → data → aksi → aturan penting. Detail UI mengikuti view target yang sudah ada.

### 13.1 Dashboard

- **Tujuan:** ringkasan per role.
- **Data:** jumlah pegawai (total/L/P/BPJS), permohonan menunggu, absensi hari ini, cuti berjalan.
- **Aksi:** navigasi cepat; untuk karyawan: status absensi hari ini.
- **Aturan:** admin melihat agregat perusahaan; karyawan hanya data sendiri.

### 13.2 Profil (5 halaman + kelola file)

- **Data:** `employees`, `employee_families`, `employee_educations`, `employee_physicals`,
  `employee_files`.
- **Aksi:** lihat/ubah, tambah/hapus baris, unggah foto/dokumen.
- **Aturan:** pengguna hanya mengubah miliknya; NIK/refid read-only; validasi tanggal & enum;
  foto lama dihapus setelah foto baru tersimpan.

### 13.3 Data Pegawai

- **Data:** seluruh `employees` + relasi.
- **Aksi:** CRUD, import Excel, export, cetak berkas, reset password, aktif/nonaktif.
- **Aturan:** hanya `employee.manage`; `refid` tidak boleh diubah; NIK unik; email unik;
  soft delete; perubahan dicatat di `activity_logs`.

### 13.4 Rekrutmen

- **Data:** `job_vacancies`, `applicants` + anak.
- **Aksi:** daftar pelamar baru/diterima, detail, terima/tolak, kirim WA, ekspor PDF/Excel.
- **Aturan:** pisahkan dari `employees`; idempotensi konversi pelamar → pegawai; nomor WA
  dinormalisasi; hasil kirim dicatat.
- **Perlu keputusan:** definisi `talent pool` dan `page-satpam`.

### 13.5 Absensi (Hitung Berangkat)

- **Data:** `attendance_records`, `attendance_rosters`, `attendance_overrides`, `holidays`,
  `requests` (dinas disetujui), API rekap.
- **Aksi:** filter bulan/tanggal/departemen/nama; tab Hari Ini, Rekap, Tabel, Grafik;
  edit/override; sinkron ulang; ekspor.
- **Aturan:**
  - Karyawan di `attendance_blacklist` tidak dihitung/ditampilkan.
  - Dinas disetujui memengaruhi status (dalam/luar kota).
  - Hari libur dari `holidays`/payroll.
  - Status masuk/keluar dihitung server; JS hanya menampilkan.
  - Selfie + GPS: jarak Haversine di server; akurasi maksimum; tolak di luar radius bila
    dikonfigurasi; simpan `flag_spoof` bila terdeteksi.

### 13.6 Cuti & Sakit

- **Data:** `leave_settings`, `leave_allocations`, `leave_records`, `requests`.
- **Aksi:** input cuti, atur jatah, atur aturan, hapus, import/export Excel.
- **Aturan:**
  - Jatah pertama & tahunan, masa tunggu, masa berlaku, perpanjangan.
  - Cuti setengah hari membutuhkan jam.
  - Cuti tahunan memotong jatah; sakit dengan surat dokter tidak memotong (kecuali override).
  - Sinkron `terpakai` setelah simpan/hapus.
  - Hitung hari kerja (exclude hari libur bila aturan berlaku).

### 13.7 Permohonan

- **Jenis:** `cuti`, `keluar_kantor`, `dinas`, `dinas_luar_kota`, `absensi`.
- **Status:** `draft` → `menunggu` → `disetujui`/`ditolak`/`dibatalkan`.
- **Aksi:** simpan draft, kirim, batal, setujui, tolak, unggah lampiran/surat dokter,
  pilih penandatangan, preview/PDF.
- **Aturan:**
  - Satu `requests` + satu detail sesuai jenis.
  - Tanda tangan berjenjang disimpan di `request_signatures` (peran, nama, signature).
  - Penandatangan dipilih dari karyawan (API pencarian), bukan input bebas.
  - Approver hanya yang berhak; tolak wajib alasan.
  - Lampiran & surat dokter hanya bisa diakses pemohon/approver/HR.
  - Perubahan status mengirim notifikasi (in-app + push).
  - Integrasi: dinas disetujui masuk perhitungan absensi.

### 13.8 Payroll & Slip Gaji

- **Data:** DB payroll (`m_pegawai`, `t_gaji`, `m_harilibur`) + master.
- **Aksi:** lihat slip, verifikasi PIN, unduh PDF, laporan.
- **Aturan:** PIN `DDMM`, lock setelah 5 gagal, tautan bertanda tangan 1 jam, akses hanya
  pemilik (atau `payroll.read_all`).
- **Catatan:** 19 halaman payroll belum punya view; keputusan scope diperlukan.

### 13.9 Buku Hamana, Saran, Tanda Tangan

- **Buku Hamana:** daftar, baca/stream, unduh, unggah/ubah/hapus (admin). PDF ≤ 20 MB.
- **Saran:** kirim saran (semua), lihat saran masuk (admin/HR). Tidak ada edit/hapus.
- **Tanda Tangan:** simpan gambar tanda tangan (base64/PNG), tampilkan di dokumen;
  satu tanda tangan aktif per pengguna.

### 13.10 Pengaturan

- **Bahasa:** pilihan locale + terjemahan.
- **Hak Akses:** toggle `hr`/`akses_admin` per pegawai; sinkron ke `users.role`.
- **Absensi by Foto:** toggle per pegawai; pengaturan radius/akurasi/retensi.
- **Daftar Hitam Presensi:** kelola NIK yang dikecualikan; sumber roster + pegawai.
- **Ubah Password:** verifikasi password lama, minimal 8 karakter, konfirmasi.

---

## 14. Non-Functional Requirements

| Kategori | Persyaratan |
|---|---|
| Keamanan | CSRF semua form; rate limit login; policy per aksi; signed URL file; tidak ada SHA1 |
| Privasi | PII & selfie di disk privat; akses berbasis peran; log akses dokumen |
| Performa | Halaman list < 1 s (25 baris); absensi 1 bulan < 2 s; query terindeks |
| Skalabilitas | ± 500 pegawai, ± 15.000 baris absensi/bulan, ± 500 permohonan/bulan |
| Ketersediaan | 99,5%; integrasi gagal tidak memblok fitur inti |
| Observability | Log terstruktur, `sync_runs`, `activity_logs`, alert job gagal |
| i18n | Bahasa Indonesia default; istilah konsisten |
| Timezone | `Asia/Jakarta`; tanggal bisnis dihitung di server |
| Backup | Harian DB + file; retensi 30 hari; uji restore bulanan |
| Kompatibilitas | Browser modern; mobile untuk absen foto |

---

## 15. Roadmap & Milestone

| Fase | Durasi | Lingkup | Exit Criteria |
|---|---|---|---|
| **F0 — Discovery & Inventory** | 1 minggu | Inventaris DB produksi (termasuk tabel yang tak ada di dump), konfirmasi scope payroll, definisi talent pool/satpam | Dokumen inventaris final disetujui |
| **F1 — Fondasi** | 2 minggu | Migration skema inti, `users`/`employees`, auth (email/username/NIK, SHA1 rehash), permission per aksi, layout data | Login lama berhasil; halaman kosong bisa dibuka |
| **F2 — Profil & Data Pegawai** | 2–3 minggu | 5 halaman profil, kelola file, data pegawai CRUD/import/export, dokumen pegawai | UAT profil & data pegawai |
| **F3 — Absensi & Cuti** | 3 minggu | Rekap API + queue, hitung berangkat, override, blacklist, hari libur, input cuti, jatah | Rekonsiliasi absensi 1 bulan & cuti |
| **F4 — Permohonan** | 3 minggu | 5 jenis pengajuan, draft/kirim/approve/tolak, lampiran, surat dokter, TTD, notifikasi | Alur end-to-end 5 jenis |
| **F5 — Konten & Admin** | 2 minggu | Buku Hamana, saran, tanda tangan, master data, list admin, pengaturan | UAT admin/HR |
| **F6 — Rekrutmen & WA** | 2 minggu | Pelamar, lowongan, terima/tolak, gateway WA baru | Kirim WA berhasil & tercatat |
| **F7 — Payroll & Cutover** | 3 minggu | Slip gaji, laporan/payroll sesuai scope, parallel run, migrasi final, pelatihan | Go-live & rekonsiliasi 100% |

**Total:** ± 16–19 minggu (1–2 developer), dapat diparalelkan.

### 15.1 Strategi Cutover

1. **Parallel run** 2 minggu: aplikasi lama tetap dipakai, data disinkronkan.
2. **Freeze** input di aplikasi lama pada jam tertentu.
3. **Final sync** (ETL incremental) + rekonsiliasi.
4. **Switch** domain, uji login & modul kritis.
5. **Rollback plan:** aplikasi lama tetap hidup 1 minggu; DNS dikembalikan bila gagal.
6. **Hypercare** 2 minggu.

---

## 16. Rencana Pengujian & Acceptance

### 16.1 Jenis Pengujian

| Jenis | Fokus |
|---|---|
| Unit | Service cuti, perhitungan hari, geofencing, status absensi, HMAC slip |
| Feature | Route, policy, validasi, CSRF, permission |
| Integration | API rekap (mock), payroll DB, WA gateway, queue |
| ETL | Idempotensi, rekonsiliasi, data invalid |
| Security | IDOR, akses file, rate limit, permission matrix |
| UAT | Per modul dengan peran admin/HR/karyawan |

### 16.2 Kriteria Penerimaan Global

- [ ] Semua modul P0 berfungsi dengan data nyata.
- [ ] Login email/username/NIK berhasil; password lama termigrasi otomatis.
- [ ] Tidak ada `localStorage` sebagai sumber data pada modul yang dimigrasikan.
- [ ] Tidak ada form tanpa CSRF.
- [ ] Semua query data pegawai ter-scope.
- [ ] File PII tidak dapat diakses tanpa otorisasi.
- [ ] Rekonsiliasi tabel inti 100%.
- [ ] Integrasi punya status & retry yang terlihat.
- [ ] Log aktivitas tersedia untuk perubahan data penting.
- [ ] Dokumentasi operasional (backup, restore, sync, retry) tersedia.

### 16.3 Checklist Rekonsiliasi

| Tabel sumber | Tabel target | Kunci | Cek |
|---|---|---|---|
| `t_pegawai` | `employees` | `refid` | count, nik, nama, email, departemen |
| `t_admin` | `users` | `username` | count, role |
| `t_pegawai_keluarga` | `employee_families` | id | count per refid |
| `t_pegawai_pendidikan` | `employee_educations` | id | count per refid |
| `t_permohonan` | `requests` | id/refid | count per jenis & status |
| `t_permohonan_*` | `request_*` | permohonan_id | count & total |
| `t_absensi_rekap` | `attendance_records` | nik+tanggal | count & checksum jam |
| `t_cuti` | `leave_records` | id | count & total hari |
| `t_cuti_jatah` | `leave_allocations` | id | count & saldo |
| `t_tandatangan` | `signatures` | username | count |
| `t_buku_hamana` | `books` | id | count & file exists |
| `t_saran` | `suggestions` | id | count |

---

## 17. Risiko & Mitigasi

| Risiko | Dampak | Prob. | Mitigasi |
|---|---|---|---|
| Tabel/kolom tak terdokumentasi | Data hilang | Tinggi | F0 inventaris DB produksi |
| API absensi memakai tunnel | Data absensi basi | Tinggi | Domain tetap + fallback upload |
| DB payroll tidak dapat diakses | Slip gaji mati | Sedang | API payroll / read replica |
| Password SHA1 tidak bisa diverifikasi | User tidak bisa login | Sedang | Uji sampel hash + reset terjadwal |
| Duplikasi NIK/email | Import gagal | Sedang | Profiling & aturan resolusi |
| Scope payroll membengkak | Jadwal mundur | Tinggi | Tetapkan scope di F0 |
| Perbedaan perhitungan cuti | Sengketa HR | Sedang | Uji tabel kasus + sign-off HR |
| File PII bocor | Insiden | Sedang | Disk privat + signed URL + audit |
| Approver tidak lengkap | Permohonan macet | Sedang | Default approver + eskalasi |
| User resistance | Adopsi rendah | Sedang | Pelatihan + parallel run |

---

## 18. Pertanyaan Terbuka / Keputusan yang Dibutuhkan

1. **Scope payroll:** tetap aplikasi terpisah (disarankan) atau migrasi penuh? Jika tetap,
   apakah 19 halaman payroll di target hanya read-only/link ke aplikasi payroll?
2. **Tabel yang tidak ada di dump:** dapatkan dump terbaru dari DB produksi untuk
   `t_log_login`, `t_pegawai_anak/bahasa/course/organisasi/pekerjaan/psikotes/relasi*/upload`,
   `tb_lowker`, dan seluruh tabel `admin_payrolldb`.
3. **Definisi `rekrutmen-talent-pool`:** kriteria kandidat (ditolak? cadangan? skor?).
4. **Definisi `list-satpam` & `page-satpam`:** data dan fungsi persisnya.
5. **Sumber kebenaran hari libur:** payroll atau salinan lokal?
6. **Kebijakan retensi file:** berapa lama selfie, surat dokter, lampiran disimpan?
7. **Approval berjenjang:** aturan penentuan approver (atasan langsung, kepala bagian,
   manager, HRD) — apakah tetap manual seperti sekarang?
8. **Nomor WhatsApp & gateway:** provider mana yang akan dipakai?
9. **SSO/email:** apakah login boleh tetap email internal, atau perlu integrasi Microsoft/Google?
10. **Cutover:** tanggal target & window downtime yang diizinkan.

---

## 19. Langkah Berikutnya (2 Minggu Pertama)

| # | Aksi | Output | PIC |
|---|---|---|---|
| 1 | Ambil dump terbaru 4 database + salinan folder file | Snapshot lengkap | DevOps/DB |
| 2 | Inventarisasi tabel di luar dump & seluruh `admin_payrolldb` | Lampiran inventaris final | BE |
| 3 | Tetapkan scope payroll (integrasi vs migrasi) | Keputusan tertulis | Product/Finance |
| 4 | Review & setujui skema target (§9) | Skema disetujui | Tech lead |
| 5 | Buat migration + model + seeder untuk domain A (identitas) | Fondasi DB | BE |
| 6 | Implementasi auth (email/username/NIK + rehash SHA1) & permission per aksi | Login + policy | BE |
| 7 | Bangun pipeline ETL kerangka (`legacy_*`, `legacy_id_map`, reconciliation) | ETL skeleton | BE/Data |
| 8 | Prototipe end-to-end 1 modul: **Profil Data Pribadi** | Bukti pola UI↔API | FE+BE |
| 9 | Siapkan environment staging + data anonim | Staging siap UAT | DevOps |
| 10 | Susun matriks uji per peran & jadwal UAT | Test plan | QA |

Kriteria keluar F0: seluruh keputusan §18 terjawab, snapshot tersedia, skema disetujui, dan
prototipe profil berjalan di staging.

---

## Lampiran A — Peta Route Sumber (Ringkas)

| Grup | Route utama | Controller |
|---|---|---|
| Auth | `/`, `/admin`, `/loginproses`, `/loginadminproses`, `/logout` | `LoginController` |
| Dashboard | `/dashboard`, `/dashboard/absen-foto*` | `DashboardController`, `AbsenFotoController` |
| Absensi | `/absensi/hariini`, `/absensi/rekap`, `/absensi/hitungberangkat`, `/absensi/api/*` | `AbsensiController` |
| Input | `/input/cuti*`, `/input/absen*`, `/input/bukuhamana*` | `InputCutiController`, `InputAbsenController`, `BukuHamanaController` |
| Setting | `/setting/*`, `/setting/Daftar-Hitam-Presensi`, `/setting/hak-akses-admin` | `SettingController`, `InputBlacklistPresensiController`, `HakAksesAdminController` |
| Admin | `/adminlist`, `/adminadd`, `/adminedit`, `/admindelete` | `PenggunaController` |
| Pegawai | `/pegawai*`, `/riwayatpendidikan`, `/keluarga`, `/fisik`, `/filepegawai*` | `PegawaiController`, `MemberController`, `DokumenPegawaiController` |
| Master | `/tingkat`, `/golongan`, `/propinsi`, `/jabatan`, `/masterfile`, `/faskes*` | controller master |
| WA | `/wasetting*`, `/wakirim*`, `/walist*` | `WasettingController`, `WakirimController` |
| Rekrutmen | `/karir*` | `KarirController` |
| Profil | `/profil*`, `/profile`, `/profilpayroll*` | `MemberController` |
| Buku | `/bukuhamana/*`, `/aturanhamana` | `BukuHamanaController`, `AturanHamanaController` |
| Permohonan | `/permohonan/*`, `POST /cuti`, `/keluarkantor`, `/izindinas*`, `/formabsensi` | `PermohonanController` |
| Saran | `/saran`, `/saran/masuk`, `/saran/simpan` | `SaranController` |
| TTD | `/tandatangan*` | `TandatanganController` |
| Notifikasi | `/notif/*` | `NotifikasiController` |
| API | `/api/attendance/monthly` (eksternal), `/permohonan/api/karyawan`, `/faskes/*` | — |

---

## Lampiran B — Pemetaan Kelas Sumber → Target

| Sumber | Target (usulan) |
|---|---|
| `AbsensiController` | `App\Livewire\Hris\Attendance\Index` + `App\Services\Attendance\AttendanceService` |
| `RekapAbsensiService` | `App\Services\Attendance\RecapService` |
| `RosterMaster` | `App\Services\Attendance\RosterService` |
| `DinasPermohonanService` | `App\Services\Attendance\TripOverlayService` |
| `AbsenFotoController` | `App\Livewire\Hris\Attendance\Photo` + `AttendancePhotoService` |
| `InputCutiController` | `App\Livewire\Hris\Leave\Input` + `LeaveService` |
| `CutiJatahService` | `App\Services\Leave\AllocationService` |
| `PermohonanController` | `App\Livewire\Hris\Requests\*` + `RequestService` + `ApprovalService` |
| `HariLiburService` | `App\Services\Attendance\HolidayService` |
| `NotifikasiService` | `App\Services\NotificationService` |
| `PegawaiController`/`MemberController` | `App\Livewire\Hris\Employees\*` + `EmployeeService` |
| `KarirController` | `App\Livewire\Hris\Recruitment\*` + `ApplicantService` |
| `WakirimController`/`WasettingController` | `App\Services\WhatsApp\*` |
| `BukuHamanaController`/`AturanHamanaController` | `App\Livewire\Hris\Books\*` + `BookService` |
| `SaranController` | `App\Livewire\Hris\Suggestions\*` |
| `TandatanganController` | `App\Livewire\Hris\Signature\*` + `SignatureService` |
| `DokumenPegawaiController` | `App\Livewire\Hris\Documents\*` + `DocumentService` |
| `FaskesController` | `App\Livewire\Hris\Master\HealthFacilities` |
| `TingkatController`/`JabatanController`/`GolonganController`/`PropinsiController` | `App\Livewire\Hris\Master\*` |
| `PenggunaController` | `App\Livewire\Settings\Users` (atau panel `Pengaturan`) |
| `HakAksesAdminController`/`AbsenFotoController`/`InputBlacklistPresensiController` | `App\Livewire\Settings\*` |
| `RememberLoginService` | Laravel `remember_token` (tidak perlu service) |
| `FotoPegawai`/`DokumenPegawai`/`SuratDokter`/`LampiranPermohonan`/`PayrollSlip`/`PetaKaryawan`/`BlacklistPresensi`/`Faskes`/`Akses*` | `App\Services\*\...` (helper → service) |
| `Akses` | `User::canAccess()` + `Gate`/Policy |

**Helper yang tidak boleh dipindahkan apa adanya:**

- `Akses` (session-based) → permission Laravel.
- `Formatnohp` & `ApiToken` (hilang) → tulis ulang.
- `Asset` (path aset template lama) → `@vite`/`asset()`.

---

## Lampiran C — Checklist UI: Data Lokal/Mock → Backend

Untuk setiap halaman berikut:

1. Hapus `localStorage`/array mock sebagai sumber data bisnis.
2. Tambahkan payload awal dari Blade (`@json`).
3. Ganti aksi simpan/hapus dengan `fetch` + CSRF.
4. Tambahkan state loading/error/kosong.
5. Pastikan refresh memuat data server (bukan cache lokal).
6. Tambahkan validasi server + tampilkan error per field.
7. Uji dengan dua akun berbeda (isolasi data).

| Halaman | File skrip | Status |
|---|---|---|
| Absensi | `hris/absensi/script.js` | mock data |
| Profil data pribadi | `hris/profil-data-pribadi/script.js` | localStorage |
| Profil riwayat pendidikan | `hris/profil-riwayat-pendidikan/script.js` | localStorage |
| Profil anggota keluarga | `hris/profil-anggota-keluarga/script.js` | localStorage |
| Profil ciri fisik | `hris/profil-ciri-fisik/script.js` | localStorage |
| Profil kelola file | `hris/profil-kelola-file/script.js` | localStorage |
| Data pegawai | `hris/data-pegawai/script.js` | localStorage |
| Data admin list admin | `hris/data-admin-list-admin/script.js` | localStorage |
| Data admin tingkat | `hris/data-admin-data-tingkat/script.js` | localStorage |
| Data admin jabatan | `hris/data-admin-data-jabatan/script.js` | localStorage |
| Data admin faskes | `hris/data-admin-data-faskes-bpjs/script.js` | localStorage |
| List satpam | `hris/list-satpam/script.js` | localStorage |
| Tanda tangan | `hris/tanda-tangan/script.js` | localStorage |
| Permohonan saya | `hris/permohonan-saya/script.js` | mock array |
| Permohonan masuk | `hris/permohonan-masuk/script.js` | mock array |

---

## Lampiran D — Definition of Done per Modul

Sebuah modul dinyatakan selesai bila:

- [ ] Skema & migration tersedia, teruji `migrate:fresh`.
- [ ] Model, relasi, factory, dan seeder ada.
- [ ] Service/aturan bisnis punya unit test (termasuk kasus tepi).
- [ ] Endpoint/Livewire memvalidasi input dan mengembalikan amplop standar.
- [ ] Policy/otorisasi diuji untuk minimal 2 peran.
- [ ] UI tidak lagi memakai data mock/`localStorage`.
- [ ] Audit log tercatat untuk aksi tulis penting.
- [ ] File/unduhan memakai akses terkontrol.
- [ ] Dokumentasi singkat (cara pakai, edge case) ditambahkan.
- [ ] UAT disetujui pemilik proses (HR/Finance).

---

## Lampiran E — Catatan Audit Tambahan

- `config/payroll.php` **dan** `app/Helper/PayrollSlip.php` memiliki nilai `slip_secret` default
  yang sama dan **harus dihapus**; aplikasi harus gagal start bila env tidak diisi.
- `config/absensi.php` memakai URL tunnel `trycloudflare.com` sebagai default.
- Banyak controller mengulang pola `if (!Session::get('username'))` — semua harus diganti
  middleware `auth`.
- Beberapa form tidak memiliki `@csrf`; ada juga typo route (`/ilepegawaisave`).
- `t_pegawai.session_id` menyimpan hash session, bukan ID session Laravel — jangan dibawa.
- `t_dokumen_log` hanya mencatat ID dokumen & alamat, belum ada aktor; target harus mencatat
  `user_id`, aksi, dan waktu.
- Perhitungan absensi sangat bergantung pada nama/NIK yang konsisten; normalisasi NIK wajib
  sebelum migrasi.
- Modul WA saat ini **tidak dapat berjalan** karena dua kelas helper hilang dan `WA_SERVER`
  tidak diset; jangan menganggapnya sebagai fitur yang "tinggal dipindah".
- Payroll adalah **sistem eksternal**; integrasi harus diperlakukan sebagai kontrak, bukan
  sekadar query bebas.

---

*Dokumen ini menjadi baseline perencanaan. Setiap keputusan pada §18 harus diselesaikan
sebelum Fase 1 dimulai agar skema dan scope tidak berubah di tengah jalan.*
