<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\LaporanBaseController;

class LaporanController extends LaporanBaseController
{
    protected function reportType(): string
    {
        return 'dosen';
    }

    protected function viewPath(): string
    {
        return 'Dashboard/Dosen/Laporan';
    }

    protected function routePrefix(): string
    {
        return 'dosen.';
    }
}
