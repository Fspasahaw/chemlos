<?php

namespace App\Providers;

use App\Models\Alat;
use App\Models\KategoriAlat;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\MaintenanceAlat;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use App\Models\Pengaturan;
use App\Models\Pengembalian;
use App\Models\ProgramStudi;
use App\Models\SerahTerima;
use App\Models\User;
use App\Models\VideoTutorial;
use App\Policies\AlatPolicy;
use App\Policies\KategoriAlatPolicy;
use App\Policies\KerusakanAlatPolicy;
use App\Policies\LaboratoriumPolicy;
use App\Policies\MaintenanceAlatPolicy;
use App\Policies\NotifikasiPolicy;
use App\Policies\PeminjamanPolicy;
use App\Policies\PengaturanPolicy;
use App\Policies\PengembalianPolicy;
use App\Policies\ProgramStudiPolicy;
use App\Policies\SerahTerimaPolicy;
use App\Policies\UserPolicy;
use App\Policies\VideoTutorialPolicy;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Spatie\Activitylog\Models\Activity;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(Registered::class, SendEmailVerificationNotification::class);

        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(ProgramStudi::class, ProgramStudiPolicy::class);
        Gate::policy(Laboratorium::class, LaboratoriumPolicy::class);
        Gate::policy(KategoriAlat::class, KategoriAlatPolicy::class);
        Gate::policy(Alat::class, AlatPolicy::class);
        Gate::policy(Peminjaman::class, PeminjamanPolicy::class);
        Gate::policy(Pengaturan::class, PengaturanPolicy::class);
        Gate::policy(KerusakanAlat::class, KerusakanAlatPolicy::class);
        Gate::policy(MaintenanceAlat::class, MaintenanceAlatPolicy::class);
        Gate::policy(Pengembalian::class, PengembalianPolicy::class);
        Gate::policy(SerahTerima::class, SerahTerimaPolicy::class);
        Gate::policy(Notifikasi::class, NotifikasiPolicy::class);
        Gate::policy(VideoTutorial::class, VideoTutorialPolicy::class);

        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('public', function ($request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        RateLimiter::for('auth', function ($request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // Di environment lokal, gunakan mailer failover agar tetap mencoba SMTP MailHog
        // terlebih dahulu, lalu fallback ke log jika MailHog tidak tersedia.
        if (app()->environment('local') && config('mail.default') === 'smtp' && config('mail.mailers.failover')) {
            config(['mail.default' => 'failover']);
        }

        Activity::saving(function ($activity) {
            if (app()->runningInConsole()) {
                return;
            }

            $activity->ip_address = request()->ip();
            $activity->user_agent = request()->userAgent();
        });
    }
}
