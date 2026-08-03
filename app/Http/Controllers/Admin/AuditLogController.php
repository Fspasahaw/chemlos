<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\AuditLogBaseController;

class AuditLogController extends AuditLogBaseController
{
    protected function viewPath(): string
    {
        return 'Dashboard/Admin/AuditLog';
    }

    protected function routePrefix(): string
    {
        return 'admin.';
    }
}
