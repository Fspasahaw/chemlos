<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotifikasiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'judul' => $this->judul,
            'pesan' => $this->pesan,
            'jenis' => $this->jenis,
            'link' => $this->link,
            'dibaca_pada' => $this->dibaca_pada?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'is_read' => $this->dibaca_pada !== null,
        ];
    }
}
