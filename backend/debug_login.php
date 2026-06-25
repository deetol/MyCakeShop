<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== DEBUG LOGIN ===\n\n";

// Check if user exists
$user = \App\Models\User::where('email', 'customer@test.com')->first();
if ($user) {
    echo "✓ User exists in database\n";
    echo "  ID: {$user->id}\n";
    echo "  Name: {$user->name}\n";
    echo "  Email: {$user->email}\n";
    echo "  Role: {$user->role}\n";
    
    // Test password
    if (\Illuminate\Support\Facades\Hash::check('password123', $user->password)) {
        echo "✓ Password is correct\n";
    } else {
        echo "✗ Password is WRONG!\n";
    }
} else {
    echo "✗ User NOT found!\n";
}

echo "\n";

// Try API call
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'customer@test.com',
    'password' => 'password123'
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "API Response:\n";
echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
