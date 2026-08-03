<?php

namespace App\Services;

use App\Models\Pengaturan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Kirim pesan WhatsApp berdasarkan pengaturan provider.
     * Provider yang didukung: stub (default), fonnte, twilio.
     */
    public static function kirim(?string $nomor, string $judul, string $pesan, array $data = []): bool
    {
        if (empty($nomor)) {
            Log::channel('whatsapp')->warning('WhatsApp tidak terkirim: nomor kosong', ['judul' => $judul]);

            return false;
        }

        $clean = preg_replace('/[^0-9]/', '', $nomor);
        if (empty($clean)) {
            Log::channel('whatsapp')->warning('WhatsApp tidak terkirim: nomor tidak valid', ['nomor' => $nomor]);

            return false;
        }

        $text = self::formatPesan($judul, $pesan, $data);

        $provider = Pengaturan::get('notifikasi.whatsapp_provider', 'stub');

        if ($provider === 'fonnte') {
            return self::kirimFonnte($clean, $text);
        }

        if ($provider === 'twilio') {
            return self::kirimTwilio($clean, $text);
        }

        // Mode stub: catat ke log sebagai simulasi pengiriman
        Log::channel('whatsapp')->info('WhatsApp stub dikirim', [
            'ke' => $clean,
            'provider' => $provider,
            'pesan' => $text,
            'waktu' => now()->toDateTimeString(),
        ]);

        return true;
    }

    private static function formatPesan(string $judul, string $pesan, array $data = []): string
    {
        $text = "*{$judul}*\n\n{$pesan}";

        $link = $data['link_detail'] ?? $data['link'] ?? null;
        if ($link) {
            $text .= "\n\nDetail: ".url($link);
        }

        $text .= "\n\n_ChemLOS DTK FTUI_";

        return $text;
    }

    private static function kirimFonnte(string $nomor, string $pesan): bool
    {
        $apiKey = Pengaturan::get('notifikasi.whatsapp_api_key');
        $baseUrl = rtrim(Pengaturan::get('notifikasi.whatsapp_base_url', 'https://api.fonnte.com'), '/');

        if (empty($apiKey) || empty($baseUrl)) {
            Log::channel('whatsapp')->warning('Konfigurasi Fonnte belum lengkap, fallback ke stub', ['nomor' => $nomor]);

            return self::logStub($nomor, $pesan, 'fonnte');
        }

        try {
            $response = Http::withToken($apiKey, 'Bearer')
                ->timeout(30)
                ->post($baseUrl.'/send', [
                    'target' => $nomor,
                    'message' => $pesan,
                ]);

            Log::channel('whatsapp')->info('Fonnte response', [
                'nomor' => $nomor,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return $response->successful();
        } catch (\Throwable $e) {
            Log::channel('whatsapp')->error('Gagal mengirim WhatsApp via Fonnte: '.$e->getMessage(), ['nomor' => $nomor]);

            return false;
        }
    }

    private static function kirimTwilio(string $nomor, string $pesan): bool
    {
        Log::channel('whatsapp')->info('Twilio belum diimplementasikan penuh, fallback ke stub', ['nomor' => $nomor]);

        return self::logStub($nomor, $pesan, 'twilio');
    }

    private static function logStub(string $nomor, string $pesan, string $provider): bool
    {
        Log::channel('whatsapp')->info('WhatsApp stub dikirim', [
            'ke' => $nomor,
            'provider' => $provider,
            'pesan' => $pesan,
            'waktu' => now()->toDateTimeString(),
        ]);

        return true;
    }
}
