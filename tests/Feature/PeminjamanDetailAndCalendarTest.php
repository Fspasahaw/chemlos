<?php

namespace Tests\Feature;

class PeminjamanDetailAndCalendarTest extends PeminjamanFlowTest
{
    public function test_mahasiswa_dapat_melihat_detail_peminjaman(): void
    {
        $peminjaman = $this->ajukanPeminjaman();

        $response = $this->actingAs($this->mahasiswa)
            ->get("/dashboard/mahasiswa/peminjaman/{$peminjaman->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard/Peminjaman/Show')
            ->has('peminjaman')
            ->where('role', 'mahasiswa')
        );
    }

    public function test_laboran_dapat_melihat_detail_peminjaman(): void
    {
        $peminjaman = $this->ajukanPeminjaman();

        $response = $this->actingAs($this->laboran)
            ->get("/dashboard/laboran/peminjaman/{$peminjaman->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard/Peminjaman/Show')
            ->where('role', 'laboran')
        );
    }

    public function test_kalender_peminjaman_mengembalikan_json(): void
    {
        $this->ajukanPeminjaman();

        $response = $this->actingAs($this->mahasiswa)
            ->get('/kalender/peminjaman');

        $response->assertOk();
        $response->assertJsonStructure([[ 'id', 'title', 'start', 'end', 'color' ]]);
    }

    public function test_index_peminjaman_dapat_difilter_dan_dicari(): void
    {
        $this->ajukanPeminjaman();

        $response = $this->actingAs($this->mahasiswa)
            ->get('/dashboard/mahasiswa/peminjaman?search=PINJ&status=menunggu_dosen');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard/Mahasiswa/Peminjaman/Index')
            ->has('items.data')
            ->where('filters.search', 'PINJ')
            ->where('filters.status', 'menunggu_dosen')
        );
    }

    public function test_api_availability_mengembalikan_stok(): void
    {
        $response = $this->actingAs($this->mahasiswa)
            ->get("/api/v1/alat/{$this->alat->id}/availability?tanggal_mulai=".now()->addDay()->toDateString()."&jam_mulai=08:00&tanggal_selesai=".now()->addDays(2)->toDateString()."&jam_selesai=17:00");

        $response->assertOk();
        $response->assertJsonPath('tersedia', 5);
    }
}
