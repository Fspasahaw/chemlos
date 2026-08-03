<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Label {{ $alat->nama }}</title>
    <style>
        @page {
            size: 80mm 50mm;
            margin: 3mm;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            color: #1f2937;
        }
        .label {
            width: 74mm;
            height: 44mm;
            position: relative;
        }
        .logo {
            font-size: 8pt;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 2mm;
            display: flex;
            align-items: center;
            gap: 2mm;
        }
        .nama {
            font-size: 11pt;
            font-weight: bold;
            line-height: 1.2;
            max-width: 42mm;
            word-wrap: break-word;
        }
        .kode {
            font-size: 9pt;
            color: #4b5563;
            margin-top: 1mm;
        }
        .url {
            font-size: 6pt;
            color: #6b7280;
            position: absolute;
            bottom: 0;
            left: 0;
            max-width: 42mm;
            word-wrap: break-word;
        }
        .qr {
            position: absolute;
            right: 0;
            top: 0;
            width: 34mm;
            height: 34mm;
        }
        .qr svg {
            width: 100%;
            height: 100%;
            display: block;
        }
    </style>
</head>
<body>
    <div class="label">
        <div class="qr">
            {!! $qrSvg !!}
        </div>

        <div class="logo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3L7 17H17L15 3H9Z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 17H18V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V17Z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 7V13" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
                <path d="M9 10H15" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
            </svg>
            ChemLOS
        </div>

        <div class="nama">{{ $alat->nama }}</div>
        <div class="kode">{{ $alat->kode }}</div>
        <div class="url">{{ $url }}</div>
    </div>
</body>
</html>
