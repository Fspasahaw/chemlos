<?php

namespace Database\Seeders;

use App\Models\Alat;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use App\Models\PeminjamanDetail;
use App\Models\PeminjamanStatusLog;
use App\Models\Pengaturan;
use App\Models\Pengembalian;
use App\Models\SerahTerima;
use App\Models\User;
use Database\Seeders\Helpers\DemoAssetHelper;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PeminjamanSeeder extends Seeder
{
    public function run(): void
    {
        $mahasiswas = User::role('mahasiswa')->where('status', 'approved')->whereNotNull('foto_ktm')->get();
        $dosens = User::role('dosen')->where('status', 'approved')->get();
        $laborans = User::role('laboran')->where('status', 'approved')->get();

        if ($mahasiswas->isEmpty() || $dosens->isEmpty() || $laborans->isEmpty()) {
            return;
        }

        $scenarios = $this->buildScenarios();
        $counter = 1;

        foreach ($scenarios as $scenario) {
            $this->createPeminjaman($scenario, $counter, $mahasiswas, $dosens, $laborans);
            $counter++;
        }
    }

    protected function buildScenarios(): array
    {
        $today = now()->startOfDay();

        return [
            // 1. diajukan: baru diajukan, belum diproses
            ['status' => 'diajukan', 'mulai' => $today->copy()->addDays(2), 'selesai' => $today->copy()->addDays(4), 'lab_offset' => 0, 'kondisi' => null, 'terlambat_hari' => 0, 'denda_bayar' => 0],

            // 2. menunggu_dosen: diajukan -> menunggu dosen
            ['status' => 'menunggu_dosen', 'mulai' => $today->copy()->addDays(3), 'selesai' => $today->copy()->addDays(5), 'lab_offset' => 1, 'kondisi' => null, 'terlambat_hari' => 0, 'denda_bayar' => 0],

            // 3. menunggu_laboran: disetujui dosen, menunggu laboran
            ['status' => 'menunggu_laboran', 'mulai' => $today->copy()->addDays(1), 'selesai' => $today->copy()->addDays(3), 'lab_offset' => 2, 'kondisi' => null, 'terlambat_hari' => 0, 'denda_bayar' => 0],

            // 4. disetujui: disetujui, belum serah terima
            ['status' => 'disetujui', 'mulai' => $today->copy()->addDays(1), 'selesai' => $today->copy()->addDays(2), 'lab_offset' => 3, 'kondisi' => null, 'terlambat_hari' => 0, 'denda_bayar' => 0],

            // 5. berlangsung: sudah serah terima, sedang berlangsung
            ['status' => 'berlangsung', 'mulai' => $today->copy()->subDays(2), 'selesai' => $today->copy()->addDays(2), 'lab_offset' => 4, 'kondisi' => null, 'terlambat_hari' => 0, 'denda_bayar' => 0],

            // 6. terlambat: sudah serah terima, lewat jatuh tempo, belum dikembalikan
            ['status' => 'terlambat', 'mulai' => $today->copy()->subDays(5), 'selesai' => $today->copy()->subDays(1), 'lab_offset' => 0, 'kondisi' => null, 'terlambat_hari' => 0, 'denda_bayar' => 0],

            // 7. selesai: kembali normal tanpa denda
            ['status' => 'selesai', 'mulai' => $today->copy()->subDays(10), 'selesai' => $today->copy()->subDays(3), 'lab_offset' => 1, 'kondisi' => 'baik', 'terlambat_hari' => 0, 'denda_bayar' => 0],

            // 8. selesai: kembali dengan kerusakan ringan, denda belum dibayar
            ['status' => 'selesai', 'mulai' => $today->copy()->subDays(12), 'selesai' => $today->copy()->subDays(5), 'lab_offset' => 2, 'kondisi' => 'rusak_ringan', 'terlambat_hari' => 0, 'denda_bayar' => 0],

            // 9. selesai: kembali terlambat, denda dibayar lunas
            ['status' => 'selesai', 'mulai' => $today->copy()->subDays(14), 'selesai' => $today->copy()->subDays(7), 'lab_offset' => 3, 'kondisi' => 'baik', 'terlambat_hari' => 2, 'denda_bayar' => 1],

            // 10. selesai: kembali terlambat + kerusakan ringan, denda dibayar sebagian
            ['status' => 'selesai', 'mulai' => $today->copy()->subDays(16), 'selesai' => $today->copy()->subDays(9), 'lab_offset' => 4, 'kondisi' => 'rusak_ringan', 'terlambat_hari' => 1, 'denda_bayar' => 0.5],

            // 11. ditolak: dosen menolak
            ['status' => 'ditolak', 'mulai' => $today->copy()->subDays(5), 'selesai' => $today->copy()->subDays(2), 'lab_offset' => 0, 'kondisi' => null, 'terlambat_hari' => 0, 'denda_bayar' => 0],

            // 12. dibatalkan: mahasiswa membatalkan
            ['status' => 'dibatalkan', 'mulai' => $today->copy()->subDays(4), 'selesai' => $today->copy()->subDays(1), 'lab_offset' => 1, 'kondisi' => null, 'terlambat_hari' => 0, 'denda_bayar' => 0],
        ];
    }

    protected function createPeminjaman(array $scenario, int $counter, $mahasiswas, $dosens, $laborans)
    {
        $mahasiswa = $mahasiswas->shift() ?? $mahasiswas->first() ?? User::role('mahasiswa')->where('status', 'approved')->first();
        $mahasiswas->push($mahasiswa);

        $dosen = $dosens->random();
        $laboran = $laborans->random();

        $labs = Laboratorium::aktif()->orderBy('id')->get();
        $lab = $labs[$scenario['lab_offset'] % $labs->count()] ?? Laboratorium::aktif()->first();

        if (! $lab) {
            return;
        }

        $mulai = $scenario['mulai']->copy()->setTime(8, 0, 0);
        $selesai = $scenario['selesai']->copy()->setTime(17, 0, 0);

        $kode = 'PINJ-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

        $peminjaman = Peminjaman::create([
            'user_id' => $mahasiswa->id,
            'dosen_pembimbing_id' => $dosen->id,
            'laboratorium_id' => $lab->id,
            'kode' => $kode,
            'tujuan' => 'Praktikum / Penelitian mengenai karakteristik proses kimia dan penggunaan alat laboratorium.',
            'tanggal_mulai' => $mulai->toDateString(),
            'jam_mulai' => '08:00',
            'tanggal_selesai' => $selesai->toDateString(),
            'jam_selesai' => '17:00',
            'file_jsa' => DemoAssetHelper::pdf("demo/jsas/jsa-{$kode}.pdf", 'JSA ' . $kode),
            'status' => 'diajukan',
        ]);

        $createdAt = $mulai->copy()->subDays(rand(1, 3))->setTimeFromTimeString('10:00:00');
        $peminjaman->created_at = $createdAt;
        $peminjaman->updated_at = $createdAt;
        $peminjaman->saveQuietly();

        $this->logStatus($peminjaman, null, 'diajukan', 'Peminjaman diajukan oleh ' . $mahasiswa->nama_lengkap, $mahasiswa->id, $createdAt);

        // Pilih alat tersedia dan layak pakai
        $alats = Alat::where('laboratorium_id', $lab->id)
            ->where('kondisi', 'baik')
            ->where('stok_tersedia', '>=', 1)
            ->inRandomOrder()
            ->limit(2)
            ->get();

        if ($alats->isEmpty()) {
            $alats = Alat::where('laboratorium_id', $lab->id)
                ->where('stok_tersedia', '>=', 1)
                ->inRandomOrder()
                ->limit(2)
                ->get();
        }

        if ($alats->isEmpty()) {
            return;
        }

        $detailIds = [];
        foreach ($alats as $alat) {
            $jumlah = min(1, max(1, $alat->stok_tersedia));
            $detail = PeminjamanDetail::create([
                'peminjaman_id' => $peminjaman->id,
                'alat_id' => $alat->id,
                'jumlah' => $jumlah,
            ]);

            $alat->stok_reserved += $jumlah;
            $alat->save();

            $detailIds[] = ['detail' => $detail, 'alat' => $alat, 'jumlah' => $jumlah];
        }

        $this->applyStatus($peminjaman, $scenario, $dosen, $laboran, $mahasiswa, $detailIds, $createdAt);

        $peminjaman->refresh();

        Notifikasi::create([
            'user_id' => $mahasiswa->id,
            'judul' => 'Status Peminjaman ' . $peminjaman->kode,
            'pesan' => "Peminjaman {$peminjaman->kode} saat ini berstatus {$peminjaman->statusLabel()}.",
            'kategori' => 'peminjaman_' . $peminjaman->status,
            'link' => '/dashboard/mahasiswa/peminjaman',
        ]);
    }

    protected function applyStatus($peminjaman, $scenario, $dosen, $laboran, $mahasiswa, $detailIds, $createdAt)
    {
        $status = $scenario['status'];

        if ($status === 'diajukan') {
            return;
        }

        $this->logStatus($peminjaman, 'diajukan', 'menunggu_dosen', 'Validasi awal berhasil.', null, $createdAt->copy()->addHours(2));

        if ($status === 'menunggu_dosen') {
            $peminjaman->update(['status' => 'menunggu_dosen']);
            return;
        }

        $this->logStatus($peminjaman, 'menunggu_dosen', 'menunggu_laboran', 'Dosen menyetujui peminjaman.', $dosen->id, $createdAt->copy()->addHours(5));

        if ($status === 'menunggu_laboran') {
            $peminjaman->update(['status' => 'menunggu_laboran']);
            return;
        }

        if ($status === 'ditolak') {
            $peminjaman->update(['status' => 'ditolak', 'alasan_penolakan' => 'Alat sedang digunakan untuk kegiatan departemen.']);
            $this->logStatus($peminjaman, 'menunggu_dosen', 'ditolak', 'Dosen menolak peminjaman.', $dosen->id, $createdAt->copy()->addHours(6));
            $this->releaseReserved($detailIds);
            return;
        }

        if ($status === 'dibatalkan') {
            $peminjaman->update(['status' => 'dibatalkan', 'dibatalkan_oleh' => $mahasiswa->id]);
            $this->logStatus($peminjaman, 'menunggu_dosen', 'dibatalkan', 'Peminjam membatalkan pengajuan.', $mahasiswa->id, $createdAt->copy()->addHours(4));
            $this->releaseReserved($detailIds);
            return;
        }

        // disetujui / berlangsung / terlambat / selesai melewati alur normal
        $this->logStatus($peminjaman, 'menunggu_laboran', 'disetujui', 'Laboran menyetujui peminjaman, menunggu serah terima.', $laboran->id, $createdAt->copy()->addHours(8));

        if ($status === 'disetujui') {
            $peminjaman->update(['status' => 'disetujui']);
            return;
        }

        // Serah terima: pindahkan reserved ke dipinjam
        foreach ($detailIds as $item) {
            $alat = $item['alat'];
            $detail = $item['detail'];
            $jumlah = $item['jumlah'];

            $alat->stok_reserved -= $jumlah;
            $alat->stok_dipinjam += $jumlah;
            $alat->save();

            $detail->update(['kondisi_serah_terima' => 'baik', 'catatan_serah_terima' => 'Kondisi baik saat serah terima.']);
        }

        $waktuSerah = $peminjaman->tanggal_mulai->copy()->setTimeFromTimeString($peminjaman->jam_mulai);
        SerahTerima::create([
            'peminjaman_id' => $peminjaman->id,
            'laboran_id' => $laboran->id,
            'waktu_serah_terima' => $waktuSerah,
            'foto_bukti' => DemoAssetHelper::image("demo/serah-terima/{$peminjaman->kode}.jpg", 800, 600, 'Serah Terima'),
            'catatan' => 'Serah terima berhasil, alat dalam kondisi baik.',
        ]);

        $peminjaman->update(['status' => 'berlangsung']);
        $this->logStatus($peminjaman, 'disetujui', 'berlangsung', 'Serah terima dilakukan oleh ' . $laboran->nama_lengkap, $laboran->id, $waktuSerah);

        if ($status === 'berlangsung') {
            return;
        }

        if ($status === 'terlambat') {
            $peminjaman->update(['status' => 'terlambat']);
            $this->logStatus($peminjaman, 'berlangsung', 'terlambat', 'Peminjaman melewati batas waktu pengembalian.', $laboran->id, $peminjaman->tanggal_selesai->copy()->setTimeFromTimeString($peminjaman->jam_selesai));
            return;
        }

        // selesai: proses pengembalian
        $batasWaktu = \Carbon\Carbon::parse($peminjaman->tanggal_selesai->toDateString() . ' ' . $peminjaman->jam_selesai);
        if ($scenario['terlambat_hari'] > 0) {
            $waktuKembali = $batasWaktu->copy()->addDays($scenario['terlambat_hari'])->setTimeFromTimeString('18:00:00');
        } else {
            $waktuKembali = $batasWaktu->copy();
        }
        $terlambatMenit = (int) max(0, $batasWaktu->diffInMinutes($waktuKembali, false));

        $toleransi = (int) Pengaturan::get('denda.toleransi_keterlambatan_menit', 30);
        $menitSetelahToleransi = (int) max(0, $terlambatMenit - $toleransi);
        $dendaPerHari = (int) Pengaturan::get('denda.denda_per_hari', 50000);
        $dendaPerJam = (int) Pengaturan::get('denda.denda_per_jam', 0);
        $maksimalDenda = (int) Pengaturan::get('denda.maksimal_denda', 500000);

        if ($dendaPerJam > 0) {
            $jamTerlambat = (int) ceil($menitSetelahToleransi / 60);
            $dendaTerlambat = $jamTerlambat * $dendaPerJam;
        } else {
            $hariTerlambat = (int) ceil($menitSetelahToleransi / 1440);
            $dendaTerlambat = $hariTerlambat * $dendaPerHari;
        }
        $dendaTerlambat = min($dendaTerlambat, $maksimalDenda);

        $kondisiPengembalian = $scenario['kondisi'] ?? 'baik';
        $dendaKerusakan = 0;

        foreach ($detailIds as $item) {
            $alat = $item['alat'];
            $detail = $item['detail'];
            $jumlah = $item['jumlah'];

            $alat->stok_dipinjam -= $jumlah;

            if ($kondisiPengembalian === 'baik') {
                $alat->save();
                $detail->update([
                    'kondisi_pengembalian' => 'baik',
                    'catatan_pengembalian' => 'Dikembalikan sesuai jadwal.',
                    'denda_per_alat' => 0,
                ]);
            } else {
                $dendaPerAlat = (int) Pengaturan::get('denda.denda_' . $kondisiPengembalian, 50000);
                $dendaKerusakan += $dendaPerAlat * $jumlah;

                $alat->stok_maintenance += $jumlah;
                $alat->kondisi = $kondisiPengembalian;
                $alat->save();

                KerusakanAlat::create([
                    'alat_id' => $detail->alat_id,
                    'peminjaman_id' => $peminjaman->id,
                    'pelapor_id' => $laboran->id,
                    'jumlah' => $jumlah,
                    'kondisi' => $kondisiPengembalian,
                    'tanggal_dilaporkan' => $waktuKembali->toDateString(),
                    'status' => 'dilaporkan',
                    'keterangan' => 'Ditemukan saat pengembalian peminjaman ' . $peminjaman->kode,
                    'foto' => DemoAssetHelper::image("demo/pengembalian/{$peminjaman->kode}.jpg", 800, 600, 'Pengembalian'),
                    'stok_sudah_dialihkan' => true,
                ]);

                $detail->update([
                    'kondisi_pengembalian' => $kondisiPengembalian,
                    'catatan_pengembalian' => 'Ditemukan kerusakan saat pengembalian.',
                    'denda_per_alat' => $dendaPerAlat,
                ]);
            }
        }

        $totalDenda = $dendaTerlambat + $dendaKerusakan;

        if ($totalDenda > 0) {
            $dendaDibayar = match (true) {
                $scenario['denda_bayar'] === 0 => 0,
                $scenario['denda_bayar'] === 1 => $totalDenda,
                default => (int) round($totalDenda * $scenario['denda_bayar']),
            };
        } else {
            $dendaDibayar = 0;
        }

        Pengembalian::create([
            'peminjaman_id' => $peminjaman->id,
            'laboran_id' => $laboran->id,
            'waktu_pengembalian' => $waktuKembali,
            'foto_kondisi' => DemoAssetHelper::image("demo/pengembalian/{$peminjaman->kode}.jpg", 800, 600, 'Pengembalian'),
            'keterlambatan_menit' => $terlambatMenit,
            'total_denda' => $totalDenda,
            'denda_dibayar' => $dendaDibayar,
            'denda_keterlambatan' => $dendaTerlambat,
            'denda_kerusakan' => $dendaKerusakan,
            'catatan' => 'Pengembalian dicatat oleh ' . $laboran->nama_lengkap,
        ]);

        $peminjaman->update([
            'status' => 'selesai',
            'total_denda' => $totalDenda,
            'denda_dibayar' => $dendaDibayar,
        ]);

        $this->logStatus($peminjaman, 'berlangsung', 'selesai', 'Pengembalian alat selesai.', $laboran->id, $waktuKembali);
    }

    protected function releaseReserved($detailIds)
    {
        foreach ($detailIds as $item) {
            $alat = $item['alat'];
            $jumlah = $item['jumlah'];
            $alat->stok_reserved -= $jumlah;
            $alat->save();
        }
    }

    protected function logStatus($peminjaman, $dari, $ke, $keterangan, $userId, $waktu)
    {
        PeminjamanStatusLog::create([
            'peminjaman_id' => $peminjaman->id,
            'status_dari' => $dari,
            'status_ke' => $ke,
            'keterangan' => $keterangan,
            'user_id' => $userId,
            'created_at' => $waktu,
        ]);
    }
}
