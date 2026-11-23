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
        Schema::table('employees', function (Blueprint $table) {
            $table->string('ref_id', 50)->nullable()->after('id')->index();
            $table->string('tingkat', 100)->nullable()->after('status_pegawai');
            $table->string('golongan', 100)->nullable()->after('tingkat');
        });

        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->string('propinsi', 100)->nullable()->after('alamat_domisili');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->dropColumn('propinsi');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['ref_id', 'tingkat', 'golongan']);
        });
    }
};
