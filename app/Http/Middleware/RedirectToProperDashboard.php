<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectToProperDashboard
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $route = $user->getDashboardRoute();
        $activeRole = $user->getActiveRole();

        if ($request->is('login', 'daftar', 'lupa-password')) {
            return redirect($route);
        }

        $request->attributes->set('dashboard_route', $route);
        $request->attributes->set('active_role', $activeRole);

        return $next($request);
    }
}
