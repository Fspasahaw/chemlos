<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401)
                : redirect('/login');
        }

        if (! $user->hasAnyRole($roles)) {
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403)
                : redirect('/dashboard');
        }

        return $next($request);
    }
}
