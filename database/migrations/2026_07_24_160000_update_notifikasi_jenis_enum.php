<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifikasi', function (Blueprint $table) {
            $table->string('kategori', 100)->nullable()->after('jenis');
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement(<<<'SQL'
                UPDATE notifikasi
                SET kategori = jenis,
                    jenis = CASE
                        WHEN jenis LIKE '%kerusakan%' OR jenis LIKE '%terlambat%' OR jenis LIKE '%ditolak%' OR jenis LIKE '%dibatalkan%' OR jenis LIKE '%rusak%' THEN 'danger'
                        WHEN jenis LIKE '%pengingat%' OR jenis LIKE '%peringatan%' OR jenis LIKE '%maintenance%' OR jenis LIKE '%maintenance%' THEN 'warning'
                        WHEN jenis LIKE '%disetujui%' OR jenis LIKE '%selesai%' OR jenis LIKE '%diterima%' OR jenis LIKE '%sukses%' THEN 'success'
                        ELSE 'info'
                    END
                WHERE kategori IS NULL
SQL
            );

            DB::statement("ALTER TABLE notifikasi MODIFY jenis ENUM('info','success','warning','danger') NOT NULL DEFAULT 'info'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE notifikasi MODIFY jenis VARCHAR(100) NOT NULL');
            DB::statement('UPDATE notifikasi SET jenis = COALESCE(kategori, jenis)');
        }

        Schema::table('notifikasi', function (Blueprint $table) {
            $table->dropColumn('kategori');
        });
    }
};
