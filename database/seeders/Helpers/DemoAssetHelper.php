<?php

namespace Database\Seeders\Helpers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class DemoAssetHelper
{
    public static function disk(): \Illuminate\Contracts\Filesystem\Filesystem
    {
        return Storage::disk('public');
    }

    public static function ensureDirectory(string $path): void
    {
        self::disk()->makeDirectory($path);
    }

    public static function image(string $path, int $width, int $height, string $label = ''): string
    {
        $disk = self::disk();
        $fullPath = $disk->path($path);

        $dir = dirname($fullPath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $seed = urlencode(substr(preg_replace('/[^a-zA-Z0-9]/', '-', $path), 0, 60));

        // Avatar (200x200) gunakan UI Avatars agar lebih realistis untuk profil.
        if ($width === 200 && $height === 200 && $label) {
            $url = 'https://ui-avatars.com/api/?name=' . urlencode($label) . '&size=200&background=random&color=fff';
        } else {
            $url = "https://picsum.photos/seed/{$seed}/{$width}/{$height}";
        }

        try {
            $response = Http::timeout(20)->get($url);
            if ($response->successful()) {
                file_put_contents($fullPath, $response->body());

                return $path;
            }
        } catch (\Throwable $e) {
            // Lanjutkan ke fallback GD
        }

        return self::placeholderImage($fullPath, $path, $width, $height, $label);
    }

    protected static function placeholderImage(string $fullPath, string $path, int $width, int $height, string $label = ''): string
    {
        $image = imagecreatetruecolor($width, $height);

        $bgColor = imagecolorallocate($image, 240, 247, 255);
        $accentColor = imagecolorallocate($image, 99, 102, 241);
        $textColor = imagecolorallocate($image, 30, 41, 59);
        $lightColor = imagecolorallocate($image, 255, 255, 255);

        imagefill($image, 0, 0, $bgColor);
        imagefilledrectangle($image, 0, 0, $width, max(12, (int) ($height * 0.06)), $accentColor);

        $boxW = (int) ($width * 0.7);
        $boxH = (int) ($height * 0.5);
        $boxX = (int) (($width - $boxW) / 2);
        $boxY = (int) (($height - $boxH) / 2);
        imagefilledrectangle($image, $boxX, $boxY, $boxX + $boxW, $boxY + $boxH, $lightColor);
        imagerectangle($image, $boxX, $boxY, $boxX + $boxW, $boxY + $boxH, $accentColor);

        $text = $label ?: 'Demo';
        $font = self::fontPath();
        $fontSize = max(12, min(24, (int) ($width / max(1, mb_strlen($text) + 2) * 1.5)));

        if ($font && file_exists($font)) {
            $bbox = imagettfbbox($fontSize, 0, $font, $text);
            if ($bbox !== false) {
                $textWidth = abs($bbox[4] - $bbox[0]);
                $textHeight = abs($bbox[5] - $bbox[1]);
                $textX = (int) (($width - $textWidth) / 2);
                $textY = (int) (($height + $textHeight) / 2);
                imagettftext($image, $fontSize, 0, $textX, $textY, $textColor, $font, $text);
            } else {
                imagestring($image, 5, (int) (($width - (strlen($text) * 8)) / 2), (int) ($height / 2), $text, $textColor);
            }
        } else {
            imagestring($image, 5, (int) (($width - (strlen($text) * 8)) / 2), (int) ($height / 2), $text, $textColor);
        }

        imagejpeg($image, $fullPath, 85);

        return $path;
    }

    public static function pdf(string $path, string $title): string
    {
        $disk = self::disk();
        $fullPath = $disk->path($path);

        $dir = dirname($fullPath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $date = date('Y-m-d H:i:s');
        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{$title}</title>
    <style>
        body { font-family: sans-serif; padding: 40px; color: #1e293b; }
        h1 { color: #6366f1; }
        .meta { margin-top: 30px; color: #64748b; }
    </style>
</head>
<body>
    <h1>{$title}</h1>
    <p>Dokumen demo untuk sistem ChemLOS.</p>
    <div class="meta">
        <p>Dibuat: {$date}</p>
        <p>ChemLOS - Chemical Laboratory Online System</p>
    </div>
</body>
</html>
HTML;

        $pdf = app('dompdf.wrapper');
        $pdf->loadHtml($html);
        $pdf->setPaper('A4', 'portrait');
        $pdf->render();

        file_put_contents($fullPath, $pdf->output());

        return $path;
    }

    public static function qr(string $path, string $data): string
    {
        $disk = self::disk();
        $fullPath = $disk->path($path);

        $dir = dirname($fullPath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $size = 256;
        $image = imagecreatetruecolor($size, $size);
        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 0, 0, 0);
        $accent = imagecolorallocate($image, 99, 102, 241);

        imagefill($image, 0, 0, $white);
        imagerectangle($image, 0, 0, $size - 1, $size - 1, $accent);

        // Draw position detection patterns
        self::drawQrPosition($image, 20, 20, $black);
        self::drawQrPosition($image, $size - 60, 20, $black);
        self::drawQrPosition($image, 20, $size - 60, $black);

        // Random-ish modules based on data hash
        $hash = md5($data);
        $moduleSize = 6;
        $cols = (int) (($size - 80) / $moduleSize);
        $startX = 80;
        $startY = 80;

        for ($i = 0; $i < $cols; $i++) {
            for ($j = 0; $j < $cols; $j++) {
                $index = ($i * $cols + $j) % 32;
                if (hexdec($hash[$index]) % 2 === 0) {
                    imagefilledrectangle($image, $startX + $i * $moduleSize, $startY + $j * $moduleSize, $startX + ($i + 1) * $moduleSize - 1, $startY + ($j + 1) * $moduleSize - 1, $black);
                }
            }
        }

        // Footer label
        $fontSize = 10;
        $label = substr($data, 0, 32);
        $font = self::fontPath();
        if ($font && file_exists($font)) {
            $bbox = imagettfbbox($fontSize, 0, $font, $label);
            if ($bbox !== false) {
                $textWidth = abs($bbox[4] - $bbox[0]);
                $textX = (int) (($size - $textWidth) / 2);
                imagettftext($image, $fontSize, 0, $textX, $size - 12, $accent, $font, $label);
            } else {
                imagestring($image, 3, 20, $size - 16, $label, $accent);
            }
        } else {
            imagestring($image, 3, 20, $size - 16, $label, $accent);
        }

        imagepng($image, $fullPath);

        return $path;
    }

    protected static function drawQrPosition($image, int $x, int $y, int $color): void
    {
        $outer = 24;
        $inner = 14;
        $dot = 6;

        imagefilledrectangle($image, $x, $y, $x + $outer, $y + $outer, $color);
        imagefilledrectangle($image, $x + 4, $y + 4, $x + $outer - 4, $y + $outer - 4, imagecolorallocate($image, 255, 255, 255));
        imagefilledrectangle($image, $x + 9, $y + 9, $x + 9 + $dot, $y + 9 + $dot, $color);
    }

    protected static function fontPath(): string
    {
        $candidates = [
            'C:/Windows/Fonts/arial.ttf',
            'C:/Windows/Fonts/segoeui.ttf',
            'C:/Windows/Fonts/calibri.ttf',
        ];

        foreach ($candidates as $font) {
            if (file_exists($font)) {
                return $font;
            }
        }

        return '';
    }
}
