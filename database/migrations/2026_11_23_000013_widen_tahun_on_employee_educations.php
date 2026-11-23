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
        Schema::table('employee_educations', function (Blueprint $table) {
            // Template HR mengizinkan rentang tahun, mis. "2007 - 2012".
            $table->string('tahun', 50)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_educations', function (Blueprint $table) {
            $table->string('tahun', 10)->nullable()->change();
        });
    }
};
