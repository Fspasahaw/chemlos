<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'users.view', 'users.create', 'users.edit', 'users.delete', 'users.approve',
            'program-studi.manage', 'program-studi.view',
            'laboratorium.manage', 'laboratorium.view',
            'kategori-alat.manage',
            'alat.manage', 'alat.view',
            'peminjaman.view', 'peminjaman.create', 'peminjaman.approve', 'peminjaman.process',
            'serah-terima.manage',
            'pengembalian.manage',
            'kerusakan-alat.manage', 'kerusakan-alat.view',
            'maintenance-alat.manage', 'maintenance-alat.view',
            'laporan.view',
            'pengaturan.manage', 'pengaturan.view',
            'notifikasi.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $roles = [
            'admin' => $permissions,
            'pimpinan' => [
                'users.view', 'laboratorium.view', 'alat.view', 'peminjaman.view',
                'program-studi.view', 'laporan.view', 'notifikasi.view', 'pengaturan.view',
                'kerusakan-alat.view', 'maintenance-alat.view',
            ],
            'kepala_lab' => [
                'laboratorium.manage', 'alat.manage', 'peminjaman.view', 'peminjaman.approve',
                'kerusakan-alat.manage', 'maintenance-alat.manage', 'laporan.view', 'notifikasi.view',
            ],
            'laboran' => [
                'laboratorium.manage', 'alat.manage', 'users.approve',
                'peminjaman.view', 'peminjaman.process',
                'serah-terima.manage', 'pengembalian.manage', 'kerusakan-alat.manage',
                'maintenance-alat.manage', 'laporan.view', 'notifikasi.view',
            ],
            'dosen' => [
                'laboratorium.view', 'alat.view', 'peminjaman.view', 'peminjaman.create', 'peminjaman.approve',
                'kerusakan-alat.view', 'laporan.view', 'notifikasi.view',
            ],
            'mahasiswa' => [
                'laboratorium.view', 'alat.view', 'peminjaman.view', 'peminjaman.create', 'kerusakan-alat.view',
                'notifikasi.view',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($rolePermissions);
        }
    }
}
