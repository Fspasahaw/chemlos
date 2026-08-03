<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Alat;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

trait GeneratesQrLabel
{
    protected function generateQrCode(Alat $alat): void
    {
        $url = route('alat.show', $alat->slug);
        $path = 'qr/' . $alat->slug . '.svg';

        Storage::disk('public')->makeDirectory('qr');
        QrCode::format('svg')->size(300)->margin(2)->generate($url, Storage::disk('public')->path($path));

        // Hapus file QR lama (png) jika ada agar tidak konflik
        if ($alat->qr_kode_path && $alat->qr_kode_path !== $path && Storage::disk('public')->exists($alat->qr_kode_path)) {
            Storage::disk('public')->delete($alat->qr_kode_path);
        }

        $alat->update(['qr_kode_path' => $path]);
    }

    public function downloadQrLabel(Alat $alat)
    {
        $this->authorize('view', $alat);

        $url = route('alat.show', $alat->slug);
        $qrSvg = QrCode::format('svg')->size(240)->margin(1)->generate($url);

        $pdf = Pdf::loadView('pdf.qr-label', [
            'alat' => $alat,
            'qrSvg' => $qrSvg,
            'url' => $url,
        ])->setPaper([0, 0, 226.77, 141.73]);

        return $pdf->download('label-' . $alat->slug . '.pdf');
    }
}
