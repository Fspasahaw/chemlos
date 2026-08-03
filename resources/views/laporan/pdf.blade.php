<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 45mm 15mm 15mm 15mm;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 10px;
        }

        .kop-header {
            position: fixed;
            top: -45mm;
            left: -15mm;
            right: -15mm;
            height: 40mm;
            overflow: hidden;
            text-align: center;
            background-color: #fff;
        }

        .kop-header img {
            display: block;
            width: auto;
            max-width: 100%;
            height: 100%;
            margin: 0 auto;
            object-fit: contain;
        }

        .report-title {
            font-size: 16px;
            margin: 0 0 4px;
        }

        .report-meta {
            font-size: 9px;
            color: #555;
            margin-bottom: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th, td {
            border: 1px solid #333;
            padding: 5px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background-color: #f3f4f6;
            font-weight: bold;
        }

        .empty {
            text-align: center;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="kop-header">
        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('images/kop-ftui.jpg'))) }}" alt="Kop FTUI">
    </div>

    <h1 class="report-title">{{ $title }}</h1>
    <p class="report-meta">Dicetak pada: {{ now()->format('d M Y H:i') }}</p>

    @if (!empty(array_filter($filters)))
        <p class="report-meta">Filter:</p>
        @foreach ($filters as $key => $value)
            @if ($value)
                <p class="report-meta">- {{ ucfirst(str_replace('_', ' ', $key)) }}: {{ $value }}</p>
            @endif
        @endforeach
    @endif

    <table>
        <thead>
            <tr>
                <th>No</th>
                @foreach ($columns as $column)
                    <th>{{ $column }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $i => $row)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    @foreach ($row as $value)
                        <td>{{ is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : $value }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($columns) + 1 }}" class="empty">Tidak ada data.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
