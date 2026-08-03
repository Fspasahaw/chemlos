<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('chemlos:auto-cancel')->hourly();
Schedule::command('chemlos:send-reminders')->dailyAt('08:00');
Schedule::command('chemlos:backup-database')->weekly();
Schedule::command('queue:work --once --tries=3 --timeout=60')->everyMinute();
