<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->unique()->constrained()->cascadeOnDelete();

            // Identitas pribadi.
            $table->string('jenis_kelamin', 20)->nullable();
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('agama', 50)->nullable();
            $table->string('status_nikah', 30)->nullable();
            $table->unsignedSmallInteger('jumlah_anak')->nullable();

            // Kepegawaian.
            $table->string('departemen')->nullable();
            $table->date('tanggal_gabung')->nullable();

            // Kontak dan alamat.
            $table->string('email')->nullable();
            $table->string('no_hp_1', 30)->nullable();
            $table->string('no_hp_2', 30)->nullable();
            $table->text('alamat_ktp')->nullable();
            $table->text('alamat_domisili')->nullable();
            $table->string('status_rumah', 50)->nullable();

            // Identitas dan jaminan.
            $table->string('no_ktp', 30)->nullable();
            $table->string('no_passport', 30)->nullable();
            $table->string('npwp', 30)->nullable();
            $table->string('bpjs_ketenagakerjaan', 30)->nullable();
            $table->string('bpjs_kesehatan', 30)->nullable();
            $table->string('rekening_mandiri', 50)->nullable();

            // Faskes tingkat I.
            $table->boolean('faskes_terpilih')->default(false);
            $table->string('faskes_provinsi')->nullable();
            $table->string('faskes_kantor_regional')->nullable();
            $table->string('faskes_kantor_cabang')->nullable();
            $table->string('faskes_kabupaten_kota')->nullable();
            $table->string('faskes_kode_ppk', 30)->nullable();
            $table->string('faskes_nama_ppk')->nullable();
            $table->string('faskes_alamat_ppk')->nullable();
            $table->string('faskes_telp_ppk', 30)->nullable();

            // Kode grup.
            $table->string('code_grup_pajak', 20)->nullable();
            $table->string('code_grup_status_nikah', 20)->nullable();
            $table->string('code_status_pajak', 20)->nullable();

            // Kontak darurat.
            $table->string('darurat_nama_1')->nullable();
            $table->string('darurat_telp_1', 30)->nullable();
            $table->string('darurat_hubungan_1')->nullable();
            $table->string('darurat_nama_2')->nullable();
            $table->string('darurat_telp_2', 30)->nullable();
            $table->string('darurat_hubungan_2')->nullable();

            // Media sosial.
            $table->string('facebook')->nullable();
            $table->string('instagram')->nullable();
            $table->string('twitter')->nullable();

            $table->string('foto_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
    }
};
