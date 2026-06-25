<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Creating test users...\n\n";

// Create regular user
$user = \App\Models\User::firstOrCreate(
    ['email' => 'customer@test.com'],
    [
        'name' => 'Test Customer',
        'phone' => '081234567890',
        'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        'role' => 'customer',
    ]
);

echo "✓ Customer created: customer@test.com / password123\n";
echo "  ID: {$user->id}, Role: {$user->role}\n\n";

// Create admin user
$admin = \App\Models\User::firstOrCreate(
    ['email' => 'admin@test.com'],
    [
        'name' => 'Test Admin',
        'phone' => '081234567891',
        'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
        'role' => 'admin',
    ]
);

echo "✓ Admin created: admin@test.com / admin123\n";
echo "  ID: {$admin->id}, Role: {$admin->role}\n\n";

// Create some products if none exist
if (\App\Models\Product::count() === 0) {
    echo "Creating test products...\n";
    
    $category = \App\Models\Category::firstOrCreate(
        ['slug' => 'cakes'],
        ['name' => 'Cakes', 'description' => 'Delicious cakes']
    );
    
    \App\Models\Product::create([
        'category_id' => $category->id,
        'name' => 'Chocolate Cake',
        'slug' => 'chocolate-cake',
        'description' => 'Delicious chocolate cake',
        'base_price' => 150000,
        'main_image' => 'products/chocolate-cake.jpg',
        'stock' => 100,
        'is_active' => true,
    ]);
    
    \App\Models\Product::create([
        'category_id' => $category->id,
        'name' => 'Vanilla Cake',
        'slug' => 'vanilla-cake',
        'description' => 'Delicious vanilla cake',
        'base_price' => 120000,
        'main_image' => 'products/vanilla-cake.jpg',
        'stock' => 50,
        'is_active' => true,
    ]);
    
    echo "✓ Created 2 test products\n\n";
}

echo "===========================================\n";
echo "Test users ready!\n";
echo "===========================================\n";
echo "\nUse these credentials for testing:\n";
echo "Customer: customer@test.com / password123\n";
echo "Admin:    admin@test.com / admin123\n";
