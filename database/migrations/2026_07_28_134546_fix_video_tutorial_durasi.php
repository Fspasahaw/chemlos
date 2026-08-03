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
            // Convert existing MM:SS or H:MM:SS strings to total seconds.
            DB::statement("UPDATE video_tutorial SET durasi = TIME_TO_SEC(STR_TO_DATE(durasi, '%i:%s')) WHERE durasi LIKE '%:%' AND durasi IS NOT NULL");
            DB::statement('ALTER TABLE video_tutorial MODIFY durasi INT UNSIGNED NULL');
        } else {
            // SQLite does not support TIME_TO_SEC/STR_TO_DATE; update manually.
            DB::table('video_tutorial')->whereNotNull('durasi')->get()->each(function ($row) {
                $durasi = $row->durasi;
                if (is_string($durasi) && str_contains($durasi, ':')) {
                    $parts = explode(':', $durasi);
                    if (count($parts) === 2) {
                        $seconds = ((int) $parts[0] * 60) + (int) $parts[1];
                        DB::table('video_tutorial')->where('id', $row->id)->update(['durasi' => $seconds]);
                    }
                }
            });
            Schema::table('video_tutorial', function (Blueprint $table) {
                $table->unsignedInteger('durasi')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE video_tutorial MODIFY durasi VARCHAR(20) NULL');
        } else {
            Schema::table('video_tutorial', function (Blueprint $table) {
                $table->string('durasi', 20)->nullable()->change();
            });
        }
    }
};
