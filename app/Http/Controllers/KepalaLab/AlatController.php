<?php

namespace App\Http\Controllers\KepalaLab;

use App\Http\Controllers\Laboran\AlatController as BaseController;

class AlatController extends BaseController
{
    protected function viewNamespace(): string
    {
        return 'Dashboard/KepalaLab';
    }

    protected function routePrefix(): string
    {
        return 'kepala-lab.';
    }
}
