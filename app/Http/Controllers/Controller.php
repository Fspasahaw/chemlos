<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use ReCaptcha\ReCaptcha;

abstract class Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function validateRecaptcha(Request $request, string $action): void
    {
        if (! config('services.recaptcha.enabled')) {
            return;
        }

        $token = $request->input('recaptcha_token');

        if (empty($token)) {
            throw ValidationException::withMessages([
                'recaptcha_token' => ['Verifikasi reCAPTCHA wajib diisi.'],
            ]);
        }

        $recaptcha = new ReCaptcha((string) config('services.recaptcha.secret_key'));
        $response = $recaptcha
            ->setScoreThreshold((float) config('services.recaptcha.score_threshold', 0.5))
            ->setExpectedAction($action)
            ->verify($token, $request->ip());

        if (! $response->isSuccess()) {
            throw ValidationException::withMessages([
                'recaptcha_token' => ['Verifikasi reCAPTCHA gagal. Silakan coba lagi.'],
            ]);
        }
    }
}
