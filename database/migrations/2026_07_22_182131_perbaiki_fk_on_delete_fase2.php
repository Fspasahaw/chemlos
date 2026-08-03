<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // alat
        Schema::table('alat', function (Blueprint $table) {
            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('restrict');
        });

        // alat_dokumen
        Schema::table('alat_dokumen', function (Blueprint $table) {
            $table->dropForeign(['alat_id']);
            $table->foreign('alat_id')->references('id')->on('alat')->onDelete('restrict');
        });

        // alat_galeri
        Schema::table('alat_galeri', function (Blueprint $table) {
            $table->dropForeign(['alat_id']);
            $table->foreign('alat_id')->references('id')->on('alat')->onDelete('restrict');
        });

        // kerusakan_alat
        Schema::table('kerusakan_alat', function (Blueprint $table) {
            $table->dropForeign(['alat_id']);
            $table->foreign('alat_id')->references('id')->on('alat')->onDelete('restrict');

            $table->dropForeign(['pelapor_user_id']);
            $table->foreign('pelapor_user_id')->references('id')->on('users')->onDelete('restrict');
        });

        // laboratorium_dokumen
        Schema::table('laboratorium_dokumen', function (Blueprint $table) {
            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('restrict');
        });

        // laboratorium_galeri
        Schema::table('laboratorium_galeri', function (Blueprint $table) {
            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('restrict');
        });

        // laboratorium_pengelola
        Schema::table('laboratorium_pengelola', function (Blueprint $table) {
            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('restrict');

            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
        });

        // maintenance_alat
        Schema::table('maintenance_alat', function (Blueprint $table) {
            $table->dropForeign(['alat_id']);
            $table->foreign('alat_id')->references('id')->on('alat')->onDelete('restrict');

            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('restrict');

            $table->dropForeign(['laboran_id']);
            $table->foreign('laboran_id')->references('id')->on('users')->onDelete('restrict');
        });

        // notifikasi
        Schema::table('notifikasi', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
        });

        // peminjaman
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('restrict');

            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
        });

        // peminjaman_detail
        Schema::table('peminjaman_detail', function (Blueprint $table) {
            $table->dropForeign(['peminjaman_id']);
            $table->foreign('peminjaman_id')->references('id')->on('peminjaman')->onDelete('restrict');

            $table->dropForeign(['alat_id']);
            $table->foreign('alat_id')->references('id')->on('alat')->onDelete('restrict');
        });

        // pengembalian
        Schema::table('pengembalian', function (Blueprint $table) {
            $table->dropForeign(['peminjaman_id']);
            $table->foreign('peminjaman_id')->references('id')->on('peminjaman')->onDelete('restrict');

            $table->dropForeign(['laboran_id']);
            $table->foreign('laboran_id')->references('id')->on('users')->onDelete('restrict');
        });

        // serah_terima
        Schema::table('serah_terima', function (Blueprint $table) {
            $table->dropForeign(['peminjaman_id']);
            $table->foreign('peminjaman_id')->references('id')->on('peminjaman')->onDelete('restrict');

            $table->dropForeign(['laboran_id']);
            $table->foreign('laboran_id')->references('id')->on('users')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('alat', function (Blueprint $table) {
            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('cascade');
        });

        Schema::table('alat_dokumen', function (Blueprint $table) {
            $table->dropForeign(['alat_id']);
            $table->foreign('alat_id')->references('id')->on('alat')->onDelete('cascade');
        });

        Schema::table('alat_galeri', function (Blueprint $table) {
            $table->dropForeign(['alat_id']);
            $table->foreign('alat_id')->references('id')->on('alat')->onDelete('cascade');
        });

        Schema::table('kerusakan_alat', function (Blueprint $table) {
            $table->dropForeign(['alat_id']);
            $table->foreign('alat_id')->references('id')->on('alat')->onDelete('cascade');

            $table->dropForeign(['pelapor_user_id']);
            $table->foreign('pelapor_user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('laboratorium_dokumen', function (Blueprint $table) {
            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('cascade');
        });

        Schema::table('laboratorium_galeri', function (Blueprint $table) {
            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('cascade');
        });

        Schema::table('laboratorium_pengelola', function (Blueprint $table) {
            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('cascade');

            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('maintenance_alat', function (Blueprint $table) {
            $table->dropForeign(['alat_id']);
            $table->foreign('alat_id')->references('id')->on('alat')->onDelete('cascade');

            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('cascade');

            $table->dropForeign(['laboran_id']);
            $table->foreign('laboran_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('notifikasi', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('peminjaman', function (Blueprint $table) {
            $table->dropForeign(['laboratorium_id']);
            $table->foreign('laboratorium_id')->references('id')->on('laboratorium')->onDelete('cascade');

            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('peminjaman_detail', function (Blueprint $table) {
            $table->dropForeign(['peminjaman_id']);
            $table->foreign('peminjaman_id')->references('id')->on('peminjaman')->onDelete('cascade');

            $table->dropForeign(['alat_id']);
            $table->foreign('alat_id')->references('id')->on('alat')->onDelete('cascade');
        });

        Schema::table('pengembalian', function (Blueprint $table) {
            $table->dropForeign(['peminjaman_id']);
            $table->foreign('peminjaman_id')->references('id')->on('peminjaman')->onDelete('cascade');

            $table->dropForeign(['laboran_id']);
            $table->foreign('laboran_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('serah_terima', function (Blueprint $table) {
            $table->dropForeign(['peminjaman_id']);
            $table->foreign('peminjaman_id')->references('id')->on('peminjaman')->onDelete('cascade');

            $table->dropForeign(['laboran_id']);
            $table->foreign('laboran_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
