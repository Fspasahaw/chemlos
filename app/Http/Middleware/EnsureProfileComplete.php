<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $excluded = [
            'lengkapi-profil',
            'logout',
            'akun-tidak-aktif',
            'menunggu-persetujuan',
            'akun-ditolak',
            'verifikasi-email',
            'email/verify/*',
        ];

        foreach ($excluded as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        if (! $user->isProfileComplete()) {
            return $request->expectsJson()
                ? response()->json([
                    'success' => false,
                    'message' => 'Profil belum lengkap. Silakan lengkapi profil Anda.',
                    'redirect' => '/lengkapi-profil',
                ], 403)
                : redirect('/lengkapi-profil');
        }

        return $next($request);
    }
}
