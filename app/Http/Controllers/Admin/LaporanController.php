<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\LaporanBaseController;

class LaporanController extends LaporanBaseController
{
    protected function reportType(): string
    {
        return 'admin';
    }

    protected function viewPath(): string
    {
        return 'Dashboard/Admin/Laporan';
    }

    protected function routePrefix(): string
    {
        return 'admin.';
    }
}
