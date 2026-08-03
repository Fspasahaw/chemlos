<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Mahasiswa\PeminjamanController as MahasiswaPeminjamanController;
use App\Http\Controllers\NotifikasiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:api')->group(function () {
    // Auth
    Route::post('/auth/register', [AuthController::class, 'register'])->name('api.auth.register')->middleware('throttle:auth');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('api.auth.login')->middleware('throttle:auth');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->name('api.auth.forgot-password')->middleware('throttle:auth');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->name('api.auth.reset-password')->middleware('throttle:auth');
    Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification'])
        ->middleware('throttle:auth')
        ->name('api.auth.resend-verification');

    Route::middleware(['auth:sanctum', 'approved'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
        Route::get('/auth/me', [AuthController::class, 'me'])->name('api.auth.me');
        Route::put('/auth/me', [AuthController::class, 'updateProfile'])->name('api.auth.update-profile');
        Route::post('/auth/complete-profile', [AuthController::class, 'completeProfile'])->name('api.auth.complete-profile');
        Route::post('/auth/change-password', [AuthController::class, 'changePassword'])->name('api.auth.change-password');

        Route::get('/alat/{alat}/availability', [MahasiswaPeminjamanController::class, 'ketersediaan'])->name('api.alat.availability');
    });

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware(['auth:sanctum', 'approved']);

    Route::middleware(['web', 'auth:web,sanctum', 'approved'])->group(function () {
        Route::get('/notifikasi', [NotifikasiController::class, 'apiIndex'])->name('api.notifikasi.index');
        Route::get('/notifikasi/unread-count', [NotifikasiController::class, 'unreadCount'])->name('api.notifikasi.unread-count');
        Route::post('/notifikasi/{notifikasi}/read', [NotifikasiController::class, 'read'])->name('api.notifikasi.read');
        Route::post('/notifikasi/read-all', [NotifikasiController::class, 'markAllRead'])->name('api.notifikasi.read-all');
    });
});
