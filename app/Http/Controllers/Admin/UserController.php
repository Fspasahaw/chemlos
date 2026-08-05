<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use App\Models\PeminjamanStatusLog;
use App\Models\ProgramStudi;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('Dashboard/Admin/User/Index', [
            'items' => User::with('roles:id,name')
                ->when($request->search, fn ($q, $s) => $q->where(function ($qq) use ($s) {
                    $qq->where('nama_lengkap', 'like', "%{$s}%")
                        ->orWhere('email', 'like', "%{$s}%")
                        ->orWhere('npm_nip', 'like', "%{$s}%");
                }))
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->when($request->role, fn ($q, $r) => $q->role($r))
                ->orderByDesc('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search', 'status', 'role'),
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function verifikasi(Request $request)
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('Dashboard/Admin/User/Verifikasi', [
            'items' => User::with('roles:id,name')
                ->whereIn('status', ['pending_email', 'pending_approval', 'rejected'])
                ->when($request->search, fn ($q, $s) => $q->where(function ($qq) use ($s) {
                    $qq->where('nama_lengkap', 'like', "%{$s}%")
                        ->orWhere('email', 'like', "%{$s}%")
                        ->orWhere('npm_nip', 'like', "%{$s}%");
                }))
                ->orderByDesc('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $this->authorize('create', User::class);

        return Inertia::render('Dashboard/Admin/User/Create', [
            'roles' => Role::orderBy('name')->pluck('name'),
            'programStudi' => ProgramStudi::aktif()->get(['id', 'nama', 'jenjang']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $data = $this->validateUserForm($request);

        $data['name'] = $data['nama_lengkap'];
        $data['password'] = Hash::make($data['password']);
        $data = array_merge($data, $this->statusFields($data['status']));

        $user = User::create($data);
        $user->syncRoles($data['roles']);

        if (! empty($data['laboratorium_id']) && $user->hasAnyRole(['laboran', 'kepala_lab'])) {
            $user->laboratoriumPengelolas()->create([
                'laboratorium_id' => $data['laboratorium_id'],
                'peran' => $user->hasRole('kepala_lab') ? 'kepala_lab' : 'laboran',
                'is_primary' => false,
            ]);
        }

        activity()->performedOn($user)->withProperties(['roles' => $data['roles']])->log('Pengguna ditambahkan');

        return redirect()->route('admin.users.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        $riwayat = [
            'peminjaman' => Peminjaman::with('laboratorium:id,nama', 'details.alat:id,nama')
                ->where('user_id', $user->id)
                ->latest()
                ->limit(20)
                ->get(),
            'persetujuan' => PeminjamanStatusLog::with('peminjaman.user:id,nama_lengkap', 'peminjaman.laboratorium:id,nama')
                ->where('user_id', $user->id)
                ->whereIn('status_ke', ['menunggu_laboran', 'disetujui'])
                ->latest()
                ->limit(20)
                ->get(),
            'aktivitas' => Activity::where('causer_type', User::class)->where('causer_id', $user->id)->latest()->limit(20)->get(),
        ];

        return Inertia::render('Dashboard/Admin/User/Show', [
            'item' => $user->load('roles:id,name', 'programStudi:id,nama', 'laboratoriumPengelolas.laboratorium:id,nama'),
            'riwayat' => $riwayat,
        ]);
    }

    public function edit(User $user)
    {
        $this->authorize('update', $user);

        return Inertia::render('Dashboard/Admin/User/Edit', [
            'item' => $user->load('roles:id,name'),
            'roles' => Role::orderBy('name')->pluck('name'),
            'programStudi' => ProgramStudi::aktif()->get(['id', 'nama', 'jenjang']),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $data = $this->validateUserForm($request, $user);

        $data['name'] = $data['nama_lengkap'];
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $data = array_merge($data, $this->statusFields($data['status'], $user));

        $user->update($data);
        $user->syncRoles($data['roles']);

        if (! empty($data['laboratorium_id']) && $user->hasAnyRole(['laboran', 'kepala_lab'])) {
            $user->laboratoriumPengelolas()->delete();
            $user->laboratoriumPengelolas()->create([
                'laboratorium_id' => $data['laboratorium_id'],
                'peran' => $user->hasRole('kepala_lab') ? 'kepala_lab' : 'laboran',
                'is_primary' => false,
            ]);
        }

        activity()->performedOn($user)->withProperties(['roles' => $data['roles'], 'status' => $data['status']])->log('Pengguna diperbarui');

        return redirect()->route('admin.users.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        activity()->performedOn($user)->log('Pengguna dihapus');
        $user->delete();

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }

    public function verify(User $user)
    {
        $this->authorize('approve', $user);

        $user->forceFill([
            'status' => 'approved',
            'email_verified_at' => $user->email_verified_at ?? now(),
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ])->save();

        NotifikasiService::kirim(
            $user,
            'Akun Disetujui',
            'Selamat, akun ChemLOS Anda telah aktif. Silakan login untuk mulai menggunakan sistem.',
            'akun_disetujui',
            '/login'
        );

        activity()->performedOn($user)->log('Pengguna disetujui');

        return back()->with('success', 'Akun berhasil disetujui.');
    }

    public function reject(Request $request, User $user)
    {
        $this->authorize('reject', $user);

        $data = $request->validate(['rejection_reason' => ['required', 'string', 'max:500']]);

        $user->update([
            'status' => 'rejected',
            'rejected_by' => auth()->id(),
            'rejection_reason' => $data['rejection_reason'],
        ]);

        NotifikasiService::kirim(
            $user,
            'Akun Ditolak',
            "Pendaftaran akun Anda ditolak. Alasan: {$data['rejection_reason']}. Hubungi admin untuk informasi lebih lanjut.",
            'akun_ditolak',
            '/kontak'
        );

        activity()->performedOn($user)->withProperties(['rejection_reason' => $data['rejection_reason']])->log('Pengguna ditolak');

        return back()->with('success', 'Akun berhasil ditolak.');
    }

    public function suspend(User $user)
    {
        $this->authorize('delete', $user);

        $user->update(['status' => 'suspended']);

        activity()->performedOn($user)->log('Pengguna ditangguhkan');

        return back()->with('success', 'Akun berhasil ditangguhkan.');
    }

    public function setRole(Request $request, User $user)
    {
        $this->authorize('setRole', $user);

        $data = $request->validate(['roles' => ['required', 'array'], 'roles.*' => ['string', 'exists:roles,name']]);
        $user->syncRoles($data['roles']);

        activity()->performedOn($user)->withProperties(['roles' => $data['roles']])->log('Peran pengguna diubah');

        return back()->with('success', 'Peran pengguna berhasil diperbarui.');
    }

    public function resetPassword(User $user)
    {
        $this->authorize('resetPassword', $user);

        $user->update(['password' => Hash::make('Password1!')]);

        activity()->performedOn($user)->log('Password pengguna direset');

        return back()->with('success', 'Password pengguna berhasil direset ke default.');
    }

    private function validateUserForm(Request $request, ?User $user = null): array
    {
        $roles = $request->input('roles', []);
        $isMahasiswa = in_array('mahasiswa', $roles, true);
        $isPimpinanKetua = in_array('pimpinan', $roles, true) && $request->input('jabatan_pimpinan') === 'ketua_program_studi';
        $needsProgramStudi = $isMahasiswa || $isPimpinanKetua;

        $data = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user?->id),
                Rule::when($isMahasiswa, ['ends_with:@ui.ac.id'], ['ends_with:@che.ui.ac.id']),
            ],
            'npm_nip' => [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'npm_nip')->ignore($user?->id),
            ],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/'],
            'roles' => ['required', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
            'program_studi_id' => Rule::when($needsProgramStudi, ['required', 'exists:program_studi,id'], ['nullable']),
            'laboratorium_id' => ['nullable', 'exists:laboratorium,id'],
            'jabatan_pimpinan' => ['nullable', 'in:kepala_departemen,sekretaris_departemen,ketua_program_studi,koordinator_k3l'],
            'status' => ['required', 'in:pending_email,pending_approval,approved,suspended,rejected'],
        ]);

        if (! $needsProgramStudi) {
            $data['program_studi_id'] = null;
        }

        return $data;
    }

    private function statusFields(string $status, ?User $user = null): array
    {
        $fields = [
            'email_verified_at' => $status === 'pending_email' ? null : ($user?->email_verified_at ?? now()),
            'approved_at' => null,
            'approved_by' => null,
            'rejected_by' => null,
        ];

        if ($status === 'approved') {
            $fields['approved_at'] = now();
            $fields['approved_by'] = auth()->id();
        }

        if ($status === 'rejected') {
            $fields['rejected_by'] = auth()->id();
        }

        return $fields;
    }
}
