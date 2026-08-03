<?php

namespace App\Http\Controllers;

use App\Models\LaboratoriumPengelola;
use App\Services\LaporanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

abstract class LaporanBaseController extends Controller
{
    abstract protected function reportType(): string;

    abstract protected function viewPath(): string;

    abstract protected function routePrefix(): string;

    public function index(Request $request)
    {
        $this->authorize('laporan.view');

        $context = $this->context();
        $jenisList = LaporanService::allowedJenis($context['type']);
        $jenis = in_array($request->input('jenis'), $jenisList)
            ? $request->input('jenis')
            : ($jenisList[0] ?? 'peminjaman');

        $filters = LaporanService::filtersFromRequest($request, $jenis);
        $query = LaporanService::query($jenis, $filters, $context);

        $items = $query->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn ($item) => LaporanService::row($jenis, $item));

        return Inertia::render($this->viewPath() . '/Index', [
            'jenis' => $jenis,
            'jenisList' => $jenisList,
            'items' => $items,
            'filters' => $filters,
            'columns' => LaporanService::columns($jenis),
            'filterOptions' => LaporanService::filterOptions($jenis, $context),
            'label' => LaporanService::label($jenis),
            'exportUrl' => route($this->routePrefix() . 'laporan.export', [], false),
            'exportPdfUrl' => route($this->routePrefix() . 'laporan.export-pdf', [], false),
        ]);
    }

    public function export(Request $request)
    {
        $this->authorize('laporan.view');

        $context = $this->context();
        $jenisList = LaporanService::allowedJenis($context['type']);
        $jenis = in_array($request->input('jenis'), $jenisList) ? $request->input('jenis') : ($jenisList[0] ?? 'peminjaman');
        $filters = LaporanService::filtersFromRequest($request, $jenis);

        return Excel::download(
            new \App\Exports\LaporanExport($jenis, $filters, $context),
            LaporanService::filename($jenis, 'xlsx')
        );
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('laporan.view');

        $context = $this->context();
        $jenisList = LaporanService::allowedJenis($context['type']);
        $jenis = in_array($request->input('jenis'), $jenisList) ? $request->input('jenis') : ($jenisList[0] ?? 'peminjaman');
        $filters = LaporanService::filtersFromRequest($request, $jenis);

        $query = LaporanService::query($jenis, $filters, $context)->orderByDesc('created_at');
        $rows = $query->get()->map(fn ($item) => LaporanService::row($jenis, $item));

        $pdf = Pdf::loadView('laporan.pdf', [
            'title' => 'Laporan ' . LaporanService::label($jenis),
            'filters' => $filters,
            'columns' => LaporanService::headings($jenis),
            'rows' => $rows,
        ])->setPaper('a4', 'landscape');

        return $pdf->download(LaporanService::filename($jenis, 'pdf'));
    }

    protected function context(): array
    {
        $user = Auth::user();
        $type = $this->reportType();

        $labIds = [];
        $dosenId = null;

        if (in_array($type, ['laboran', 'kepala_lab'])) {
            $labIds = LaboratoriumPengelola::where('user_id', $user->id)
                ->whereIn('peran', ['laboran', 'kepala_lab'])
                ->pluck('laboratorium_id')
                ->toArray();
        }

        if ($type === 'dosen') {
            $dosenId = $user->id;
        }

        return ['type' => $type, 'labIds' => $labIds, 'dosenId' => $dosenId];
    }
}
