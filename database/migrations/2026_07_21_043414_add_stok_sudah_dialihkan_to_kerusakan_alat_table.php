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
        Schema::table('kerusakan_alat', function (Blueprint $table) {
            $table->boolean('stok_sudah_dialihkan')->default(false)->after('foto');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kerusakan_alat', function (Blueprint $table) {
            $table->dropColumn('stok_sudah_dialihkan');
        });
    }
};
