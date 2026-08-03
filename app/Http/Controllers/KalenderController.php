<?php

namespace App\Http\Controllers;

use App\Models\LaboratoriumPengelola;
use App\Models\MaintenanceAlat;
use App\Models\Peminjaman;
use App\Services\KalenderService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KalenderController extends Controller
{
    /**
     * Kembalikan daftar event (peminjaman + maintenance) dalam format FullCalendar
     * sesuai hak akses pengguna yang login.
     */
    public function peminjamanEvents(Request $request)
    {
        $user = Auth::user();

        $query = Peminjaman::with([
            'laboratorium:id,nama',
            'user:id,nama_lengkap',
            'dosenPembimbing:id,nama_lengkap',
            'details.alat:id,nama',
        ])->whereNotIn('status', ['ditolak', 'dibatalkan']);

        $labIds = null;

        if ($user->hasRole('admin') || $user->hasRole('pimpinan')) {
            // lihat semua
        } elseif ($user->hasRole('mahasiswa')) {
            $query->where('user_id', $user->id);
        } elseif ($user->hasRole('dosen')) {
            $query->where('dosen_pembimbing_id', $user->id);
        } elseif ($user->hasRole('laboran') || $user->hasRole('kepala_lab')) {
            $labIds = LaboratoriumPengelola::where('user_id', $user->id)->pluck('laboratorium_id');
            $query->whereIn('laboratorium_id', $labIds);
        } else {
            $query->where('id', 0);
        }

        $start = $request->input('start');
        $end = $request->input('end');

        if ($start && $end) {
            $query->whereDate('tanggal_mulai', '<=', Carbon::parse($end)->toDateString())
                ->whereDate('tanggal_selesai', '>=', Carbon::parse($start)->toDateString());
        }

        $events = $query->get()->map(fn (Peminjaman $p) => KalenderService::eventDariPeminjaman($p));

        // Maintenance hanya ditampilkan untuk peran yang relevan.
        if ($user->hasRole('admin') || $user->hasRole('pimpinan') || $user->hasRole('laboran') || $user->hasRole('kepala_lab')) {
            $maintenanceQuery = MaintenanceAlat::with(['laboratorium:id,nama', 'alat:id,nama', 'laboran:id,nama_lengkap'])
                ->whereNotIn('status', ['dibatalkan']);

            if (($user->hasRole('laboran') || $user->hasRole('kepala_lab')) && $labIds) {
                $maintenanceQuery->whereIn('laboratorium_id', $labIds);
            }

            if ($start && $end) {
                $maintenanceQuery->whereDate('tanggal_mulai', '<=', Carbon::parse($end)->toDateString())
                    ->where(function ($q) use ($start) {
                        $q->whereNull('tanggal_selesai')
                            ->orWhereDate('tanggal_selesai', '>=', Carbon::parse($start)->toDateString());
                    });
            }

            $events = $events->merge(
                $maintenanceQuery->get()->map(fn (MaintenanceAlat $m) => KalenderService::eventDariMaintenance($m))
            );
        }

        return response()->json($events->values());
    }
}
