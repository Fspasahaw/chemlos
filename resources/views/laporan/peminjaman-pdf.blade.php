<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Peminjaman</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        h1 { font-size: 18px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #333; padding: 6px; text-align: left; }
        th { background-color: #f3f4f6; }
        .small { font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <h1>Laporan Peminjaman</h1>
    <p class="small">Dicetak pada: {{ now()->format('d M Y H:i') }}</p>
    @if ($filters['status'] ?? false)
        <p class="small">Status: {{ $filters['status'] }}</p>
    @endif
    @if (($filters['start'] ?? false) || ($filters['end'] ?? false))
        <p class="small">Periode: {{ $filters['start'] ?? '-' }} s/d {{ $filters['end'] ?? '-' }}</p>
    @endif

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Peminjam</th>
                <th>Laboratorium</th>
                <th>Tujuan</th>
                <th>Tanggal Mulai</th>
                <th>Tanggal Selesai</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($items as $i => $p)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $p->kode }}</td>
                    <td>{{ $p->user?->nama_lengkap ?? '-' }}</td>
                    <td>{{ $p->laboratorium?->nama ?? '-' }}</td>
                    <td>{{ $p->tujuan }}</td>
                    <td>{{ $p->tanggal_mulai?->format('d M Y') }}</td>
                    <td>{{ $p->tanggal_selesai?->format('d M Y') }}</td>
                    <td>{{ $p->status }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" style="text-align: center;">Tidak ada data.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
