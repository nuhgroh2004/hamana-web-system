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
        Schema::create('faskes_bpjs', function (Blueprint $table) {
            $table->id();
            $table->string('nama_provinsi')->nullable();
            $table->string('kantor_regional')->nullable();
            $table->string('kantor_cabang')->nullable();
            $table->string('kabupaten_kota')->nullable();
            $table->string('kode_ppk', 30)->nullable()->unique();
            $table->string('nama_ppk');
            $table->string('alamat_ppk')->nullable();
            $table->string('telp_ppk', 30)->nullable();
            $table->timestamps();

            $table->index(['nama_provinsi', 'kabupaten_kota']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faskes_bpjs');
    }
};
