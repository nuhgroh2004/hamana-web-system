@php
    $d = $r['form_data'] ?? [];
    $type = $r['form_type'] ?? '';
    $fmtDate = function ($v) {
        if (! $v) return '-';
        try {
            return \Carbon\Carbon::parse($v)->locale('id')->translatedFormat('j F Y');
        } catch (\Throwable) {
            return (string) $v;
        }
    };
    $isFramed = in_array($type, ['izin-dinas-dalam-kota', 'izin-dinas-luar-kota', 'form-absensi'], true);
    $approverName = $d['atasan_nama'] ?? $d['pemberi_nama'] ?? ($r['ap']['n'] ?? '');
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $r['jenis'] ?? 'Permohonan' }} - {{ $r['nama'] ?? '' }}</title>
    <style>
        @page { size: A4 portrait; margin: {{ $isFramed ? '10mm 12mm' : '14mm 16mm' }}; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.45; color: #111; margin: 0; }
        .frm { border: 1.5px solid #111; padding: 14px 18px 16px; }
        .hd-tbl { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .hd-tbl td { vertical-align: middle; }
        .hd-logo { width: 140px; }
        .hd-logo img { height: 48px; width: auto; }
        .hd-title { text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; }
        .tt { text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; margin: 2px 0 14px; }
        .jus { text-align: justify; margin: 0 0 12px; line-height: 1.5; }
        .cb-tbl { width: 70%; margin: 0 auto 14px; border-collapse: collapse; }
        .cb-tbl td { text-align: center; font-size: 12px; padding: 2px 8px; }
        .rw-tbl { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
        .rw-tbl td { padding: 4px 2px; vertical-align: bottom; }
        .rw-lb { width: 165px; white-space: nowrap; }
        .rw-cl { width: 12px; text-align: center; }
        .rw-v { border-bottom: 1px solid #111; padding: 2px 4px; }
        .note { margin: 6px 0 10px 179px; font-size: 11.5px; font-style: italic; }
        .kt { font-weight: bold; text-decoration: underline; margin: 14px 0 6px; }
        .ket { margin: 0; padding-left: 18px; }
        .ket li { margin-bottom: 6px; text-align: justify; }
        .ib { border: 1px solid #111; padding: 6px 10px; margin-bottom: 12px; }
        .ib p { margin: 0 0 4px; font-weight: bold; font-size: 12px; }
        .tb { width: 100%; border-collapse: collapse; margin: 10px 0 12px; font-size: 11px; }
        .tb th, .tb td { border: 1px solid #111; padding: 4px 6px; vertical-align: top; }
        .tb th { background: #f3f5f8; font-weight: bold; text-align: center; vertical-align: middle; }
        .tb td.n { text-align: center; }
        .kv { margin: 8px 0 10px; }
        .ln2 { display: inline-block; min-width: 140px; border-bottom: 1px solid #111; padding: 0 4px; }
        .kt2 { margin: 10px 0 12px; font-size: 11px; }
        .kt2 ul { margin: 4px 0 0; padding-left: 18px; }
        .kt2 li { margin-bottom: 3px; text-align: justify; }
        .no { text-align: center; margin: -6px 0 12px; }
        .sh { font-weight: bold; margin: 10px 0 4px; }
        .tg { text-align: right; margin: 12px 0 6px; }
        .sg-tbl { width: 100%; border-collapse: collapse; margin-top: 22px; }
        .sg-tbl td { width: 50%; text-align: center; vertical-align: bottom; padding: 0 12px; }
        .cap { margin: 0 0 4px; min-height: 30px; }
        .sig-box { height: 82px; text-align: center; }
        .sig-box img { max-height: 80px; max-width: 170px; }
        .sig-ln { display: inline-block; width: 170px; border-bottom: 1px solid #111; margin-top: 66px; }
        .nm { margin: 4px 0 0; font-weight: bold; }
        .dt { margin: 2px 0 0; font-size: 11px; color: #333; }
    </style>
</head>
<body>
@if ($isFramed)<div class="frm">@endif

@if ($type === 'izin-cuti-atau-sakit')
    @php
        $jenis = is_array($d['jenis'] ?? null) ? implode(', ', $d['jenis']) : ($d['jenis'] ?? '');
        $tanggal = $fmtDate($d['tgl_mulai'] ?? null).(! empty($d['tgl_sampai']) ? ' — '.$fmtDate($d['tgl_sampai']) : '');
        $waktu = ($d['waktu_mulai'] ?? '-').(! empty($d['waktu_sampai']) ? ' s.d. '.$d['waktu_sampai'] : '');
    @endphp
    <table class="hd-tbl">
        <tr>
            <td class="hd-logo">@if($logo)<img src="{{ $logo }}" alt="Logo">@endif</td>
            <td class="hd-title">FORMULIR PERMINTAAN CUTI / SAKIT</td>
            <td class="hd-logo"></td>
        </tr>
    </table>
    <table class="cb-tbl">
        <tr>
            <td>[{{ str_contains($jenis, 'Cuti Fullday') ? 'x' : ' ' }}] Cuti Fullday</td>
            <td>[{{ str_contains($jenis, 'Cuti Halfday') ? 'x' : ' ' }}] Cuti Halfday</td>
        </tr>
    </table>
    <table class="rw-tbl">
        <tr><td class="rw-lb">Tanggal Cuti / Sakit</td><td class="rw-cl">:</td><td class="rw-v">{{ $tanggal }}</td></tr>
        <tr><td class="rw-lb">Waktu</td><td class="rw-cl">:</td><td class="rw-v">{{ $waktu }}</td></tr>
        <tr><td class="rw-lb">Tanggal Kembali Kerja</td><td class="rw-cl">:</td><td class="rw-v">{{ $fmtDate($d['tgl_kembali'] ?? null) }}</td></tr>
        <tr><td class="rw-lb">Waktu</td><td class="rw-cl">:</td><td class="rw-v">{{ $d['waktu_kembali'] ?? '-' }}</td></tr>
        <tr><td class="rw-lb">Untuk Keperluan</td><td class="rw-cl">:</td><td class="rw-v">{{ $d['keperluan'] ?? '-' }}</td></tr>
        @if (! empty($d['keterangan_lain']))
            <tr><td class="rw-lb">Keterangan</td><td class="rw-cl">:</td><td class="rw-v">{{ $d['keterangan_lain'] }}</td></tr>
        @endif
    </table>
    @if (! empty($d['surat']))
        <p class="note">{{ $d['surat'] }}</p>
    @endif
    <p class="kt">Keterangan</p>
    <ol class="ket">
        <li>Selama menjalankan cuti / sakit saya beralamat di : <b>{{ $d['alamat'] ?? '-' }}</b></li>
        <li>Apabila dalam 5 (lima) hari sejak tanggal tersebut saya tidak kembali tanpa pemberitahuan dan alasan yang kuat, maka saya dianggap telah mengundurkan diri dari perusahaan.</li>
    </ol>
    <table class="sg-tbl">
        <tr>
            <td>
                <p class="cap">Diketahui / disetujui :<br>Kepala Unit / Bagian</p>
                <div class="sig-box">
                    @if (! empty($r['signature_approver']))<img src="{{ $r['signature_approver'] }}" alt="TTD">@else<span class="sig-ln"></span>@endif
                </div>
                <p class="nm">({{ $approverName ?: '__________________' }})</p>
                @if (! empty($d['atasan_tanggal']))<p class="dt">{{ $fmtDate($d['atasan_tanggal']) }}</p>@endif
            </td>
            <td>
                <p class="cap">Yang mengajukan</p>
                <div class="sig-box">
                    @if (! empty($r['signature_applicant']))<img src="{{ $r['signature_applicant'] }}" alt="TTD">@else<span class="sig-ln"></span>@endif
                </div>
                <p class="nm">({{ $d['nama_jelas'] ?? $r['nama'] ?? '__________________' }})</p>
                <p class="dt">{{ $fmtDate($d['tanggal_ttd'] ?? $r['tgl'] ?? null) }}</p>
            </td>
        </tr>
    </table>

@elseif ($type === 'izin-keluar-kantor')
    <table class="hd-tbl"><tr><td class="hd-logo">@if($logo)<img src="{{ $logo }}" alt="Logo">@endif</td><td></td></tr></table>
    <div class="tt">SURAT IZIN KELUAR KANTOR</div>
    <p class="jus">Yang bertanda tangan di bawah ini, dengan ini memberikan izin kepada tersebut karyawan yang namanya tertera di bawah ini untuk izin keluar kantor pada jam kerja:</p>
    <table class="rw-tbl">
        <tr><td class="rw-lb">Nama Karyawan</td><td class="rw-cl">:</td><td class="rw-v">{{ $r['nama'] ?? '-' }}</td></tr>
        <tr><td class="rw-lb">Jabatan</td><td class="rw-cl">:</td><td class="rw-v">{{ $r['jabatan'] ?? '-' }}</td></tr>
        <tr><td class="rw-lb">Hari/Tanggal</td><td class="rw-cl">:</td><td class="rw-v">{{ $fmtDate($d['tanggal'] ?? null) }}</td></tr>
        <tr><td class="rw-lb">Jam Keluar / Masuk</td><td class="rw-cl">:</td><td class="rw-v">{{ ($d['jam_keluar'] ?? '-').' / '.($d['jam_masuk'] ?? '-') }}</td></tr>
        <tr><td class="rw-lb">Tujuan</td><td class="rw-cl">:</td><td class="rw-v">{{ $d['tujuan'] ?? '-' }}</td></tr>
        <tr><td class="rw-lb">Kendaraan yang Digunakan</td><td class="rw-cl">:</td><td class="rw-v">{{ $d['kendaraan'] ?? '-' }}</td></tr>
    </table>
    <table class="sg-tbl">
        <tr>
            <td>
                <p class="cap">Karyawan,<br>Pemohon Izin</p>
                <div class="sig-box">
                    @if (! empty($r['signature_applicant']))<img src="{{ $r['signature_applicant'] }}" alt="TTD">@else<span class="sig-ln"></span>@endif
                </div>
                <p class="nm">({{ $d['nama_jelas'] ?? $r['nama'] ?? '__________________' }})</p>
            </td>
            <td>
                <p class="cap">Atasan Langsung,<br>Pemberi Izin</p>
                <div class="sig-box">
                    @if (! empty($r['signature_approver']))<img src="{{ $r['signature_approver'] }}" alt="TTD">@else<span class="sig-ln"></span>@endif
                </div>
                <p class="nm">({{ $approverName ?: '__________________' }})</p>
            </td>
        </tr>
    </table>

@elseif ($type === 'izin-dinas-dalam-kota')
    @php
        $k = $d['karyawan'] ?? [];
        $baris = is_array($d['baris'] ?? null) ? $d['baris'] : [];
    @endphp
    <table class="hd-tbl"><tr><td class="hd-logo">@if($logo)<img src="{{ $logo }}" alt="Logo">@endif</td><td></td></tr></table>
    <div class="tt">FORM IZIN DINAS DALAM KOTA</div>
    <div class="ib">
        <table class="rw-tbl">
            <tr><td class="rw-lb" style="width:110px">Nama</td><td class="rw-cl">:</td><td class="rw-v">{{ $k['nama'] ?? $r['nama'] ?? '-' }}</td></tr>
            <tr><td class="rw-lb" style="width:110px">NPK</td><td class="rw-cl">:</td><td class="rw-v">{{ $k['npk'] ?? $r['nik'] ?? '-' }}</td></tr>
            <tr><td class="rw-lb" style="width:110px">Jabatan</td><td class="rw-cl">:</td><td class="rw-v">{{ $k['jabatan'] ?? $r['jabatan'] ?? '-' }}</td></tr>
            <tr><td class="rw-lb" style="width:110px">Dept/ Bag</td><td class="rw-cl">:</td><td class="rw-v">{{ $k['dept'] ?? '-' }}</td></tr>
        </table>
    </div>
    <table class="tb">
        <thead>
            <tr>
                <th style="width:16%">Hari/<br>Tanggal</th>
                <th style="width:11%">Dari<br>Jam</th>
                <th style="width:11%">Selesai<br>Jam</th>
                <th>Tujuan</th>
                <th style="width:15%">Langsung dr<br>Rumah (Ya/ Tdk)</th>
                <th style="width:15%">Kembali ke<br>Kantor (Ya/ Tdk)</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($baris as $b)
                <tr>
                    <td>{{ $fmtDate($b['tanggal'] ?? null) }}</td>
                    <td>{{ $b['dari'] ?? '' }}</td>
                    <td>{{ $b['selesai'] ?? '' }}</td>
                    <td>{{ $b['tujuan'] ?? '' }}</td>
                    <td>{{ $b['langsung'] ?? '' }}</td>
                    <td>{{ $b['kembali'] ?? '' }}</td>
                </tr>
            @empty
                <tr><td colspan="6" style="text-align:center;color:#777">Tidak ada perjalanan dinas.</td></tr>
            @endforelse
        </tbody>
    </table>
    <p class="kv"><b>Kendaraan yang digunakan :</b> <span class="ln2">{{ $d['kendaraan'] ?? '-' }}</span></p>
    <div class="kt2">
        <b>Keterangan :</b>
        <ul>
            <li>Untuk tugas rutin atau tugas luar kota &gt; 3 kali dalam seminggu, maka formulir harus diserahkan ke Departemen HRD pada hari terakhir ybs bertugas di minggu tersebut.</li>
            <li>Untuk tugas-tugas luar insidental, formulir harus diserahkan pada hari itu juga/keesokan harinya.</li>
            <li>Formulir tugas luar dianggap tidak sah apabila tidak ada persetujuan dari atasan langsung/ pemberi tugas</li>
        </ul>
    </div>
    <table class="sg-tbl">
        <tr>
            <td>
                <p class="cap">Dibuat oleh,</p>
                <div class="sig-box">@if (! empty($r['signature_applicant']))<img src="{{ $r['signature_applicant'] }}" alt="TTD">@else<span class="sig-ln"></span>@endif</div>
                <p class="nm">({{ $d['nama_jelas'] ?? $r['nama'] ?? '__________________' }})</p>
            </td>
            <td>
                <p class="cap">Disetujui oleh,</p>
                <div class="sig-box">@if (! empty($r['signature_approver']))<img src="{{ $r['signature_approver'] }}" alt="TTD">@else<span class="sig-ln"></span>@endif</div>
                <p class="nm">({{ $approverName ?: '__________________' }})</p>
            </td>
        </tr>
    </table>

@elseif ($type === 'izin-dinas-luar-kota')
    @php
        $itinerary = is_array($d['itinerary'] ?? null) ? $d['itinerary'] : [];
        $transportasi = is_array($d['transportasi'] ?? null) ? $d['transportasi'] : [];
        $lokasi = is_array($d['lokasi'] ?? null) ? $d['lokasi'] : [];
    @endphp
    <table class="hd-tbl"><tr><td class="hd-logo">@if($logo)<img src="{{ $logo }}" alt="Logo">@endif</td><td></td></tr></table>
    <div class="tt">SURAT PERINTAH TUGAS</div>
    <p class="no"><b>NO :</b> <span class="ln2">{{ $d['nomor'] ?? '-' }}</span></p>
    <p class="jus">Kami yang bertanda tangan di bawah ini, Direksi/General Manager/Kepala Departemen/Product Manager/Kepala Bagian/Area Manager PT. Hamana Works Indonesia, menerangkan bahwa :</p>
    <table class="rw-tbl">
        <tr><td class="rw-lb">Nama</td><td class="rw-cl">:</td><td class="rw-v">{{ $r['nama'] ?? '-' }}</td></tr>
        <tr><td class="rw-lb">Jabatan</td><td class="rw-cl">:</td><td class="rw-v">{{ $r['jabatan'] ?? '-' }}</td></tr>
    </table>
    <p class="jus">Untuk melaksanakan Tugas Perjalanan Dinas Dalam Negeri/Luar Negeri</p>
    <p class="sh">Detail Acara (Itinerary):</p>
    <table class="tb">
        <thead><tr><th style="width:6%">No.</th><th>Tempat yang dikunjungi</th><th style="width:28%">Hari, Tanggal dan Waktu keberangkatan</th><th>Keperluan</th></tr></thead>
        <tbody>
            @forelse ($itinerary as $i => $it)
                <tr>
                    <td class="n">{{ $i + 1 }}</td>
                    <td>{{ $it['tempat'] ?? '' }}</td>
                    <td>{{ $fmtDate($it['tanggal'] ?? null) }}{{ ! empty($it['jam']) ? ', '.$it['jam'] : '' }}</td>
                    <td>{{ $it['keperluan'] ?? '' }}</td>
                </tr>
            @empty
                <tr><td colspan="4" style="text-align:center;color:#777">Tidak ada itinerary.</td></tr>
            @endforelse
        </tbody>
    </table>
    <p class="jus">Demikian Surat Perintah Tugas ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
    <p class="jus">Atas perhatian dan kerjasamanya, kami mengucapkan terima kasih.</p>
    <p class="tg">Tegal, <span class="ln2">{{ $fmtDate($d['tanggal'] ?? $r['tgl'] ?? null) }}</span></p>
    <table class="sg-tbl">
        <tr>
            <td>
                <p class="cap">Pemberi Tugas,</p>
                <div class="sig-box">@if (! empty($r['signature_approver']))<img src="{{ $r['signature_approver'] }}" alt="TTD">@else<span class="sig-ln"></span>@endif</div>
                <p class="nm">({{ $d['pemberi_nama'] ?? $approverName ?: '__________________' }})</p>
            </td>
            <td>
                <p class="cap">Penerima Tugas,</p>
                <div class="sig-box">@if (! empty($r['signature_applicant']))<img src="{{ $r['signature_applicant'] }}" alt="TTD">@else<span class="sig-ln"></span>@endif</div>
                <p class="nm">({{ $d['penerima_nama'] ?? $r['nama'] ?? '__________________' }})</p>
            </td>
        </tr>
    </table>
    @if (count($transportasi))
        <p class="sh">Detail Transportasi:</p>
        <table class="tb">
            <thead><tr><th style="width:6%">No.</th><th>Transportasi</th><th>Pergi</th><th>Pulang</th></tr></thead>
            <tbody>
                @foreach ($transportasi as $i => $tp)
                    <tr><td class="n">{{ $i + 1 }}</td><td>{{ $tp['transportasi'] ?? '' }}</td><td>{{ $tp['pergi'] ?? '' }}</td><td>{{ $tp['pulang'] ?? '' }}</td></tr>
                @endforeach
            </tbody>
        </table>
    @endif
    @if (count($lokasi))
        <p class="sh">Detail Lokasi:</p>
        <table class="tb">
            <thead><tr><th style="width:6%">No.</th><th>Lokasi</th><th>Estimasi Jarak</th><th>Total Jarak Tempuh</th></tr></thead>
            <tbody>
                @foreach ($lokasi as $i => $lk)
                    <tr><td class="n">{{ $i + 1 }}</td><td>{{ $lk['lokasi'] ?? '' }}</td><td>{{ $lk['estimasi_jarak'] ?? '' }}</td><td>{{ $lk['total_jarak'] ?? '' }}</td></tr>
                @endforeach
            </tbody>
        </table>
    @endif

@elseif ($type === 'form-absensi')
    @php $jenis = $d['jenis'] ?? ''; @endphp
    <table class="hd-tbl">
        <tr>
            <td class="hd-logo">@if($logo)<img src="{{ $logo }}" alt="Logo">@endif</td>
            <td class="hd-title">FORM ABSENSI</td>
            <td class="hd-logo"></td>
        </tr>
    </table>
    <div class="ib">
        <p>PILIH SALAH SATU BILA :</p>
        <div>[{{ $jenis === 'cuti_haid' ? 'x' : ' ' }}] 1. CUTI HAID (KHUSUS KARYAWATI)</div>
        <div>[{{ $jenis === 'mesin_error' ? 'x' : ' ' }}] 2. MESIN ABSENSI ERROR</div>
        <div>[{{ $jenis === 'lupa_absen' ? 'x' : ' ' }}] 3. TIDAK ABSEN / LUPA ABSEN</div>
    </div>
    <table class="rw-tbl">
        <tr><td class="rw-lb">NAMA</td><td class="rw-cl">:</td><td class="rw-v">{{ $r['nama'] ?? '-' }}</td></tr>
        <tr><td class="rw-lb">DIVISI</td><td class="rw-cl">:</td><td class="rw-v">{{ $d['divisi'] ?? '-' }}</td></tr>
        <tr><td class="rw-lb">POSISI</td><td class="rw-cl">:</td><td class="rw-v">{{ $d['posisi'] ?? '-' }}</td></tr>
        <tr><td class="rw-lb">TANGGAL</td><td class="rw-cl">:</td><td class="rw-v">{{ $fmtDate($d['tanggal'] ?? null) }}</td></tr>
        <tr><td class="rw-lb">JAM</td><td class="rw-cl">:</td><td class="rw-v">{{ $d['jam'] ?? '-' }}</td></tr>
        <tr><td class="rw-lb">ALASAN</td><td class="rw-cl">:</td><td class="rw-v">{{ $d['alasan'] ?? '-' }}</td></tr>
    </table>
    <table class="sg-tbl">
        <tr>
            <td>
                <p class="cap">Diajukan oleh,</p>
                <div class="sig-box">@if (! empty($r['signature_applicant']))<img src="{{ $r['signature_applicant'] }}" alt="TTD">@else<span class="sig-ln"></span>@endif</div>
                <p class="nm">({{ $d['pengaju_nama'] ?? $r['nama'] ?? '__________________' }})</p>
            </td>
            <td>
                <p class="cap">Disetujui oleh,<br>Kepala Bagian</p>
                <div class="sig-box">@if (! empty($r['signature_approver']))<img src="{{ $r['signature_approver'] }}" alt="TTD">@else<span class="sig-ln"></span>@endif</div>
                <p class="nm">({{ $approverName ?: '__________________' }})</p>
            </td>
        </tr>
    </table>
@endif

@if ($isFramed)</div>@endif
</body>
</html>
