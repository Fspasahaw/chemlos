<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\Controller;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PengaturanController extends Controller
{
    private const ALLOWED_GROUPS = ['umum', 'peminjaman', 'denda', 'notifikasi'];

    public function index()
    {
        $this->authorize('viewAny', Pengaturan::class);

        $groups = ['umum', 'peminjaman', 'denda', 'notifikasi'];
        $settings = collect($groups)->mapWithKeys(fn ($g) => [$g => Pengaturan::where('grup', $g)->pluck('value', 'key')]);

        return Inertia::render('Dashboard/Pimpinan/Pengaturan/Index', [
            'settings' => $settings,
            'groups' => $groups,
        ]);
    }

    public function update(Request $request)
    {
        $this->authorize('viewAny', Pengaturan::class);

        $group = $request->input('group', 'umum');

        if (! in_array($group, self::ALLOWED_GROUPS, true)) {
            abort(403, 'Grup pengaturan tidak dapat diubah.');
        }

        $keys = $request->input('keys', []);
        $groupValues = is_array($keys) && isset($keys[$group]) ? $keys[$group] : $keys;

        foreach ($groupValues as $key => $value) {
            Pengaturan::setValue($group, $key, $value);
        }

        if ($request->hasFile('logo_aplikasi')) {
            $old = Pengaturan::where(['grup' => 'umum', 'key' => 'logo_aplikasi'])->value('value');
            if ($old) Storage::disk('public')->delete($old);
            $path = $request->file('logo_aplikasi')->store('pengaturan', 'public');
            Pengaturan::updateOrCreate(
                ['grup' => 'umum', 'key' => 'logo_aplikasi'],
                ['tipe' => 'file', 'value' => $path]
            );
        }

        if ($request->hasFile('favicon')) {
            $old = Pengaturan::where(['grup' => 'umum', 'key' => 'favicon'])->value('value');
            if ($old) Storage::disk('public')->delete($old);
            $path = $request->file('favicon')->store('pengaturan', 'public');
            Pengaturan::updateOrCreate(
                ['grup' => 'umum', 'key' => 'favicon'],
                ['tipe' => 'file', 'value' => $path]
            );
        }

        Cache::forget('settings');

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
