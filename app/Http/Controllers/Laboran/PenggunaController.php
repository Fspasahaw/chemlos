<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use App\Models\PeminjamanStatusLog;
use App\Models\ProgramStudi;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PenggunaController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewLimited', User::class);

        $items = User::with('roles:id,name', 'programStudi:id,nama')
            ->where('created_by', auth()->id())
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['mahasiswa', 'dosen']))
            ->when($request->search, fn ($q, $s) => $q->where(function ($qq) use ($s) {
                $qq->where('nama_lengkap', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('npm_nip', 'like', "%{$s}%");
            }))
            ->when($request->role, fn ($q, $r) => $q->whereHas('roles', fn ($qq) => $qq->where('name', $r)))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Laboran/Pengguna/Index', [
            'items' => $items,
            'filters' => $request->only('search', 'role', 'status'),
        ]);
    }

    public function create()
    {
        $this->authorize('create', User::class);

        return Inertia::render('Dashboard/Laboran/Pengguna/Create', [
            'programStudi' => ProgramStudi::aktif()->orderBy('nama')->get(['id', 'nama', 'jenjang']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $data = $this->validateForm($request);

        $user = User::create(array_merge($data, [
            'name' => $data['nama_lengkap'],
            'password' => Hash::make($data['password']),
            'status' => 'approved',
            'email_verified_at' => now(),
            'approved_at' => now(),
            'approved_by' => auth()->id(),
            'created_by' => auth()->id(),
        ]));

        $user->syncRoles([$data['role']]);

        activity()->performedOn($user)->withProperties(['role' => $data['role']])->log('Pengguna dibuat oleh laboran');

        return redirect()->route('laboran.pengguna.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function show(User $user)
    {
        $this->authorize('update', $user);

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

        return Inertia::render('Dashboard/Laboran/Pengguna/Show', [
            'item' => $user->load('roles:id,name', 'programStudi:id,nama', 'laboratoriumPengelolas.laboratorium:id,nama'),
            'riwayat' => $riwayat,
        ]);
    }

    public function edit(User $user)
    {
        $this->authorize('update', $user);

        return Inertia::render('Dashboard/Laboran/Pengguna/Edit', [
            'item' => $user->load('roles:id,name', 'programStudi:id,nama'),
            'programStudi' => ProgramStudi::aktif()->orderBy('nama')->get(['id', 'nama', 'jenjang']),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $data = $this->validateForm($request, $user);

        $update = [
            'name' => $data['nama_lengkap'],
            'nama_lengkap' => $data['nama_lengkap'],
            'email' => $data['email'],
            'npm_nip' => $data['npm_nip'],
            'program_studi_id' => $data['program_studi_id'] ?? null,
        ];

        if (! empty($data['password'])) {
            $update['password'] = Hash::make($data['password']);
        }

        $user->update($update);
        $user->syncRoles([$data['role']]);

        activity()->performedOn($user)->withProperties(['role' => $data['role']])->log('Pengguna diperbarui oleh laboran');

        return redirect()->route('laboran.pengguna.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        activity()->performedOn($user)->log('Pengguna dihapus oleh laboran');
        $user->delete();

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }

    private function validateForm(Request $request, ?User $user = null): array
    {
        $role = $request->input('role');
        $isMahasiswa = $role === 'mahasiswa';

        $data = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user?->id),
                $isMahasiswa ? 'ends_with:@ui.ac.id' : 'ends_with:@che.ui.ac.id',
            ],
            'npm_nip' => [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'npm_nip')->ignore($user?->id),
            ],
            'role' => ['required', 'in:mahasiswa,dosen'],
            'program_studi_id' => [Rule::when($isMahasiswa, ['required', 'exists:program_studi,id'], ['nullable'])],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/'],
        ]);

        if (! $isMahasiswa) {
            $data['program_studi_id'] = null;
        }

        return $data;
    }
}
