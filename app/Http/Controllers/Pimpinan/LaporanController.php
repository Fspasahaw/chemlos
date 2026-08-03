<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\LaporanBaseController;

class LaporanController extends LaporanBaseController
{
    protected function reportType(): string
    {
        return 'pimpinan';
    }

    protected function viewPath(): string
    {
        return 'Dashboard/Pimpinan/Laporan';
    }

    protected function routePrefix(): string
    {
        return 'pimpinan.';
    }
}
