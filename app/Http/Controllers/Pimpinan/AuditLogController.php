<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\AuditLogBaseController;

class AuditLogController extends AuditLogBaseController
{
    protected function viewPath(): string
    {
        return 'Dashboard/Pimpinan/AuditLog';
    }

    protected function routePrefix(): string
    {
        return 'pimpinan.';
    }
}
