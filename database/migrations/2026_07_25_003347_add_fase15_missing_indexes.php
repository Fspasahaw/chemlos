<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alat', function (Blueprint $table) {
            $table->index('status');
            $table->index('kondisi');
        });

        Schema::table('peminjaman', function (Blueprint $table) {
            $table->index('dosen_pembimbing_id', 'peminjaman_dosen_pembimbing_idx');
            $table->index('tanggal_mulai', 'peminjaman_tanggal_mulai_idx');
        });

        Schema::table('peminjaman_detail', function (Blueprint $table) {
            $table->index('peminjaman_id', 'peminjaman_detail_peminjaman_id_idx');
            $table->index('alat_id', 'peminjaman_detail_alat_id_idx');
        });

        Schema::table('kerusakan_alat', function (Blueprint $table) {
            $table->index('alat_id', 'kerusakan_alat_alat_id_idx');
            $table->index('peminjaman_id', 'kerusakan_alat_peminjaman_id_idx');
            $table->index('pelapor_id', 'kerusakan_alat_pelapor_id_idx');
        });

        Schema::table('maintenance_alat', function (Blueprint $table) {
            $table->index('status', 'maintenance_alat_status_idx');
            $table->index('tanggal_mulai', 'maintenance_alat_tanggal_mulai_idx');
        });

        Schema::table('notifikasi', function (Blueprint $table) {
            $table->index('dibaca_pada', 'notifikasi_dibaca_pada_idx');
            $table->index('created_at', 'notifikasi_created_at_idx');
        });

        Schema::table('pengaturan', function (Blueprint $table) {
            $table->index('key', 'pengaturan_key_idx');
            $table->index('grup', 'pengaturan_grup_idx');
        });
    }

    public function down(): void
    {
        Schema::table('alat', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['kondisi']);
        });

        Schema::table('peminjaman', function (Blueprint $table) {
            $table->dropIndex('peminjaman_dosen_pembimbing_idx');
            $table->dropIndex('peminjaman_tanggal_mulai_idx');
        });

        Schema::table('peminjaman_detail', function (Blueprint $table) {
            $table->dropIndex('peminjaman_detail_peminjaman_id_idx');
            $table->dropIndex('peminjaman_detail_alat_id_idx');
        });

        Schema::table('kerusakan_alat', function (Blueprint $table) {
            $table->dropIndex('kerusakan_alat_alat_id_idx');
            $table->dropIndex('kerusakan_alat_peminjaman_id_idx');
            $table->dropIndex('kerusakan_alat_pelapor_id_idx');
        });

        Schema::table('maintenance_alat', function (Blueprint $table) {
            $table->dropIndex('maintenance_alat_status_idx');
            $table->dropIndex('maintenance_alat_tanggal_mulai_idx');
        });

        Schema::table('notifikasi', function (Blueprint $table) {
            $table->dropIndex('notifikasi_dibaca_pada_idx');
            $table->dropIndex('notifikasi_created_at_idx');
        });

        Schema::table('pengaturan', function (Blueprint $table) {
            $table->dropIndex('pengaturan_key_idx');
            $table->dropIndex('pengaturan_grup_idx');
        });
    }
};
