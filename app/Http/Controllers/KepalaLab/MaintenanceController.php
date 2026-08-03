<?php

namespace App\Http\Controllers\KepalaLab;

use App\Http\Controllers\Laboran\MaintenanceController as BaseController;

class MaintenanceController extends BaseController
{
    protected function viewName(): string
    {
        return 'Dashboard/KepalaLab/Maintenance/Index';
    }
}
