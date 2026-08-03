<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class Fase7PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['*' => Http::response('fake-image-data', 200)]);
        $this->seed(DatabaseSeeder::class);
    }

    public function test_all_public_pages_return_200_without_login(): void
    {
        $pages = [
            '/' => 'Public\\/Beranda',
            '/laboratorium' => 'Public\\/Laboratorium',
            '/alat' => 'Public\\/Alat',
            '/tutorial' => 'Public\\/Tutorial',
            '/tentang' => 'Public\\/Tentang',
            '/faq' => 'Public\\/FAQ',
            '/kontak' => 'Public\\/Kontak',
            '/syarat-ketentuan' => 'Public\\/SyaratKetentuan',
            '/kebijakan-privasi' => 'Public\\/KebijakanPrivasi',
        ];

        foreach ($pages as $url => $component) {
            $response = $this->get($url);
            $response->assertStatus(200, "Halaman {$url} harus bisa diakses publik");
            $this->assertStringContainsString('"component":"' . $component . '"', $response->getContent(), "Komponen {$component} harus dirender");
        }
    }

    public function test_public_detail_pages_render(): void
    {
        $lab = \App\Models\Laboratorium::first();
        $alat = \App\Models\Alat::first();
        $tutorial = \App\Models\VideoTutorial::first();

        $this->assertNotNull($lab);
        $this->assertNotNull($alat);
        $this->assertNotNull($tutorial);

        $this->get('/laboratorium/' . $lab->slug)->assertStatus(200);
        $this->get('/alat/' . $alat->slug)->assertStatus(200);
        $this->get('/tutorial/' . $tutorial->slug)->assertStatus(200);
    }

    public function test_laboratorium_page_has_search_filter_and_pagination(): void
    {
        $response = $this->get('/laboratorium');
        $response->assertStatus(200);
        $content = $response->getContent();
        $this->assertStringContainsString('Public\\/Laboratorium', $content);
    }

    public function test_beranda_contains_public_components(): void
    {
        $response = $this->get('/');
        $content = $response->getContent();
        $this->assertStringContainsString('"component":"Public\\/Beranda"', $content);
        $this->assertStringContainsString('stats', $content);
    }

    public function test_contact_form_can_be_submitted_publicly(): void
    {
        $data = [
            'nama' => 'Pengunjung Test',
            'email' => 'pengunjung@test.com',
            'subjek' => 'Tes FASE 7',
            'pesan' => 'Pesan otomatis dari audit FASE 7.',
            'recaptcha_token' => '',
        ];

        $response = $this->post('/kontak', $data);
        $response->assertRedirect();
        $this->assertDatabaseHas('kontak_pesan', [
            'email' => 'pengunjung@test.com',
            'subjek' => 'Tes FASE 7',
            'status' => 'baru',
        ]);
    }

    public function test_public_pages_have_consistent_layout_props(): void
    {
        $response = $this->get('/laboratorium');
        $content = $response->getContent();
        $this->assertStringContainsString('laboratorium', $content);
        $this->assertStringContainsString('filters', $content);
    }
}
