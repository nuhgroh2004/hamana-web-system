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
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('kategori', 20);
            $table->string('judul')->nullable();
            $table->string('nama_file');
            $table->string('path');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('ukuran');
            $table->timestamp('diunggah_pada')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'kategori']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
    }
};
