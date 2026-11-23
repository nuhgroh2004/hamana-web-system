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
        Schema::create('employee_physicals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('warna_kulit')->nullable();
            $table->string('golongan_darah', 5)->nullable();
            $table->string('warna_rambut')->nullable();
            $table->string('ukuran_baju', 20)->nullable();
            $table->string('warna_mata')->nullable();
            $table->string('ukuran_celana', 20)->nullable();
            $table->decimal('tinggi_badan', 5, 2)->nullable();
            $table->string('ukuran_sepatu', 20)->nullable();
            $table->decimal('berat_badan', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_physicals');
    }
};
