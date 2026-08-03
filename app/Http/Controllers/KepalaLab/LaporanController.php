<?php

namespace App\Http\Controllers\KepalaLab;

use App\Http\Controllers\LaporanBaseController;

class LaporanController extends LaporanBaseController
{
    protected function reportType(): string
    {
        return 'kepala_lab';
    }

    protected function viewPath(): string
    {
        return 'Dashboard/KepalaLab/Laporan';
    }

    protected function routePrefix(): string
    {
        return 'kepala-lab.';
    }
}
