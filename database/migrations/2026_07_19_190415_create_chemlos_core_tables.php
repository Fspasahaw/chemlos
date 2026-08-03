<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. program_studi
        Schema::create('program_studi', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 255);
            $table->enum('jenjang', ['D3', 'S1', 'S2', 'S3', 'Profesi']);
            $table->string('kode', 50)->unique();
            $table->enum('status', ['aktif', 'nonaktif']);
            $table->text('deskripsi')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. laboratorium
        Schema::create('laboratorium', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 255);
            $table->string('kode', 50)->unique();
            $table->string('slug', 255)->unique();
            $table->text('deskripsi')->nullable();
            $table->string('lokasi', 255);
            $table->string('gedung', 100)->nullable();
            $table->string('lantai', 20)->nullable();
            $table->string('ruangan', 50)->nullable();
            $table->unsignedInteger('kapasitas')->nullable();
            $table->time('jam_buka')->nullable();
            $table->time('jam_tutup')->nullable();
            $table->json('hari_operasional')->nullable();
            $table->string('email', 255)->nullable();
            $table->string('telepon', 20)->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->string('foto_utama', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. kategori_alat
        Schema::create('kategori_alat', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 255);
            $table->string('slug', 255)->unique();
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });

        // 4. alat
        Schema::create('alat', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 255);
            $table->string('kode', 50)->unique();
            $table->string('slug', 255)->unique();
            $table->foreignId('laboratorium_id')->constrained('laboratorium')->cascadeOnDelete();
            $table->foreignId('kategori_id')->nullable()->constrained('kategori_alat')->nullOnDelete();
            $table->text('deskripsi')->nullable();
            $table->json('spesifikasi')->nullable();
            $table->enum('kondisi', ['baik', 'rusak_ringan', 'rusak_berat', 'hilang'])->default('baik');
            $table->enum('status', ['tersedia', 'dipinjam', 'maintenance', 'tidak_tersedia'])->default('tersedia');
            $table->unsignedInteger('stok_total')->default(1);
            $table->unsignedInteger('stok_tersedia')->default(1);
            $table->unsignedInteger('stok_reserved')->default(0);
            $table->unsignedInteger('stok_dipinjam')->default(0);
            $table->unsignedInteger('stok_maintenance')->default(0);
            $table->text('persyaratan_khusus')->nullable();
            $table->boolean('wajib_pelatihan')->default(false);
            $table->string('foto_utama', 255)->nullable();
            $table->string('qr_code', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('laboratorium_id');
            $table->index('kategori_id');
        });

        // 5. laboratorium_pengelola
        Schema::create('laboratorium_pengelola', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laboratorium_id')->constrained('laboratorium')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('peran', ['kepala_lab', 'laboran']);
            $table->boolean('is_primary')->default(true);
            $table->timestamps();
            $table->unique(['laboratorium_id', 'user_id', 'peran']);
        });

        // 6. laboratorium_galeri
        Schema::create('laboratorium_galeri', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laboratorium_id')->constrained('laboratorium')->cascadeOnDelete();
            $table->string('file', 255);
            $table->string('judul', 255)->nullable();
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        // 7. laboratorium_dokumen
        Schema::create('laboratorium_dokumen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laboratorium_id')->constrained('laboratorium')->cascadeOnDelete();
            $table->string('judul', 255);
            $table->enum('jenis', ['sop', 'tata_tertib', 'lainnya']);
            $table->string('file', 255);
            $table->timestamps();
        });

        // 8. alat_galeri
        Schema::create('alat_galeri', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alat_id')->constrained('alat')->cascadeOnDelete();
            $table->string('file', 255);
            $table->string('judul', 255)->nullable();
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        // 9. alat_dokumen
        Schema::create('alat_dokumen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alat_id')->constrained('alat')->cascadeOnDelete();
            $table->string('judul', 255);
            $table->enum('jenis', ['manual', 'sop', 'sertifikat_kalibrasi', 'lainnya']);
            $table->string('file', 255);
            $table->timestamps();
        });

        // 10. video_tutorial
        Schema::create('video_tutorial', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 255);
            $table->string('slug', 255)->unique();
            $table->text('deskripsi')->nullable();
            $table->enum('jenis', ['alat', 'aplikasi']);
            $table->enum('sumber', ['youtube', 'url', 'upload']);
            $table->string('url', 500)->nullable();
            $table->string('file', 255)->nullable();
            $table->string('thumbnail', 255)->nullable();
            $table->unsignedInteger('durasi')->nullable();
            $table->foreignId('alat_id')->nullable()->constrained('alat')->nullOnDelete();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
        });

        // 11. peminjaman
        Schema::create('peminjaman', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('dosen_pembimbing_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('laboratorium_id')->constrained('laboratorium')->cascadeOnDelete();
            $table->string('kode', 50)->unique();
            $table->text('tujuan');
            $table->date('tanggal_mulai');
            $table->time('jam_mulai');
            $table->date('tanggal_selesai');
            $table->time('jam_selesai');
            $table->string('file_jsa', 255)->nullable();
            $table->enum('status', ['diajukan', 'menunggu_dosen', 'menunggu_laboran', 'disetujui', 'berlangsung', 'selesai', 'ditolak', 'dibatalkan', 'terlambat'])->default('diajukan');
            $table->text('alasan_penolakan')->nullable();
            $table->foreignId('dibatalkan_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->index('user_id');
            $table->index('laboratorium_id');
            $table->index('status');
        });

        // 12. peminjaman_detail
        Schema::create('peminjaman_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peminjaman_id')->constrained('peminjaman')->cascadeOnDelete();
            $table->foreignId('alat_id')->constrained('alat')->cascadeOnDelete();
            $table->unsignedInteger('jumlah')->default(1);
            $table->enum('kondisi_serah_terima', ['baik', 'rusak_ringan', 'rusak_berat', 'hilang'])->nullable();
            $table->enum('kondisi_pengembalian', ['baik', 'rusak_ringan', 'rusak_berat', 'hilang'])->nullable();
            $table->text('catatan_serah_terima')->nullable();
            $table->text('catatan_pengembalian')->nullable();
            $table->decimal('denda_per_alat', 15, 2)->default(0.00);
            $table->timestamps();
        });

        // 13. peminjaman_status_log
        Schema::create('peminjaman_status_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peminjaman_id')->constrained('peminjaman')->cascadeOnDelete();
            $table->enum('status_dari', ['diajukan', 'menunggu_dosen', 'menunggu_laboran', 'disetujui', 'berlangsung', 'selesai', 'ditolak', 'dibatalkan', 'terlambat'])->nullable();
            $table->enum('status_ke', ['diajukan', 'menunggu_dosen', 'menunggu_laboran', 'disetujui', 'berlangsung', 'selesai', 'ditolak', 'dibatalkan', 'terlambat']);
            $table->text('keterangan')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });

        // 14. serah_terima
        Schema::create('serah_terima', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peminjaman_id')->unique()->constrained('peminjaman')->cascadeOnDelete();
            $table->foreignId('laboran_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('waktu_serah_terima');
            $table->string('foto_bukti', 255)->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        // 15. pengembalian
        Schema::create('pengembalian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peminjaman_id')->unique()->constrained('peminjaman')->cascadeOnDelete();
            $table->foreignId('laboran_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('waktu_pengembalian');
            $table->string('foto_kondisi', 255)->nullable();
            $table->unsignedInteger('keterlambatan_menit')->default(0);
            $table->decimal('total_denda', 15, 2)->default(0.00);
            $table->decimal('denda_dibayar', 15, 2)->default(0.00);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        // 16. maintenance_alat
        Schema::create('maintenance_alat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alat_id')->constrained('alat')->cascadeOnDelete();
            $table->foreignId('laboratorium_id')->constrained('laboratorium')->cascadeOnDelete();
            $table->foreignId('laboran_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('jumlah')->default(1);
            $table->text('keterangan');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();
            $table->enum('status', ['dijadwalkan', 'berlangsung', 'selesai', 'dibatalkan'])->default('dijadwalkan');
            $table->decimal('biaya', 15, 2)->nullable();
            $table->string('teknisi', 255)->nullable();
            $table->timestamps();
        });

        // 17. kerusakan_alat
        Schema::create('kerusakan_alat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alat_id')->constrained('alat')->cascadeOnDelete();
            $table->foreignId('peminjaman_id')->nullable()->constrained('peminjaman')->nullOnDelete();
            $table->foreignId('pelapor_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('jumlah')->default(1);
            $table->enum('kondisi', ['rusak_ringan', 'rusak_berat', 'hilang']);
            $table->date('tanggal_dilaporkan');
            $table->enum('status', ['dilaporkan', 'dicek', 'maintenance', 'diabaikan', 'selesai'])->default('dilaporkan');
            $table->text('keterangan')->nullable();
            $table->string('foto', 255)->nullable();
            $table->foreignId('maintenance_id')->nullable()->constrained('maintenance_alat')->nullOnDelete();
            $table->timestamps();
        });

        // Tambahkan relasi balik maintenance_alat -> kerusakan_alat setelah kedua tabel ada
        Schema::table('maintenance_alat', function (Blueprint $table) {
            $table->foreignId('kerusakan_id')->nullable()->after('laboran_id')->constrained('kerusakan_alat')->nullOnDelete();
        });

        // 18. notifikasi
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('judul', 255);
            $table->text('pesan');
            $table->string('jenis', 100);
            $table->string('link', 500)->nullable();
            $table->timestamp('dibaca_pada')->nullable();
            $table->timestamps();
        });

        // 19. pengaturan
        Schema::create('pengaturan', function (Blueprint $table) {
            $table->id();
            $table->string('grup', 50);
            $table->string('key', 100);
            $table->text('value')->nullable();
            $table->timestamps();
            $table->unique(['grup', 'key']);
        });

        // 20. users: tambah kolom tambahan
        Schema::table('users', function (Blueprint $table) {
            $table->string('nama_lengkap', 255)->after('name');
            $table->string('npm_nip', 50)->unique()->after('email');
            $table->string('no_hp', 20)->nullable()->after('npm_nip');
            $table->string('avatar', 255)->nullable()->after('no_hp');
            $table->foreignId('program_studi_id')->nullable()->after('avatar')->constrained('program_studi')->nullOnDelete();
            $table->enum('jabatan_pimpinan', ['kepala_departemen', 'sekretaris_departemen', 'ketua_program_studi', 'koordinator_k3l'])->nullable()->after('program_studi_id');
            $table->enum('status', ['pending_email', 'pending_approval', 'approved', 'rejected', 'suspended'])->default('pending_email')->after('jabatan_pimpinan');
            $table->foreignId('approved_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->foreignId('rejected_by')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable()->after('rejected_by');
            $table->date('tanggal_lahir')->nullable()->after('rejection_reason');
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable()->after('tanggal_lahir');
            $table->text('alamat')->nullable()->after('jenis_kelamin');
            $table->year('angkatan')->nullable()->after('alamat');
            $table->unsignedTinyInteger('semester')->nullable()->after('angkatan');
            $table->string('foto_ktm', 255)->nullable()->after('semester');
            $table->enum('tema_preferensi', ['light', 'dark', 'system'])->default('system')->after('foto_ktm');
            $table->enum('bahasa_preferensi', ['id', 'en'])->default('id')->after('tema_preferensi');
            $table->boolean('reduce_motion')->default(false)->after('bahasa_preferensi');
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
            $table->timestamp('legal_consent_at')->nullable()->after('last_login_ip');
            $table->string('legal_consent_ip', 45)->nullable()->after('legal_consent_at');
            $table->softDeletes()->after('legal_consent_ip');

            $table->index('program_studi_id');
            $table->index('status');
            $table->index('jabatan_pimpinan');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_alat', function (Blueprint $table) {
            $table->dropForeign(['kerusakan_id']);
            $table->dropColumn('kerusakan_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['program_studi_id']);
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['rejected_by']);
            $table->dropUnique(['npm_nip']);
            $table->dropIndex(['program_studi_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['jabatan_pimpinan']);
            $table->dropColumn([
                'nama_lengkap', 'npm_nip', 'no_hp', 'avatar', 'program_studi_id',
                'jabatan_pimpinan', 'status', 'approved_by', 'approved_at', 'rejected_by',
                'rejection_reason', 'tanggal_lahir', 'jenis_kelamin', 'alamat', 'angkatan',
                'semester', 'foto_ktm', 'tema_preferensi', 'bahasa_preferensi', 'reduce_motion',
                'last_login_at', 'last_login_ip', 'legal_consent_at', 'legal_consent_ip', 'deleted_at',
            ]);
        });

        Schema::dropIfExists('pengaturan');
        Schema::dropIfExists('notifikasi');
        Schema::dropIfExists('kerusakan_alat');
        Schema::dropIfExists('maintenance_alat');
        Schema::dropIfExists('pengembalian');
        Schema::dropIfExists('serah_terima');
        Schema::dropIfExists('peminjaman_status_log');
        Schema::dropIfExists('peminjaman_detail');
        Schema::dropIfExists('peminjaman');
        Schema::dropIfExists('video_tutorial');
        Schema::dropIfExists('alat_dokumen');
        Schema::dropIfExists('alat_galeri');
        Schema::dropIfExists('alat');
        Schema::dropIfExists('kategori_alat');
        Schema::dropIfExists('laboratorium_dokumen');
        Schema::dropIfExists('laboratorium_galeri');
        Schema::dropIfExists('laboratorium_pengelola');
        Schema::dropIfExists('laboratorium');
        Schema::dropIfExists('program_studi');
    }
};
