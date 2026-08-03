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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('notifikasi_email')->default(true)->after('reduce_motion');
            $table->boolean('notifikasi_whatsapp')->default(true)->after('notifikasi_email');
            $table->boolean('notifikasi_in_app')->default(true)->after('notifikasi_whatsapp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['notifikasi_email', 'notifikasi_whatsapp', 'notifikasi_in_app']);
        });
    }
};
