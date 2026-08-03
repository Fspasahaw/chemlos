<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUrutanToVideoTutorial extends Migration
{
    public function up(): void
    {
        Schema::table('video_tutorial', function (Blueprint $table) {
            $table->integer('urutan')->default(0)->after('alat_id');
        });
    }

    public function down(): void
    {
        Schema::table('video_tutorial', function (Blueprint $table) {
            $table->dropColumn('urutan');
        });
    }
}
