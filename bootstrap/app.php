<?php

use App\Http\Middleware\CheckLabAccess;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\EnsureAccountIsApproved;
use App\Http\Middleware\EnsureEmailIsVerified;
use App\Http\Middleware\EnsureProfileComplete;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectToProperDashboard;
use Illuminate\Foundation\Application;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            RedirectToProperDashboard::class,
        ]);

        $middleware->alias([
            'verified.email' => EnsureEmailIsVerified::class,
            'approved' => EnsureAccountIsApproved::class,
            'profile.complete' => EnsureProfileComplete::class,
            'role' => CheckRole::class,
            'lab.access' => CheckLabAccess::class,
            'role.dashboard' => RedirectToProperDashboard::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->renderable(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $e instanceof ValidationException || $e instanceof AuthenticationException || $e instanceof AuthorizationException) {
                return null;
            }

            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;

            if (! in_array($status, [403, 404, 419, 429, 500, 503], true)) {
                $status = 500;
            }

            return Inertia::render('Error', ['status' => $status, 'message' => $e->getMessage()])
                ->toResponse($request)
                ->setStatusCode($status);
        });
    })->create();
