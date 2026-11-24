<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permohonan_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('form_type');
            $table->string('nomor')->nullable();
            $table->string('status')->default('draft');
            $table->date('tanggal_pengajuan')->nullable();
            $table->json('form_data')->nullable();
            $table->longText('signature_applicant')->nullable();
            $table->longText('signature_approver')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['approver_id', 'status']);
        });

        Schema::create('permohonan_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permohonan_request_id')->constrained('permohonan_requests')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permohonan_attachments');
        Schema::dropIfExists('permohonan_requests');
    }
};

