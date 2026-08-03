<?php

namespace App\Exports;

use App\Models\Peminjaman;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\HeaderFooter;
use PhpOffice\PhpSpreadsheet\Worksheet\HeaderFooterDrawing;

class PeminjamanExport implements FromCollection, WithHeadings, ShouldAutoSize, WithEvents
{
    public function __construct(private ?string $status, private ?string $start, private ?string $end) {}

    public function collection()
    {
        return Peminjaman::with('user', 'laboratorium')
            ->when($this->status, fn ($q) => $q->where('status', $this->status))
            ->when($this->start, fn ($q) => $q->whereDate('tanggal_mulai', '>=', $this->start))
            ->when($this->end, fn ($q) => $q->whereDate('tanggal_selesai', '<=', $this->end))
            ->get()
            ->map(fn ($p) => [
                'Kode' => $p->kode,
                'Peminjam' => $p->user?->nama_lengkap,
                'Laboratorium' => $p->laboratorium?->nama,
                'Tujuan' => $p->tujuan,
                'Tanggal Mulai' => $p->tanggal_mulai?->format('Y-m-d'),
                'Tanggal Selesai' => $p->tanggal_selesai?->format('Y-m-d'),
                'Status' => $p->status,
            ]);
    }

    public function headings(): array
    {
        return ['Kode', 'Peminjam', 'Laboratorium', 'Tujuan', 'Tanggal Mulai', 'Tanggal Selesai', 'Status'];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $kopPath = public_path('images/kop-ftui.jpg');
                if (file_exists($kopPath)) {
                    $drawing = new HeaderFooterDrawing();
                    $drawing->setPath($kopPath);
                    $drawing->setHeight(100);
                    $drawing->setResizeProportional(true);

                    $sheet->getHeaderFooter()->addImage($drawing, HeaderFooter::IMAGE_HEADER_CENTER);
                    $sheet->getHeaderFooter()->setOddHeader('&C&G');
                    $sheet->getPageSetup()->setFitToPage(true);
                }

                $event->sheet->getStyle('A1:' . $event->sheet->getHighestColumn() . '1')->getFont()->setBold(true);
                $event->sheet->freezePane('A2');
            },
        ];
    }
}
