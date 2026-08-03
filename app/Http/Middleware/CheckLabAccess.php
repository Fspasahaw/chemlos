<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckLabAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401)
                : redirect('/login');
        }

        $laboratorium = $request->route('laboratorium') ?? $request->route('laboratorium_id');

        if ($user->hasRole(['admin', 'pimpinan'])) {
            return $next($request);
        }

        if ($laboratorium && method_exists($user, 'laboratoriumPengelolas')) {
            $allowed = $user->laboratoriumPengelolas()
                ->where('laboratorium_id', $laboratorium instanceof \Illuminate\Database\Eloquent\Model ? $laboratorium->id : $laboratorium)
                ->exists();

            if (! $allowed) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses ke laboratorium ini.'], 403)
                    : redirect('/dashboard');
            }
        }

        return $next($request);
    }
}
