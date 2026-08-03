<?php

namespace App\Http\Middleware;

use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    protected function settings(): array
    {
        return Cache::remember('app_settings', 60, function () {
            try {
                return Pengaturan::all()->mapWithKeys(fn ($s) => ["{$s->grup}.{$s->key}" => $s->value])->toArray();
            } catch (\Throwable $e) {
                return [];
            }
        });
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => fn () => [
                'user' => $request->user() ? array_merge(
                    $request->user()->load('roles:id,name')->toArray(),
                    [
                        'unread_notifications_count' => $request->user()->notifications()->unread()->count(),
                        'active_role' => $request->user()->getActiveRole(),
                        'dashboard_route' => $request->attributes->get('dashboard_route') ?? $request->user()->getDashboardRoute(),
                    ]
                ) : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'ziggy' => fn () => [
                'url' => url('/'),
            ],
            'settings' => $this->settings(),
            'features' => config('chemlos.features', []),
            'recaptcha' => [
                'enabled' => (bool) config('services.recaptcha.enabled'),
                'site_key' => config('services.recaptcha.site_key'),
            ],
        ]);
    }
}
