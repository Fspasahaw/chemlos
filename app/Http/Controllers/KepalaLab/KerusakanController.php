<?php

namespace App\Http\Controllers\KepalaLab;

use App\Http\Controllers\Laboran\KerusakanController as BaseController;
use Illuminate\Http\Request;

class KerusakanController extends BaseController
{
    protected function viewName(): string
    {
        return 'Dashboard/KepalaLab/Kerusakan/Index';
    }

    public function store(Request $request)
    {
        return back()->with('error', 'Kepala Lab tidak dapat membuat laporan kerusakan manual.');
    }

    public function update(Request $request, \App\Models\KerusakanAlat $kerusakan)
    {
        return back()->with('error', 'Kepala Lab tidak dapat mengubah data kerusakan.');
    }

    public function destroy(\App\Models\KerusakanAlat $kerusakan)
    {
        return back()->with('error', 'Kepala Lab tidak dapat menghapus kerusakan.');
    }
}
