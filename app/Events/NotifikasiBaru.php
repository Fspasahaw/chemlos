<?php

namespace App\Events;

use App\Models\Notifikasi;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotifikasiBaru implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Notifikasi $notifikasi)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.'.$this->notifikasi->user_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notifikasi->id,
            'user_id' => $this->notifikasi->user_id,
            'judul' => $this->notifikasi->judul,
            'pesan' => $this->notifikasi->pesan,
            'jenis' => $this->notifikasi->jenis,
            'link' => $this->notifikasi->link,
            'dibaca_pada' => null,
            'created_at' => $this->notifikasi->created_at?->toISOString(),
            'is_read' => false,
        ];
    }

    public function broadcastAs(): string
    {
        return 'notifikasi.baru';
    }
}
