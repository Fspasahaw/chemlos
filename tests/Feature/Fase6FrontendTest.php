<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class Fase6FrontendTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['*' => Http::response('fake-image-data', 200)]);
        $this->seed(DatabaseSeeder::class);
    }

    public function test_required_layouts_exist(): void
    {
        $this->assertFileExists(resource_path('js/Layouts/PublicLayout.tsx'));
        $this->assertFileExists(resource_path('js/Layouts/GuestLayout.tsx'));
        $this->assertFileExists(resource_path('js/Layouts/DashboardLayout.tsx'));
    }

    public function test_required_providers_exist(): void
    {
        $this->assertFileExists(resource_path('js/Providers/ThemeProvider.tsx'));
        $this->assertFileExists(resource_path('js/Providers/LanguageProvider.tsx'));
        $this->assertFileExists(resource_path('js/Providers/NotificationProvider.tsx'));
    }

    public function test_required_reusable_components_exist(): void
    {
        $components = [
            'Button', 'Input', 'Textarea', 'Select', 'DatePicker', 'TimePicker',
            'FileUpload', 'Checkbox', 'Radio', 'Switch', 'Card', 'Badge', 'Modal',
            'Tooltip', 'Toast', 'Skeleton', 'Loader', 'LoadingScreen', 'DataTable',
            'FilterChips', 'Pagination', 'Tabs', 'Accordion', 'Stepper', 'Avatar',
            'DropdownMenu', 'Calendar', 'Chart',
        ];

        foreach ($components as $component) {
            $this->assertFileExists(
                resource_path("js/Components/{$component}.tsx"),
                "Komponen reusable {$component} tidak ditemukan"
            );
        }
    }

    public function test_app_blade_has_fouc_prevention_and_indonesian_default(): void
    {
        $blade = file_get_contents(resource_path('views/app.blade.php'));

        $this->assertStringContainsString('data-user-theme', $blade, 'app.blade.php harus membaca preferensi tema user');
        $this->assertStringContainsString('localStorage.getItem(\'theme\')', $blade, 'app.blade.php harus membaca localStorage theme');
        $this->assertStringContainsString('document.documentElement.classList.add(\'dark\')', $blade, 'app.blade.php harus menerapkan class dark sebelum hydration');
        $this->assertStringContainsString('document.documentElement.lang = lang', $blade, 'app.blade.php harus mengatur lang sebelum hydration');
        $this->assertStringContainsString("lang=\"id\"", $blade, 'HTML default language harus Indonesia');
    }

    public function test_homepage_renders_with_default_language(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('ChemLOS');
        $this->assertStringContainsString('"component":"Public\\/Beranda"', $response->getContent(), 'Beranda harus merender komponen Public/Beranda');
    }

    public function test_guest_layout_login_page_renders(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
        $this->assertStringContainsString('"component":"Auth\\/Login"', $response->getContent(), 'Login harus merender komponen Auth/Login');
    }
}
