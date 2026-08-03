<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE peminjaman_status_log MODIFY status_dari VARCHAR(50) NULL');
            DB::statement('ALTER TABLE peminjaman_status_log MODIFY status_ke VARCHAR(50) NOT NULL');
        } else {
            Schema::table('peminjaman_status_log', function (Blueprint $table) {
                $table->string('status_dari', 50)->nullable()->change();
                $table->string('status_ke', 50)->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            $statuses = "'diajukan','menunggu_dosen','menunggu_laboran','disetujui','berlangsung','selesai','ditolak','dibatalkan','terlambat'";
            DB::statement("ALTER TABLE peminjaman_status_log MODIFY status_dari ENUM({$statuses}) NULL");
            DB::statement("ALTER TABLE peminjaman_status_log MODIFY status_ke ENUM({$statuses}) NOT NULL");
        } else {
            Schema::table('peminjaman_status_log', function (Blueprint $table) {
                $table->enum('status_dari', ['diajukan','menunggu_dosen','menunggu_laboran','disetujui','berlangsung','selesai','ditolak','dibatalkan','terlambat'])->nullable()->change();
                $table->enum('status_ke', ['diajukan','menunggu_dosen','menunggu_laboran','disetujui','berlangsung','selesai','ditolak','dibatalkan','terlambat'])->change();
            });
        }
    }
};
