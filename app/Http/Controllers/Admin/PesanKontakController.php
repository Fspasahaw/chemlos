<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KontakPesan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PesanKontakController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Dashboard/Admin/PesanKontak/Index', [
            'items' => KontakPesan::query()
                ->when($request->search, fn ($q, $s) => $q->where(function ($sq) use ($s) {
                    $sq->where('nama', 'like', "%{$s}%")
                        ->orWhere('email', 'like', "%{$s}%")
                        ->orWhere('subjek', 'like', "%{$s}%")
                        ->orWhere('pesan', 'like', "%{$s}%");
                }))
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->orderByDesc('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function show(KontakPesan $pesan)
    {
        if ($pesan->status === 'baru') {
            $pesan->update(['status' => 'dibaca']);
        }

        return Inertia::render('Dashboard/Admin/PesanKontak/Show', [
            'item' => $pesan,
        ]);
    }

    public function updateStatus(Request $request, KontakPesan $pesan)
    {
        $data = $request->validate(['status' => ['required', 'in:dibaca,dijawab']]);
        $pesan->update($data);

        return back()->with('success', 'Status pesan diperbarui.');
    }

    public function destroy(KontakPesan $pesan)
    {
        $pesan->delete();

        return back()->with('success', 'Pesan berhasil dihapus.');
    }
}
