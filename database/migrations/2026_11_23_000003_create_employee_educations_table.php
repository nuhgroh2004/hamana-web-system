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
        Schema::create('employee_educations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('jenjang', 30);
            $table->string('nama_sekolah')->nullable();
            $table->string('jurusan')->nullable();
            $table->string('tahun', 10)->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['employee_id', 'jenjang']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_educations');
    }
};
