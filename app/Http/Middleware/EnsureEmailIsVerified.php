<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->hasVerifiedEmail()) {
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Email belum diverifikasi.', 'redirect' => '/verifikasi-email'], 403)
                : redirect('/verifikasi-email');
        }

        return $next($request);
    }
}
