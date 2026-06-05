<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

final class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ── Admin User ───────────────────────────────────────────────────────
        // firstOrCreate ensures this seeder is idempotent — running it twice
        // will NOT create duplicate users, which is important for CI pipelines
        // and fresh-install scripts.
        User::firstOrCreate(
            ['email' => 'admin@example.com'],  // lookup key
            [
                'name'     => 'Admin User',
                'password' => Hash::make('password'),  // Hash::make() — never store plain text
                'role'     => 'admin',
            ]
        );
        $this->command->info('✅  Admin user seeded: admin@example.com / password');
        // ── Regular User ─────────────────────────────────────────────────────
        // A standard user account to test non-admin behaviour and middleware.
        User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name'     => 'Regular User',
                'password' => Hash::make('password'),
                'role'     => 'user',
            ]
        );
        $this->command->info('✅  Regular user seeded: user@example.com / password');
    }
}