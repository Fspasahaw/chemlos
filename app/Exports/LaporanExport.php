<?php

namespace App\Exports;

use App\Services\LaporanService;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\HeaderFooter;
use PhpOffice\PhpSpreadsheet\Worksheet\HeaderFooterDrawing;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize, WithEvents
{
    protected string $jenis;
    protected array $filters;
    protected array $context;

    public function __construct(string $jenis, array $filters, array $context)
    {
        $this->jenis = $jenis;
        $this->filters = $filters;
        $this->context = $context;
    }

    public function collection()
    {
        return LaporanService::query($this->jenis, $this->filters, $this->context)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($item) => LaporanService::row($this->jenis, $item));
    }

    public function headings(): array
    {
        return LaporanService::headings($this->jenis);
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '3B82F6']],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Tambahkan Kop FTUI sebagai gambar di header setiap halaman cetak
                $kopPath = public_path('images/kop-ftui.jpg');
                if (file_exists($kopPath)) {
                    $drawing = new HeaderFooterDrawing();
                    $drawing->setPath($kopPath);
                    $drawing->setHeight(100);
                    $drawing->setResizeProportional(true);

                    $sheet->getHeaderFooter()->addImage($drawing, HeaderFooter::IMAGE_HEADER_CENTER);
                    $sheet->getHeaderFooter()->setOddHeader('&C&G');
                    $sheet->getPageSetup()->setFitToPage(true);
                    $sheet->getPageSetup()->setFitToWidth(1);
                }

                $event->sheet->getStyle('A1:' . $event->sheet->getHighestColumn() . '1')->getFont()->setBold(true);
                $event->sheet->freezePane('A2');
            },
        ];
    }
}
