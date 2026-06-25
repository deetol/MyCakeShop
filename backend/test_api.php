<?php

/**
 * Phase 6: API Endpoint Testing Script
 * Tests all critical endpoints without needing browser
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=======================================================\n";
echo "       PHASE 6: API ENDPOINT TESTING                  \n";
echo "=======================================================\n\n";

// Test functions
function testEndpoint($method, $uri, $headers = [], $body = null) {
    $base = 'http://127.0.0.1:8000';
    $url = $base . $uri;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'body' => $response,
        'error' => $error
    ];
}

function pass($message) {
    echo "✓ PASS: $message\n";
}

function fail($message, $details = '') {
    echo "✗ FAIL: $message\n";
    if ($details) {
        echo "  Details: $details\n";
    }
}

function info($message) {
    echo "ℹ INFO: $message\n";
}

function section($title) {
    echo "\n" . str_repeat("=", 60) . "\n";
    echo " $title\n";
    echo str_repeat("=", 60) . "\n\n";
}

// Check if server is running
section("PRE-FLIGHT CHECKS");

info("Checking if Laravel server is running on :8000...");
$serverCheck = @file_get_contents('http://127.0.0.1:8000/api/test');
if ($serverCheck === false) {
    fail("Laravel server is NOT running!");
    echo "\nPlease start the server first:\n";
    echo "  cd backend\n";
    echo "  php artisan serve\n\n";
    exit(1);
}
pass("Laravel server is running");

// Check database
info("Checking database connection...");
try {
    $userCount = \App\Models\User::count();
    pass("Database connected (Users: $userCount)");
} catch (\Exception $e) {
    fail("Database connection failed", $e->getMessage());
    exit(1);
}

// Check seeder data
info("Checking seeded data...");
$shippingCount = \App\Models\ShippingMethod::count();
$paymentCount = \App\Models\PaymentMethod::count();
$categoryCount = \App\Models\Category::count();
$productCount = \App\Models\Product::count();

if ($shippingCount === 0 || $paymentCount === 0) {
    fail("Seeders not run! Run: php artisan db:seed");
    exit(1);
}
pass("Seeded data available (Shipping: $shippingCount, Payment: $paymentCount, Products: $productCount)");

// ===== START TESTING =====

section("TEST 1: PUBLIC ENDPOINTS (No Auth)");

// Test 1.1: Shipping Methods
info("Testing GET /api/shipping-methods");
$result = testEndpoint('GET', '/api/shipping-methods');
if ($result['code'] === 200) {
    $data = json_decode($result['body'], true);
    if (isset($data['success']) && $data['success'] === true) {
        pass("Shipping methods endpoint works (" . count($data['data']) . " methods)");
    } else {
        fail("Unexpected response format");
    }
} else {
    fail("HTTP {$result['code']}", substr($result['body'], 0, 100));
}

// Test 1.2: Payment Methods
info("Testing GET /api/payment-methods");
$result = testEndpoint('GET', '/api/payment-methods');
if ($result['code'] === 200) {
    $data = json_decode($result['body'], true);
    if (isset($data['success']) && $data['success'] === true) {
        pass("Payment methods endpoint works (" . count($data['data']) . " methods)");
    } else {
        fail("Unexpected response format");
    }
} else {
    fail("HTTP {$result['code']}", substr($result['body'], 0, 100));
}

// Test 1.3: Categories
info("Testing GET /api/categories");
$result = testEndpoint('GET', '/api/categories');
if ($result['code'] === 200) {
    $data = json_decode($result['body'], true);
    if (isset($data['success']) && $data['success'] === true) {
        pass("Categories endpoint works (" . count($data['data']) . " categories)");
    } else {
        fail("Unexpected response format");
    }
} else {
    fail("HTTP {$result['code']}");
}

// Test 1.4: Products
info("Testing GET /api/products");
$result = testEndpoint('GET', '/api/products');
if ($result['code'] === 200) {
    $data = json_decode($result['body'], true);
    if (isset($data['success']) && $data['success'] === true) {
        $count = is_array($data['data']) ? count($data['data']) : 'paginated';
        pass("Products endpoint works ($count products)");
    } else {
        fail("Unexpected response format");
    }
} else {
    fail("HTTP {$result['code']}");
}

section("TEST 2: AUTHENTICATION ENDPOINTS");

// Test 2.1: Register
info("Testing POST /api/register");
$testEmail = 'test_' . time() . '@example.com';
$registerData = [
    'name' => 'Test User',
    'email' => $testEmail,
    'password' => 'password123',
    'password_confirmation' => 'password123',
];
$result = testEndpoint('POST', '/api/register', [
    'Content-Type: application/json',
    'Accept: application/json',
], $registerData);

$token = null;
if ($result['code'] === 201 || $result['code'] === 200) {
    $data = json_decode($result['body'], true);
    if (isset($data['data']['token'])) {
        $token = $data['data']['token'];
        pass("Register endpoint works (Token received)");
    } else {
        fail("No token in response");
    }
} else {
    fail("HTTP {$result['code']}", substr($result['body'], 0, 200));
}

// Test 2.2: Login
info("Testing POST /api/login");
$loginData = [
    'email' => $testEmail,
    'password' => 'password123',
];
$result = testEndpoint('POST', '/api/login', [
    'Content-Type: application/json',
    'Accept: application/json',
], $loginData);

if ($result['code'] === 200) {
    $data = json_decode($result['body'], true);
    if (isset($data['data']['token'])) {
        $token = $data['data']['token']; // Update token
        pass("Login endpoint works");
    } else {
        fail("No token in response");
    }
} else {
    fail("HTTP {$result['code']}");
}

section("TEST 3: PROTECTED ENDPOINTS (With Auth)");

if (!$token) {
    fail("Cannot test protected endpoints - no token available");
    exit(1);
}

$authHeaders = [
    'Content-Type: application/json',
    'Accept: application/json',
    "Authorization: Bearer $token",
];

// Test 3.1: Get Profile
info("Testing GET /api/me");
$result = testEndpoint('GET', '/api/me', $authHeaders);
if ($result['code'] === 200) {
    pass("Profile endpoint works");
} else {
    fail("HTTP {$result['code']}");
}

// Test 3.2: Get Cart
info("Testing GET /api/cart");
$result = testEndpoint('GET', '/api/cart', $authHeaders);
if ($result['code'] === 200) {
    pass("Cart endpoint works");
} else {
    fail("HTTP {$result['code']}");
}

// Test 3.3: Get Addresses
info("Testing GET /api/addresses");
$result = testEndpoint('GET', '/api/addresses', $authHeaders);
if ($result['code'] === 200) {
    pass("Addresses endpoint works");
} else {
    fail("HTTP {$result['code']}");
}

// Test 3.4: Get Orders
info("Testing GET /api/orders");
$result = testEndpoint('GET', '/api/orders', $authHeaders);
if ($result['code'] === 200) {
    $data = json_decode($result['body'], true);
    pass("Orders endpoint works");
} else {
    fail("HTTP {$result['code']}");
}

section("SUMMARY");

echo "\n";
info("All critical endpoints have been tested!");
info("For complete order flow testing, use Postman with API_TESTING_PHASE_5.md");
echo "\n";
pass("Phase 6 API Testing Complete!");
echo "\n";

echo "=======================================================\n";
echo "  Next Steps:                                          \n";
echo "  1. Test complete order flow with Postman             \n";
echo "  2. Test stock decrement on payment confirmation      \n";
echo "  3. Start frontend integration                        \n";
echo "=======================================================\n";
