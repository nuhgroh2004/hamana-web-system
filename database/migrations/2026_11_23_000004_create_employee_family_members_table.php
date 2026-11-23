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
        Schema::create('employee_family_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('hubungan', 30);
            $table->unsignedSmallInteger('urutan')->default(1);
            $table->string('nama')->nullable();
            $table->unsignedTinyInteger('usia')->nullable();
            $table->string('pekerjaan')->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['employee_id', 'hubungan', 'urutan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_family_members');
    }
};
