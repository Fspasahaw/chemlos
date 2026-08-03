<?php

namespace App\Mail;

use App\Models\Notifikasi;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NotifikasiMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Notifikasi $notifikasi,
        public array $data = []
    ) {
    }

    public function envelope(): Envelope
    {
        $kode = $this->data['kode_peminjaman'] ?? $this->data['kode'] ?? null;
        $subjek = $this->notifikasi->judul;
        if ($kode) {
            $subjek .= " — {$kode}";
        }

        return new Envelope(
            subject: $subjek.' - ChemLOS',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.notifikasi',
            with: [
                'notifikasi' => $this->notifikasi,
                'data' => $this->data,
                'link' => $this->notifikasi->link ? url($this->notifikasi->link) : null,
            ],
        );
    }
}
