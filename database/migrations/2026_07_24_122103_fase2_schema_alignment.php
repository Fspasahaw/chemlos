<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel pesan kontak yang belum ada
        Schema::create('kontak_pesan', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 255);
            $table->string('email', 255);
            $table->string('subjek', 255);
            $table->text('pesan');
            $table->enum('status', ['baru', 'dibaca', 'dijawab'])->default('baru');
            $table->timestamps();
        });

        // 2. Tabel tata tertib laboratorium yang belum ada
        Schema::create('laboratorium_tata_tertib', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laboratorium_id')->constrained('laboratorium')->cascadeOnDelete();
            $table->integer('urutan')->default(0);
            $table->text('isi');
            $table->timestamps();
        });

        // 3. Soft delete untuk tabel yang membutuhkannya sesuai spesifikasi
        Schema::table('kategori_alat', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('video_tutorial', function (Blueprint $table) {
            $table->softDeletes();
        });

        // 4. Kolom denda pada peminjaman yang belum ada
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->decimal('total_denda', 15, 2)->default(0.00)->after('catatan');
            $table->decimal('denda_dibayar', 15, 2)->default(0.00)->after('total_denda');
        });

        // 5. Detail kondisi & denda pada pengembalian
        Schema::table('pengembalian', function (Blueprint $table) {
            $table->json('kondisi_alat')->nullable()->after('foto_kondisi');
            $table->decimal('denda_keterlambatan', 15, 2)->default(0.00)->after('keterlambatan_menit');
            $table->decimal('denda_kerusakan', 15, 2)->default(0.00)->after('denda_keterlambatan');
        });

        // 6. Kondisi alat saat serah terima
        Schema::table('serah_terima', function (Blueprint $table) {
            $table->json('kondisi_alat')->nullable()->after('foto_bukti');
        });

        // 7. Menyelaraskan nama kolom alat dengan spesifikasi
        Schema::table('alat', function (Blueprint $table) {
            $table->string('qr_kode_path', 255)->nullable()->after('foto_utama');
        });
        DB::table('alat')->update(['qr_kode_path' => DB::raw('qr_code')]);
        Schema::table('alat', function (Blueprint $table) {
            $table->dropColumn('qr_code');
        });

        Schema::table('alat', function (Blueprint $table) {
            $table->boolean('pelatihan_wajib')->default(false)->after('persyaratan_khusus');
        });
        DB::table('alat')->update(['pelatihan_wajib' => DB::raw('wajib_pelatihan')]);
        Schema::table('alat', function (Blueprint $table) {
            $table->dropColumn('wajib_pelatihan');
        });

        // 8. Menyelaraskan nama kolom pelapor pada kerusakan alat
        Schema::table('kerusakan_alat', function (Blueprint $table) {
            $table->dropForeign(['pelapor_user_id']);
        });
        Schema::table('kerusakan_alat', function (Blueprint $table) {
            $table->unsignedBigInteger('pelapor_id')->nullable()->after('peminjaman_id');
        });
        DB::table('kerusakan_alat')->update(['pelapor_id' => DB::raw('pelapor_user_id')]);
        Schema::table('kerusakan_alat', function (Blueprint $table) {
            $table->dropColumn('pelapor_user_id');
            $table->foreign('pelapor_id')->references('id')->on('users')->cascadeOnDelete();
        });
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE kerusakan_alat MODIFY pelapor_id BIGINT UNSIGNED NOT NULL');
        }

        // 9. Menyelaraskan tipe durasi dan enum sumber video_tutorial
        DB::table('video_tutorial')->where('sumber', 'url')->update(['sumber' => 'url_eksternal']);
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE video_tutorial MODIFY durasi VARCHAR(20) NULL');
            DB::statement("ALTER TABLE video_tutorial MODIFY sumber ENUM('youtube','url_eksternal','upload') NOT NULL");
        }
    }

    public function down(): void
    {
        // 9. Revert video_tutorial
        DB::table('video_tutorial')->where('sumber', 'url_eksternal')->update(['sumber' => 'url']);
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE video_tutorial MODIFY sumber ENUM('youtube','url','upload') NOT NULL");
            DB::statement('ALTER TABLE video_tutorial MODIFY durasi INT UNSIGNED NULL');
        }

        // 8. Revert kerusakan_alat
        Schema::table('kerusakan_alat', function (Blueprint $table) {
            $table->dropForeign(['pelapor_id']);
            $table->unsignedBigInteger('pelapor_user_id')->nullable()->after('peminjaman_id');
        });
        DB::table('kerusakan_alat')->update(['pelapor_user_id' => DB::raw('pelapor_id')]);
        Schema::table('kerusakan_alat', function (Blueprint $table) {
            $table->dropColumn('pelapor_id');
            $table->foreign('pelapor_user_id')->references('id')->on('users')->cascadeOnDelete();
        });
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE kerusakan_alat MODIFY pelapor_user_id BIGINT UNSIGNED NOT NULL');
        }

        // 7. Revert alat
        Schema::table('alat', function (Blueprint $table) {
            $table->string('qr_code', 255)->nullable()->after('foto_utama');
        });
        DB::table('alat')->update(['qr_code' => DB::raw('qr_kode_path')]);
        Schema::table('alat', function (Blueprint $table) {
            $table->dropColumn('qr_kode_path');
        });

        Schema::table('alat', function (Blueprint $table) {
            $table->boolean('wajib_pelatihan')->default(false)->after('persyaratan_khusus');
        });
        DB::table('alat')->update(['wajib_pelatihan' => DB::raw('pelatihan_wajib')]);
        Schema::table('alat', function (Blueprint $table) {
            $table->dropColumn('pelatihan_wajib');
        });

        // 6. Drop serah_terima kondisi_alat
        Schema::table('serah_terima', function (Blueprint $table) {
            $table->dropColumn('kondisi_alat');
        });

        // 5. Drop pengembalian detail
        Schema::table('pengembalian', function (Blueprint $table) {
            $table->dropColumn(['kondisi_alat', 'denda_keterlambatan', 'denda_kerusakan']);
        });

        // 4. Drop peminjaman denda
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->dropColumn(['total_denda', 'denda_dibayar']);
        });

        // 3. Drop soft deletes
        Schema::table('video_tutorial', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('kategori_alat', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        // 2 & 1. Drop new tables
        Schema::dropIfExists('laboratorium_tata_tertib');
        Schema::dropIfExists('kontak_pesan');
    }
};
