<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\LaporanBaseController;

class LaporanController extends LaporanBaseController
{
    protected function reportType(): string
    {
        return 'laboran';
    }

    protected function viewPath(): string
    {
        return 'Dashboard/Laboran/Laporan';
    }

    protected function routePrefix(): string
    {
        return 'laboran.';
    }
}
