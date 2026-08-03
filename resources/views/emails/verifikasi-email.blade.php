<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Email Anda - ChemLOS</title>
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
        .greeting {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 12px;
        }
        .message {
            font-size: 15px;
            line-height: 1.7;
            margin: 0 0 24px;
            color: #334155;
        }
        .btn {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #ffffff !important;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
        }
        .fallback {
            margin-top: 24px;
            padding: 16px;
            background-color: #f8fafc;
            border-radius: 8px;
            font-size: 12px;
            color: #64748b;
            word-break: break-all;
        }
        .footer {
            padding: 24px 32px;
            background-color: #f8fafc;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            line-height: 1.6;
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
            <p class="greeting">Halo, {{ $user->nama_lengkap ?? 'Pengguna ChemLOS' }}</p>
            <p class="message">
                {!! $customBody ? nl2br(e($customBody)) : 'Terima kasih telah mendaftar di ChemLOS. Silakan klik tombol di bawah ini untuk memverifikasi email Anda dan melanjutkan proses persetujuan akun.' !!}
            </p>

            <a href="{{ $verificationUrl }}" class="btn">Verifikasi Email</a>

            <div class="fallback">
                Jika tombol tidak berfungsi, salin dan tempel link berikut ke browser Anda:<br>
                {{ $verificationUrl }}
            </div>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} ChemLOS - Departemen Teknik Kimia FTUI.<br>
            Jika Anda memiliki pertanyaan, hubungi kami di
            <a href="mailto:{{ config('mail.from.address') }}">{{ config('mail.from.address') }}</a>.
        </div>
    </div>
</body>
</html>
