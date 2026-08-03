<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class VerifikasiAkunController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('verifyAny', User::class);

        $items = User::with('roles:id,name')
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['mahasiswa', 'dosen']))
            ->when($request->search, fn ($q, $s) => $q->where(function ($qq) use ($s) {
                $qq->where('nama_lengkap', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('npm_nip', 'like', "%{$s}%");
            }))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Laboran/VerifikasiAkun/Index', [
            'items' => $items,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function approve(User $user)
    {
        $this->authorize('approve', $user);

        if (! $user->hasAnyRole(['mahasiswa', 'dosen'])) {
            abort(403, 'Hanya akun mahasiswa dan dosen yang dapat diverifikasi.');
        }

        $user->forceFill([
            'status' => 'approved',
            'email_verified_at' => $user->email_verified_at ?? now(),
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ])->save();

        NotifikasiService::kirim(
            $user,
            'Akun Disetujui',
            'Selamat, akun ChemLOS Anda telah disetujui oleh laboran. Silakan login untuk mulai menggunakan sistem.',
            'akun_disetujui',
            '/login'
        );

        return back()->with('success', 'Akun berhasil disetujui.');
    }

    public function reject(Request $request, User $user)
    {
        $this->authorize('reject', $user);

        if (! $user->hasAnyRole(['mahasiswa', 'dosen'])) {
            abort(403, 'Hanya akun mahasiswa dan dosen yang dapat ditolak.');
        }

        $data = $request->validate(['rejection_reason' => ['required', 'string', 'max:500']]);

        $user->update([
            'status' => 'rejected',
            'rejected_by' => auth()->id(),
            'rejection_reason' => $data['rejection_reason'],
        ]);

        NotifikasiService::kirim(
            $user,
            'Akun Ditolak',
            "Pendaftaran akun Anda ditolak oleh laboran. Alasan: {$data['rejection_reason']}. Hubungi admin untuk informasi lebih lanjut.",
            'akun_ditolak',
            '/kontak'
        );

        return back()->with('success', 'Akun berhasil ditolak.');
    }
}
