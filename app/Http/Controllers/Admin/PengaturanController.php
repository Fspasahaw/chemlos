<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PengaturanController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Pengaturan::class);

        $groups = ['umum', 'branding', 'email', 'keamanan', 'legal', 'denda', 'peminjaman', 'notifikasi', 'tentang'];
        $settings = collect($groups)->mapWithKeys(function ($g) {
            $existing = Pengaturan::where('grup', $g)->pluck('value', 'key')->toArray();

            return [$g => array_merge($this->defaultGroupSettings($g), $existing)];
        });

        return Inertia::render('Dashboard/Admin/Pengaturan/Index', [
            'settings' => $settings,
            'groups' => $groups,
        ]);
    }

    private function defaultGroupSettings(string $group): array
    {
        return match ($group) {
            'notifikasi' => [
                'email_enabled' => '1',
                'whatsapp_enabled' => '0',
                'whatsapp_provider' => 'stub',
                'whatsapp_api_key' => '',
                'whatsapp_base_url' => '',
                'whatsapp_sender' => '',
                'reminder_h1_serah_terima' => '1',
                'reminder_h_serah_terima' => '1',
                'reminder_h2_pengembalian' => '1',
                'reminder_h1_pengembalian' => '1',
                'reminder_h_pengembalian' => '1',
                'notifikasi_keterlambatan' => '1',
                'notifikasi_realtime_enabled' => '1',
                'polling_interval_detik' => '30',
                'template_email_verifikasi' => "Yth. {{nama}},\n\nTerima kasih telah mendaftar di ChemLOS. Klik link berikut untuk memverifikasi email Anda:\n{{link}}",
                'template_email_persetujuan' => "Yth. {{nama}},\n\nPeminjaman Anda dengan kode {{kode}} telah {{status}}.\n{{link}}",
                'template_email_penolakan' => "Yth. {{nama}},\n\nPeminjaman Anda dengan kode {{kode}} ditolak dengan alasan: {{alasan}}.",
                'template_email_peminjaman_selesai' => "Yth. {{nama}},\n\nPeminjaman {{kode}} telah selesai. Terima kasih atas pengembalian alat tepat waktu.",
                'template_whatsapp_pengingat' => "Halo {{nama}}, jangan lupa mengembalikan alat peminjaman {{kode}} sebelum {{batas}}.",
            ],
            'branding' => [
                'logo_aplikasi' => '',
                'favicon' => '',
                'logo_departemen' => '',
                'primary_color' => '#4f46e5',
                'secondary_color' => '#7c3aed',
            ],
            default => [],
        };
    }

    public function update(Request $request)
    {
        $this->authorize('manage', Pengaturan::class);

        $group = $request->input('group', 'umum');
        $keys = $request->input('keys', []);

        // Frontend mengirim keys[{group}][{key}] agar tab tidak bertabrakan.
        $groupValues = is_array($keys) && isset($keys[$group]) ? $keys[$group] : $keys;

        foreach ($groupValues as $key => $value) {
            Pengaturan::setValue($group, $key, $value);
        }

        if ($request->hasFile('logo_aplikasi')) {
            $old = Pengaturan::where(['grup' => 'branding', 'key' => 'logo_aplikasi'])->value('value');
            if ($old) Storage::disk('public')->delete($old);
            $path = $request->file('logo_aplikasi')->store('pengaturan', 'public');
            Pengaturan::updateOrCreate(
                ['grup' => 'branding', 'key' => 'logo_aplikasi'],
                ['tipe' => 'file', 'value' => $path]
            );
        }

        if ($request->hasFile('favicon')) {
            $old = Pengaturan::where(['grup' => 'branding', 'key' => 'favicon'])->value('value');
            if ($old) Storage::disk('public')->delete($old);
            $path = $request->file('favicon')->store('pengaturan', 'public');
            Pengaturan::updateOrCreate(
                ['grup' => 'branding', 'key' => 'favicon'],
                ['tipe' => 'file', 'value' => $path]
            );
        }

        if ($request->hasFile('logo_departemen')) {
            $old = Pengaturan::where(['grup' => 'branding', 'key' => 'logo_departemen'])->value('value');
            if ($old) Storage::disk('public')->delete($old);
            $path = $request->file('logo_departemen')->store('pengaturan', 'public');
            Pengaturan::updateOrCreate(
                ['grup' => 'branding', 'key' => 'logo_departemen'],
                ['tipe' => 'file', 'value' => $path]
            );
        }

        Cache::forget('settings');

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
