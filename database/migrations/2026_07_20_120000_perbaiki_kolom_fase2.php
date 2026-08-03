<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('activity_log', 'ip_address')) {
            Schema::table('activity_log', function (Blueprint $table) {
                $table->string('ip_address', 45)->nullable()->after('properties');
                $table->text('user_agent')->nullable()->after('ip_address');
            });
        }

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE users MODIFY nama_lengkap VARCHAR(255) NOT NULL');
            DB::statement('ALTER TABLE users MODIFY npm_nip VARCHAR(50) NOT NULL');
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('activity_log', 'ip_address')) {
            Schema::table('activity_log', function (Blueprint $table) {
                $table->dropColumn(['ip_address', 'user_agent']);
            });
        }

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE users MODIFY nama_lengkap VARCHAR(255) NULL');
            DB::statement('ALTER TABLE users MODIFY npm_nip VARCHAR(50) NULL');
        }
    }
};
