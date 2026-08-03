<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('kategori_alat', function (Blueprint $table) {
            $table->string('kode', 50)->nullable()->after('nama');
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif')->after('deskripsi');
        });

        // Backfill kode untuk data yang sudah ada.
        foreach (DB::table('kategori_alat')->whereNull('kode')->get() as $row) {
            $kode = strtoupper(Str::substr(str_replace(' ', '', $row->nama), 0, 5));
            DB::table('kategori_alat')->where('id', $row->id)->update(['kode' => $kode, 'status' => 'aktif']);
        }

        Schema::table('kategori_alat', function (Blueprint $table) {
            $table->string('kode', 50)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kategori_alat', function (Blueprint $table) {
            $table->dropColumn(['kode', 'status']);
        });
    }
};
