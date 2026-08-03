<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401)
                : redirect('/login');
        }

        return match ($user->status) {
            'pending_email' => $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Email belum diverifikasi.', 'redirect' => '/verifikasi-email'], 403)
                : redirect('/verifikasi-email'),
            'pending_approval' => $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Akun menunggu persetujuan.', 'redirect' => '/menunggu-persetujuan'], 403)
                : redirect('/menunggu-persetujuan'),
            'rejected' => $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Akun ditolak.', 'data' => ['rejection_reason' => $user->rejection_reason], 'redirect' => '/akun-ditolak'], 403)
                : redirect('/akun-ditolak?reason=' . urlencode($user->rejection_reason ?? '')),
            'suspended' => $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Akun dinonaktifkan.', 'redirect' => '/akun-tidak-aktif'], 403)
                : redirect('/akun-tidak-aktif'),
            default => $next($request),
        };
    }
}
