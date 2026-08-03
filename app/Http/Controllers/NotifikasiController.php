<?php

namespace App\Http\Controllers;

use App\Models\Notifikasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotifikasiController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Notifikasi::class);

        $filters = $this->filters($request);
        $query = Notifikasi::byUser(auth()->id());

        if ($filters['jenis']) {
            $query->where('kategori', $filters['jenis']);
        }

        if ($filters['status'] === 'unread') {
            $query->unread();
        } elseif ($filters['status'] === 'read') {
            $query->whereNotNull('dibaca_pada');
        }

        if ($filters['dari']) {
            $query->whereDate('created_at', '>=', $filters['dari']);
        }

        if ($filters['sampai']) {
            $query->whereDate('created_at', '<=', $filters['sampai']);
        }

        $items = $query->orderByDesc('created_at')->paginate(20)->withQueryString();

        return Inertia::render('Notifikasi/Index', [
            'items' => $items,
            'unread_count' => Notifikasi::byUser(auth()->id())->unread()->count(),
            'filters' => $filters,
            'filterOptions' => $this->filterOptions(),
        ]);
    }

    public function apiIndex(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Notifikasi::class);

        $filters = $this->filters($request);
        $query = Notifikasi::byUser(auth()->id());

        if ($filters['jenis']) {
            $query->where('kategori', $filters['jenis']);
        }

        if ($filters['status'] === 'unread') {
            $query->unread();
        } elseif ($filters['status'] === 'read') {
            $query->whereNotNull('dibaca_pada');
        }

        if ($filters['dari']) {
            $query->whereDate('created_at', '>=', $filters['dari']);
        }

        if ($filters['sampai']) {
            $query->whereDate('created_at', '<=', $filters['sampai']);
        }

        $items = $query->orderByDesc('created_at')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $items,
            'unread_count' => Notifikasi::byUser(auth()->id())->unread()->count(),
        ]);
    }

    public function unreadCount(): JsonResponse
    {
        $this->authorize('viewAny', Notifikasi::class);

        return response()->json([
            'success' => true,
            'data' => [
                'count' => Notifikasi::byUser(auth()->id())->unread()->count(),
            ],
        ]);
    }

    public function read(Notifikasi $notifikasi)
    {
        $this->authorize('view', $notifikasi);

        if ($notifikasi->user_id !== auth()->id()) {
            abort(403);
        }

        $notifikasi->markAsRead();

        if (request()->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Notifikasi ditandai dibaca.']);
        }

        return back();
    }

    public function markAllRead()
    {
        $this->authorize('viewAny', Notifikasi::class);

        Notifikasi::byUser(auth()->id())->unread()->update(['dibaca_pada' => now()]);

        if (request()->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Semua notifikasi ditandai dibaca.']);
        }

        return back();
    }

    private function filters(Request $request): array
    {
        return [
            'jenis' => $request->input('jenis', ''),
            'status' => $request->input('status', ''),
            'dari' => $request->input('dari', ''),
            'sampai' => $request->input('sampai', ''),
        ];
    }

    private function filterOptions(): array
    {
        $jenis = Notifikasi::byUser(auth()->id())
            ->distinct()
            ->orderBy('kategori')
            ->pluck('kategori')
            ->all();

        return [
            'jenis' => $jenis,
            'status' => [
                ['value' => '', 'label' => 'Semua'],
                ['value' => 'unread', 'label' => 'Belum Dibaca'],
                ['value' => 'read', 'label' => 'Sudah Dibaca'],
            ],
        ];
    }
}
