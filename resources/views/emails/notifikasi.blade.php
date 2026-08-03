<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $notifikasi->judul }} - ChemLOS</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .wrapper {
            width: 100%;
            max-width: 600px;
            margin: 32px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            padding: 28px 32px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.02em;
        }
        .header p {
            margin: 6px 0 0;
            font-size: 13px;
            opacity: 0.92;
        }
        .content {
            padding: 32px;
            color: #1e293b;
        }
        .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 999px;
            background-color: #e0e7ff;
            color: #4338ca;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
            margin-bottom: 16px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 12px;
        }
        .message {
            font-size: 15px;
            line-height: 1.7;
            margin: 0 0 20px;
            color: #334155;
        }
        .details {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            background-color: #f8fafc;
            border-radius: 12px;
            overflow: hidden;
        }
        .details th,
        .details td {
            padding: 12px 16px;
            text-align: left;
            font-size: 14px;
            border-bottom: 1px solid #e2e8f0;
        }
        .details th {
            width: 35%;
            color: #64748b;
            font-weight: 500;
        }
        .details td {
            color: #1e293b;
        }
        .details tr:last-child th,
        .details tr:last-child td {
            border-bottom: none;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #ffffff !important;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            margin-top: 8px;
        }
        .footer {
            padding: 24px 32px;
            background-color: #f8fafc;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            line-height: 1.6;
        }
        .footer a {
            color: #4f46e5;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .wrapper {
                margin: 0;
                border-radius: 0;
            }
            .content, .header, .footer {
                padding: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>ChemLOS</h1>
            <p>Chemical Laboratory Online System - DTK FTUI</p>
        </div>

        <div class="content">
            <span class="badge">{{ str_replace('_', ' ', $notifikasi->jenis) }}</span>

            <p class="greeting">
                Halo, {{ $data['nama_lengkap'] ?? $notifikasi->user->nama_lengkap ?? 'Pengguna ChemLOS' }}
            </p>

            <p class="message">{!! nl2br(e($data['pesan_templated'] ?? $notifikasi->pesan)) !!}</p>

            @php
                $detailKeys = ['kode_peminjaman', 'kode', 'laboratorium', 'alat', 'tanggal_mulai', 'tanggal_selesai', 'status', 'alasan', 'denda', 'kondisi', 'pelapor'];
                $details = [];
                foreach ($detailKeys as $key) {
                    if (!empty($data[$key])) {
                        $details[$key] = $data[$key];
                    }
                }
            @endphp

            @if (!empty($details))
                <table class="details">
                    <tbody>
                        @foreach ($details as $key => $value)
                            <tr>
                                <th>{{ ucfirst(str_replace('_', ' ', $key)) }}</th>
                                <td>{{ $value }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif

            @if ($link)
                <a href="{{ $link }}" class="btn">Lihat Detail</a>
            @endif
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} ChemLOS - Departemen Teknik Kimia FTUI.<br>
            Jika Anda memiliki pertanyaan, hubungi kami di
            <a href="mailto:{{ config('mail.from.address') }}">{{ config('mail.from.address') }}</a>.
        </div>
    </div>
</body>
</html>
