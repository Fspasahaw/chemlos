<?php

namespace Database\Seeders;

use App\Models\KerusakanAlat;
use App\Models\MaintenanceAlat;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotifikasiSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('status', 'approved')->get();

        if ($users->isEmpty()) {
            return;
        }

        $admin = User::role('admin')->first();
        $pimpinan = User::role('pimpinan')->first();

        // Notifikasi umum untuk semua pengguna aktif
        foreach ($users as $user) {
            Notifikasi::create([
                'user_id' => $user->id,
                'judul' => 'Selamat datang di ChemLOS',
                'pesan' => 'Terima kasih telah bergabung. Jelajahi laboratorium dan ajukan peminjaman alat dengan mudah.',
                'kategori' => 'umum',
                'link' => '/laboratorium',
                'dibaca_pada' => $user->hasRole('admin') ? now() : null,
                'created_at' => now()->subDays(rand(1, 5))->subHours(rand(0, 23)),
                'updated_at' => now(),
            ]);
        }

        // Notifikasi berdasarkan setiap peminjaman
        $peminjamans = Peminjaman::with(['user', 'dosenPembimbing', 'laboratorium.laboratoriumPengelolas', 'pengembalian'])->get();

        foreach ($peminjamans as $peminjaman) {
            $kategori = 'peminjaman_' . $peminjaman->status;
            $pesan = "Peminjaman {$peminjaman->kode} saat ini berstatus " . $peminjaman->statusLabel() . ".";

            // Notifikasi untuk peminjam
            Notifikasi::create([
                'user_id' => $peminjaman->user_id,
                'judul' => 'Status Peminjaman ' . $peminjaman->kode,
                'pesan' => $pesan,
                'kategori' => $kategori,
                'link' => '/dashboard/mahasiswa/peminjaman',
            ]);

            // Notifikasi untuk dosen pembimbing (jika perlu persetujuan/ditolak)
            if (in_array($peminjaman->status, ['menunggu_dosen', 'ditolak'], true) && $peminjaman->dosen_pembimbing_id) {
                Notifikasi::create([
                    'user_id' => $peminjaman->dosen_pembimbing_id,
                    'judul' => 'Persetujuan Peminjaman ' . $peminjaman->kode,
                    'pesan' => $pesan,
                    'kategori' => $kategori,
                    'link' => '/dashboard/dosen/peminjaman',
                ]);
            }

            // Notifikasi untuk laboran/kepala lab di laboratorium terkait
            if (in_array($peminjaman->status, ['menunggu_laboran', 'disetujui', 'berlangsung', 'terlambat', 'selesai'], true)) {
                foreach ($peminjaman->laboratorium?->laboratoriumPengelolas ?? [] as $pengelola) {
                    Notifikasi::create([
                        'user_id' => $pengelola->user_id,
                        'judul' => 'Peminjaman ' . $peminjaman->kode . ' - ' . $peminjaman->statusLabel(),
                        'pesan' => $pesan,
                        'kategori' => $kategori,
                        'link' => $pengelola->peran === 'laboran'
                            ? '/dashboard/laboran/peminjaman'
                            : '/dashboard/kepala-lab/peminjaman',
                    ]);
                }
            }

            // Notifikasi denda jika ada
            if ($peminjaman->status === 'selesai' && ($peminjaman->pengembalian?->total_denda ?? 0) > 0) {
                $totalDenda = number_format($peminjaman->pengembalian->total_denda, 0, ',', '.');
                $sisa = number_format($peminjaman->pengembalian->total_denda - $peminjaman->pengembalian->denda_dibayar, 0, ',', '.');
                Notifikasi::create([
                    'user_id' => $peminjaman->user_id,
                    'judul' => 'Denda Peminjaman ' . $peminjaman->kode,
                    'pesan' => "Peminjaman {$peminjaman->kode} memiliki denda sebesar Rp {$totalDenda}. Sisa yang belum dibayar: Rp {$sisa}.",
                    'kategori' => 'peminjaman_denda',
                    'link' => '/dashboard/mahasiswa/peminjaman',
                ]);
            }
        }

        // Notifikasi kerusakan dan maintenance untuk laboran & kepala lab
        $kerusakans = KerusakanAlat::with(['alat.laboratorium.laboratoriumPengelolas', 'peminjaman'])->get();

        foreach ($kerusakans as $kerusakan) {
            $pesan = "Kerusakan {$kerusakan->kondisi} pada {$kerusakan->alat?->nama} dilaporkan" . ($kerusakan->peminjaman ? " saat pengembalian {$kerusakan->peminjaman->kode}" : ' saat pemeriksaan rutin') . '.';

            foreach ($kerusakan->alat?->laboratorium?->laboratoriumPengelolas ?? [] as $pengelola) {
                Notifikasi::create([
                    'user_id' => $pengelola->user_id,
                    'judul' => 'Laporan Kerusakan ' . $kerusakan->alat?->kode,
                    'pesan' => $pesan,
                    'kategori' => 'kerusakan_dilaporkan',
                    'link' => $pengelola->peran === 'laboran'
                        ? '/dashboard/laboran/kerusakan'
                        : '/dashboard/kepala-lab/kerusakan',
                ]);
            }
        }

        $maintenances = MaintenanceAlat::with(['alat.laboratorium.laboratoriumPengelolas'])->get();

        foreach ($maintenances as $maintenance) {
            $pesan = "Maintenance {$maintenance->alat?->nama} status {$maintenance->status}.";

            foreach ($maintenance->alat?->laboratorium?->laboratoriumPengelolas ?? [] as $pengelola) {
                Notifikasi::create([
                    'user_id' => $pengelola->user_id,
                    'judul' => 'Maintenance Alat ' . $maintenance->alat?->kode,
                    'pesan' => $pesan,
                    'kategori' => 'maintenance_' . $maintenance->status,
                    'link' => $pengelola->peran === 'laboran'
                        ? '/dashboard/laboran/maintenance'
                        : '/dashboard/kepala-lab/maintenance',
                ]);
            }
        }

        // Notifikasi ringkasan untuk admin/pimpinan
        if ($admin) {
            Notifikasi::create([
                'user_id' => $admin->id,
                'judul' => 'Ringkasan Data Demo ChemLOS',
                'pesan' => 'Data demo telah berhasil diperbarui. Periksa dashboard untuk melihat pengguna, peminjaman, dan maintenance terbaru.',
                'kategori' => 'umum',
                'link' => '/dashboard/admin',
            ]);
        }

        if ($pimpinan) {
            Notifikasi::create([
                'user_id' => $pimpinan->id,
                'judul' => 'Laporan Peminjaman Laboratorium',
                'pesan' => 'Lihat laporan peminjaman dan penggunaan alat laboratorium terkini.',
                'kategori' => 'laporan',
                'link' => '/dashboard/pimpinan/laporan',
            ]);
        }
    }
}
