<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\NotifikasiService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $this->validateRecaptcha($request, 'register');

        $isDosen = $request->input('peran') === 'dosen';

        $data = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\'\-\.\,\/\(\)]+$/'],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
                Rule::when(! $isDosen, ['regex:/@ui\.ac\.id$/']),
                Rule::when($isDosen, ['regex:/@che\.ui\.ac\.id$/']),
            ],
            'npm_nip' => ['required', 'string', 'max:50', 'unique:users,npm_nip'],
            'no_hp' => ['required', 'string', 'max:20', 'regex:/^(\+62|62|0)\d{9,13}$/'],
            'password' => [
                'required',
                'confirmed',
                PasswordRule::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
            'peran' => ['required', 'in:mahasiswa,dosen'],
            'program_studi_id' => ['required_if:peran,mahasiswa', 'exists:program_studi,id'],
            'legal_consent' => ['required', 'accepted'],
        ]);

        $user = User::create([
            'name' => $data['nama_lengkap'],
            'nama_lengkap' => $data['nama_lengkap'],
            'email' => $data['email'],
            'npm_nip' => $data['npm_nip'],
            'no_hp' => $data['no_hp'],
            'password' => Hash::make($data['password']),
            'program_studi_id' => $isDosen ? null : ($data['program_studi_id'] ?? null),
            'status' => 'pending_email',
            'legal_consent_at' => now(),
            'legal_consent_ip' => $request->ip(),
        ]);

        $user->assignRole($data['peran']);

        event(new Registered($user));

        $admins = User::role('admin')->pluck('id');
        foreach ($admins as $adminId) {
            NotifikasiService::kirim(
                $adminId,
                'Pendaftaran Akun Baru',
                "Pengguna {$user->nama_lengkap} ({$user->email}) baru mendaftar dan menunggu verifikasi email.",
                'pendaftaran_baru',
                '/dashboard/admin/users'
            );
        }

        $laborans = User::role('laboran')->pluck('id');
        foreach ($laborans as $laboranId) {
            NotifikasiService::kirim(
                $laboranId,
                'Pendaftaran Akun Baru',
                "Pengguna {$user->nama_lengkap} ({$user->email}) baru mendaftar dan menunggu verifikasi email.",
                'pendaftaran_baru',
                '/dashboard/laboran/verifikasi-akun'
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil. Silakan verifikasi email Anda.',
            'data' => [
                'user_id' => $user->id,
                'status' => $user->status,
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $this->validateRecaptcha($request, 'login');

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang Anda masukkan tidak valid.'],
            ]);
        }

        return match ($user->status) {
            'pending_email' => response()->json([
                'success' => false,
                'message' => 'Email Anda belum diverifikasi.',
                'data' => ['email' => $user->email],
                'redirect' => '/verifikasi-email',
            ], 403),
            'pending_approval' => response()->json([
                'success' => false,
                'message' => 'Akun Anda masih menunggu persetujuan admin/laboran.',
                'redirect' => '/menunggu-persetujuan',
            ], 403),
            'rejected' => response()->json([
                'success' => false,
                'message' => 'Akun Anda ditolak.',
                'data' => ['rejection_reason' => $user->rejection_reason],
                'redirect' => '/akun-ditolak',
            ], 403),
            'suspended' => response()->json([
                'success' => false,
                'message' => 'Akun Anda dinonaktifkan.',
                'redirect' => '/akun-tidak-aktif',
            ], 403),
            default => $this->performSuccessfulLogin($request, $user, $credentials['remember'] ?? false),
        };
    }

    protected function performSuccessfulLogin(Request $request, User $user, bool $remember): JsonResponse
    {
        if ($request->hasSession()) {
            Auth::login($user, $remember);
            $request->session()->regenerate();
        }

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        activity()->performedOn($user)->causedBy($user)->log('Pengguna login');

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $user->load('roles:id,name'),
                'token' => $user->createToken('api')->plainTextToken,
                'redirect' => $this->dashboardRoute($user),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $user?->currentAccessToken()?->delete();

        if ($request->hasSession()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if ($user) {
            activity()->performedOn($user)->causedBy($user)->log('Pengguna logout');
        }

        if ($request->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil.',
            ]);
        }

        return redirect('/login')->with('success', 'Logout berhasil.');
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()?->load('roles:id,name'),
        ]);
    }

    public function completeProfile(Request $request): JsonResponse
    {
        $this->validateRecaptcha($request, 'complete_profile');

        $user = $request->user();

        $request->replace($this->normalizeEmptyStringsToNull($request->input()));

        $isMahasiswa = $user->hasRole('mahasiswa');

        $rules = [
            'no_hp' => [$isMahasiswa ? 'required' : 'nullable', 'string', 'max:20', 'regex:/^(\+62|62|0)\d{9,13}$/'],
            'tanggal_lahir' => [$isMahasiswa ? 'required' : 'nullable', 'date'],
            'jenis_kelamin' => [$isMahasiswa ? 'required' : 'nullable', 'in:L,P'],
            'alamat' => [$isMahasiswa ? 'required' : 'nullable', 'string'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];

        if ($isMahasiswa) {
            $rules['angkatan'] = ['required', 'integer', 'min:1900', 'max:2100'];
            $rules['semester'] = ['required', 'integer', 'min:1', 'max:20'];
            $rules['foto_ktm'] = ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'];
        } else {
            $rules['angkatan'] = ['nullable', 'integer', 'min:1900', 'max:2100'];
            $rules['semester'] = ['nullable', 'integer', 'min:1', 'max:20'];
            $rules['foto_ktm'] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'];
        }

        $data = $request->validate($rules);

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('profil', 'public');
        }

        if ($request->hasFile('foto_ktm')) {
            $data['foto_ktm'] = $request->file('foto_ktm')->store('ktm', 'public');
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil dilengkapi.',
            'data' => [
                'user' => $user->fresh(),
                'redirect' => $this->dashboardRoute($user),
            ],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->replace($this->normalizeEmptyStringsToNull($request->input()));

        $data = $request->validate([
            'nama_lengkap' => ['nullable', 'string', 'max:255'],
            'no_hp' => ['nullable', 'string', 'max:20', 'regex:/^(\+62|62|0)\d{9,13}$/'],
            'tanggal_lahir' => ['nullable', 'date'],
            'jenis_kelamin' => ['nullable', 'in:L,P'],
            'alamat' => ['nullable', 'string'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'tema_preferensi' => ['nullable', 'in:light,dark,system'],
            'bahasa_preferensi' => ['nullable', 'in:id,en'],
            'reduce_motion' => ['nullable', 'boolean'],
            'notifikasi_email' => ['nullable', 'boolean'],
            'notifikasi_whatsapp' => ['nullable', 'boolean'],
            'notifikasi_in_app' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('profil', 'public');
        }

        if (! empty($data['nama_lengkap'])) {
            $data['name'] = $data['nama_lengkap'];
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user->fresh(),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required',
                'confirmed',
                PasswordRule::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        $request->user()->update([
            'password' => Hash::make($data['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah.',
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $this->validateRecaptcha($request, 'forgot_password');

        $request->validate(['email' => ['required', 'email']]);

        Password::sendResetLink($request->only('email'));

        return response()->json([
            'success' => true,
            'message' => 'Jika email terdaftar, link reset password telah dikirim.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $this->validateRecaptcha($request, 'reset_password');

        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'confirmed',
                PasswordRule::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['success' => true, 'message' => 'Password berhasil direset.'])
            : response()->json(['success' => false, 'message' => __($status)], 422);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email sudah diverifikasi.',
                ], 422);
            }

            $user->sendEmailVerificationNotification();

            return response()->json([
                'success' => true,
                'message' => 'Email verifikasi telah dikirim ulang.',
            ]);
        }

        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $candidate = User::where('email', $request->input('email'))
            ->whereNull('email_verified_at')
            ->first();

        if ($candidate) {
            $candidate->sendEmailVerificationNotification();
        }

        return response()->json([
            'success' => true,
            'message' => 'Jika email terdaftar dan belum diverifikasi, link verifikasi telah dikirim ulang.',
        ]);
    }

    public function verifyEmail(Request $request, int $id, string $hash)
    {
        if (! $request->hasValidSignature()) {
            return redirect('/verifikasi-email')->with('error', 'Link verifikasi tidak valid atau sudah kadaluarsa.');
        }

        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect('/verifikasi-email')->with('error', 'Link verifikasi tidak valid.');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect('/login')->with('success', 'Email sudah diverifikasi. Silakan masuk.');
        }

        $user->markEmailAsVerified();
        $user->update(['status' => 'pending_approval']);

        event(new Verified($user));

        NotifikasiService::kirim(
            $user,
            'Email Terverifikasi',
            'Email Anda telah terverifikasi. Akun sedang menunggu persetujuan admin/laboran.',
            'email_terverifikasi',
            '/login',
            [],
            ['no_email']
        );

        $adminIds = User::role(['admin', 'laboran'])->pluck('id');
        foreach ($adminIds as $adminId) {
            NotifikasiService::kirim(
                $adminId,
                'Pendaftaran Akun Baru',
                "Pengguna {$user->nama_lengkap} ({$user->email}) telah memverifikasi email dan menunggu persetujuan.",
                'pendaftaran_baru',
                '/dashboard/admin/users'
            );
        }

        return redirect('/login')->with('success', 'Email berhasil diverifikasi. Akun sedang ditinjau admin.');
    }

    protected function dashboardRoute(User $user): string
    {
        if ($user->hasRole('mahasiswa') && ! $user->isProfileComplete()) {
            return '/lengkapi-profil';
        }

        return $user->getDashboardRoute();
    }

    protected function normalizeEmptyStringsToNull(array $input): array
    {
        foreach ($input as $key => $value) {
            if (is_string($value) && $value === '') {
                $input[$key] = null;
            }
        }

        return $input;
    }

};
