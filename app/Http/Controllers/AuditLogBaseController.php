<?php

namespace App\Http\Controllers;

use App\Services\LaporanService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

abstract class AuditLogBaseController extends Controller
{
    abstract protected function viewPath(): string;

    abstract protected function routePrefix(): string;

    public function index(Request $request)
    {
        $this->authorize('laporan.view');

        $context = ['type' => 'admin', 'labIds' => [], 'dosenId' => null];
        $jenis = 'aktivitas';
        $filters = LaporanService::filtersFromRequest($request, $jenis);

        $query = LaporanService::query($jenis, $filters, $context);
        $items = $query->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($item) => LaporanService::row($jenis, $item));

        return Inertia::render($this->viewPath() . '/Index', [
            'items' => $items,
            'filters' => $filters,
            'columns' => LaporanService::columns($jenis),
            'filterOptions' => LaporanService::filterOptions($jenis, $context),
            'exportUrl' => route($this->routePrefix() . 'audit-log.export', [], false),
            'exportPdfUrl' => route($this->routePrefix() . 'audit-log.export-pdf', [], false),
        ]);
    }

    public function export(Request $request)
    {
        $this->authorize('laporan.view');

        $context = ['type' => 'admin', 'labIds' => [], 'dosenId' => null];
        $jenis = 'aktivitas';
        $filters = LaporanService::filtersFromRequest($request, $jenis);

        return Excel::download(
            new \App\Exports\LaporanExport($jenis, $filters, $context),
            LaporanService::filename($jenis, 'xlsx')
        );
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('laporan.view');

        $context = ['type' => 'admin', 'labIds' => [], 'dosenId' => null];
        $jenis = 'aktivitas';
        $filters = LaporanService::filtersFromRequest($request, $jenis);

        $rows = LaporanService::query($jenis, $filters, $context)->orderByDesc('created_at')->get()
            ->map(fn ($item) => LaporanService::row($jenis, $item));

        $pdf = Pdf::loadView('laporan.pdf', [
            'title' => 'Audit Log / Log Aktivitas',
            'filters' => $filters,
            'columns' => LaporanService::headings($jenis),
            'rows' => $rows,
        ])->setPaper('a4', 'landscape');

        return $pdf->download(LaporanService::filename($jenis, 'pdf'));
    }
}
