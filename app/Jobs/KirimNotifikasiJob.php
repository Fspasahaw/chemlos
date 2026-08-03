<?php

namespace App\Jobs;

use App\Models\Notifikasi;
use App\Models\User;
use App\Services\NotifikasiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class KirimNotifikasiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public User|int $penerima,
        public string $judul,
        public string $pesan,
        public string $jenis = 'umum',
        public ?string $link = null,
        public array $data = [],
        public array $opsi = []
    ) {
    }

    public function handle(): void
    {
        NotifikasiService::kirim($this->penerima, $this->judul, $this->pesan, $this->jenis, $this->link, $this->data, $this->opsi);
    }
}
