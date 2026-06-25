<?php

/**
 * Comprehensive API Testing Script
 * Tests complete order flow including critical stock decrement
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Colors for terminal output
function green($text) { return "\033[32m$text\033[0m"; }
function red($text) { return "\033[31m$text\033[0m"; }
function yellow($text) { return "\033[33m$text\033[0m"; }
function blue($text) { return "\033[34m$text\033[0m"; }
function bold($text) { return "\033[1m$text\033[0m"; }

function pass($message) { echo green("✓ PASS: ") . "$message\n"; }
function fail($message, $details = '') {
    echo red("✗ FAIL: ") . "$message\n";
    if ($details) echo "  " . yellow("Details: ") . "$details\n";
}
function info($message) { echo blue("ℹ INFO: ") . "$message\n"; }
function section($title) {
    echo "\n" . str_repeat("=", 70) . "\n";
    echo bold(" $title") . "\n";
    echo str_repeat("=", 70) . "\n\n";
}
function critical($message) { echo "\n" . yellow("⚠️  CRITICAL: ") . bold($message) . "\n\n"; }

$base = 'http://127.0.0.1:8000/api';
$testResults = [
    'passed' => 0,
    'failed' => 0,
    'total' => 0
];

function apiCall($method, $endpoint, $data = null, $token = null) {
    global $base;
    
    $ch = curl_init();
    $url = $base . $endpoint;
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json'
    ];
    
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data !== null && in_array($method, ['POST', 'PUT'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'body' => $response,
        'data' => json_decode($response, true),
        'error' => $error
    ];
}

function testCase($name, $passed, $details = '') {
    global $testResults;
    $testResults['total']++;
    if ($passed) {
        $testResults['passed']++;
        pass($name);
    } else {
        $testResults['failed']++;
        fail($name, $details);
    }
    return $passed;
}

echo bold("\n╔════════════════════════════════════════════════════════════════╗\n");
echo bold("║     MYCAKESHOP API - COMPREHENSIVE TESTING                     ║\n");
echo bold("╚════════════════════════════════════════════════════════════════╝\n");

// ===== PRE-FLIGHT CHECKS =====
section("PRE-FLIGHT CHECKS");

info("Checking Laravel server...");
$serverCheck = @file_get_contents('http://127.0.0.1:8000/api/test');
if ($serverCheck === false) {
    fail("Server not running on port 8000!");
    echo "\nPlease start: php artisan serve\n\n";
    exit(1);
}
pass("Server is running on port 8000");

info("Checking database connection...");
try {
    $productCount = \App\Models\Product::count();
    pass("Database connected (Products: $productCount)");
} catch (\Exception $e) {
    fail("Database connection failed", $e->getMessage());
    exit(1);
}

// Get initial product for stock testing
$testProduct = \App\Models\Product::first();
if (!$testProduct) {
    fail("No products in database! Run seeders first.");
    exit(1);
}

$initialStock = $testProduct->stock;
$productId = $testProduct->id;
$productSlug = $testProduct->slug;

info("Test product: {$testProduct->name} (ID: $productId)");
info("Initial stock: $initialStock");

// ===== TEST 1: PUBLIC ENDPOINTS =====
section("TEST 1: PUBLIC ENDPOINTS");

$result = apiCall('GET', '/shipping-methods');
testCase(
    "GET /api/shipping-methods",
    $result['code'] === 200 && isset($result['data']['success']),
    $result['code'] != 200 ? "HTTP {$result['code']}" : ''
);

$result = apiCall('GET', '/payment-methods');
testCase(
    "GET /api/payment-methods",
    $result['code'] === 200 && isset($result['data']['success']),
    $result['code'] != 200 ? "HTTP {$result['code']}" : ''
);

$result = apiCall('GET', '/categories');
testCase(
    "GET /api/categories",
    $result['code'] === 200 && isset($result['data']['success']),
    $result['code'] != 200 ? "HTTP {$result['code']}" : ''
);

$result = apiCall('GET', '/products');
testCase(
    "GET /api/products",
    $result['code'] === 200,
    $result['code'] != 200 ? "HTTP {$result['code']}" : ''
);

$result = apiCall('GET', "/products/$productSlug");
testCase(
    "GET /api/products/{slug}",
    $result['code'] === 200 && isset($result['data']['data']['stock']),
    $result['code'] != 200 ? "HTTP {$result['code']}" : ''
);

if ($result['code'] === 200) {
    $fetchedStock = $result['data']['data']['stock'] ?? 0;
    info("Stock via API: $fetchedStock");
}

// ===== TEST 2: AUTHENTICATION =====
section("TEST 2: AUTHENTICATION");

$loginData = [
    'login' => 'customer@test.com',
    'password' => 'password123'
];
$result = apiCall('POST', '/login', $loginData);
$customerToken = null;

if (testCase(
    "POST /api/login (Customer)",
    $result['code'] === 200 && isset($result['data']['data']['token']),
    $result['code'] != 200 ? "HTTP {$result['code']}: " . ($result['body'] ?? '') : ''
)) {
    $customerToken = $result['data']['data']['token'];
    info("Customer token received: " . substr($customerToken, 0, 20) . "...");
}

if (!$customerToken) {
    fail("Cannot continue without customer token!");
    exit(1);
}

$result = apiCall('GET', '/me', null, $customerToken);
testCase(
    "GET /api/me (with token)",
    $result['code'] === 200 && isset($result['data']['data']['email']),
    $result['code'] != 200 ? "HTTP {$result['code']}" : ''
);

// ===== TEST 3: CART OPERATIONS =====
section("TEST 3: CART OPERATIONS");

// Clear cart first
$result = apiCall('DELETE', '/cart', null, $customerToken);
info("Cart cleared before testing");

$result = apiCall('GET', '/cart', null, $customerToken);
testCase(
    "GET /api/cart (empty)",
    $result['code'] === 200,
    $result['code'] != 200 ? "HTTP {$result['code']}" : ''
);

$cartData = [
    'product_id' => $productId,
    'quantity' => 5
];
$result = apiCall('POST', '/cart', $cartData, $customerToken);
testCase(
    "POST /api/cart (add item, qty: 5)",
    $result['code'] === 201 || $result['code'] === 200,
    $result['code'] != 200 && $result['code'] != 201 ? "HTTP {$result['code']}" : ''
);

// ===== TEST 4: ADDRESS =====
section("TEST 4: ADDRESS MANAGEMENT");

$addressData = [
    'label' => 'Rumah',
    'recipient_name' => 'Test Customer',
    'phone' => '081234567890',
    'address_line' => 'Jl. Test No. 123',
    'city' => 'Jakarta',
    'province' => 'DKI Jakarta',
    'postal_code' => '12345',
    'is_default' => true
];
$result = apiCall('POST', '/addresses', $addressData, $customerToken);
$addressId = null;

if (testCase(
    "POST /api/addresses",
    $result['code'] === 201 || $result['code'] === 200,
    $result['code'] != 200 && $result['code'] != 201 ? "HTTP {$result['code']}" : ''
)) {
    $addressId = $result['data']['data']['id'] ?? null;
    if ($addressId) {
        info("Address created with ID: $addressId");
    }
}

if (!$addressId) {
    fail("Cannot continue without address!");
    exit(1);
}

// ===== TEST 5: CHECK STOCK BEFORE ORDER =====
section("TEST 5: STOCK CHECK - BEFORE ORDER");

critical("Checking stock BEFORE creating order...");
$currentStock = \App\Models\Product::find($productId)->stock;
info("Current stock (DB): $currentStock");
info("Expected: Should be $initialStock (unchanged)");

testCase(
    "Stock unchanged before order",
    $currentStock == $initialStock,
    "Stock is $currentStock, expected $initialStock"
);

// ===== TEST 6: CREATE ORDER =====
section("TEST 6: ORDER CREATION");

$orderData = [
    'address_id' => $addressId,
    'shipping_method_id' => 1,
    'payment_method_id' => 1,
    'notes' => 'Automated test order'
];
$result = apiCall('POST', '/orders', $orderData, $customerToken);
$orderUuid = null;
$paymentId = null;

if (testCase(
    "POST /api/orders",
    $result['code'] === 201 || $result['code'] === 200,
    $result['code'] != 200 && $result['code'] != 201 ? json_encode($result['data']) : ''
)) {
    $orderUuid = $result['data']['data']['uuid'] ?? null;
    $paymentId = $result['data']['data']['payment']['id'] ?? null;
    
    if ($orderUuid) {
        info("Order created with UUID: $orderUuid");
    }
    if ($paymentId) {
        info("Payment record created with ID: $paymentId");
    }
}

if (!$orderUuid || !$paymentId) {
    fail("Cannot continue without order/payment!");
    exit(1);
}

// ===== TEST 7: CRITICAL - STOCK AFTER ORDER =====
section("TEST 7: 🔥 CRITICAL - STOCK CHECK AFTER ORDER");

critical("Checking if stock UNCHANGED after order creation...");
sleep(1); // Give DB a moment
$stockAfterOrder = \App\Models\Product::find($productId)->stock;

info("Stock after order (DB): $stockAfterOrder");
info("Expected: $initialStock (MUST be unchanged!)");

$stockUnchangedAfterOrder = testCase(
    "Stock UNCHANGED after order creation",
    $stockAfterOrder == $initialStock,
    "Stock changed to $stockAfterOrder! Expected $initialStock. This is a BUG!"
);

if (!$stockUnchangedAfterOrder) {
    fail("❌ CRITICAL BUG: Stock decreased when order was created!");
    fail("Stock should only decrease when payment is CONFIRMED!");
    echo "\n" . red("Testing stopped. Fix this bug before continuing!") . "\n\n";
    exit(1);
}

pass("✅ GOOD: Stock correctly unchanged after order");

// ===== TEST 8: ADMIN LOGIN =====
section("TEST 8: ADMIN AUTHENTICATION");

$adminLoginData = [
    'login' => 'admin@test.com',
    'password' => 'admin123'
];
$result = apiCall('POST', '/login', $adminLoginData);
$adminToken = null;

if (testCase(
    "POST /api/login (Admin)",
    $result['code'] === 200 && isset($result['data']['data']['token']),
    $result['code'] != 200 ? "HTTP {$result['code']}" : ''
)) {
    $adminToken = $result['data']['data']['token'];
    info("Admin token received");
}

if (!$adminToken) {
    fail("Cannot continue without admin token!");
    exit(1);
}

// ===== TEST 9: PAYMENT CONFIRMATION =====
section("TEST 9: 🚨 MOST CRITICAL - PAYMENT CONFIRMATION");

critical("CONFIRMING PAYMENT - This should DECREMENT stock!");

$result = apiCall('PUT', "/payments/$paymentId/confirm", null, $adminToken);
testCase(
    "PUT /api/payments/{id}/confirm (Admin)",
    $result['code'] === 200,
    $result['code'] != 200 ? "HTTP {$result['code']}: " . json_encode($result['data']) : ''
);

// ===== TEST 10: FINAL STOCK VERIFICATION =====
section("TEST 10: 🎯 FINAL STOCK VERIFICATION");

critical("Checking if stock DECREMENTED after payment confirmation...");
sleep(1); // Give DB a moment

$finalStock = \App\Models\Product::find($productId)->stock;
$expectedStock = $initialStock - 5; // We ordered quantity 5

info("Initial stock:     $initialStock");
info("Order quantity:    5");
info("Expected stock:    $expectedStock");
info("Actual final stock: $finalStock");

echo "\n";
if ($finalStock == $expectedStock) {
    echo green("╔═══════════════════════════════════════════════════════╗\n");
    echo green("║  ✅ SUCCESS! STOCK DECREMENT WORKING CORRECTLY! ✅    ║\n");
    echo green("╚═══════════════════════════════════════════════════════╝\n");
    testCase("Stock DECREMENTED correctly after payment", true);
} else {
    echo red("╔═══════════════════════════════════════════════════════╗\n");
    echo red("║  ❌ FAILED! STOCK DECREMENT NOT WORKING! ❌           ║\n");
    echo red("╚═══════════════════════════════════════════════════════╝\n");
    testCase(
        "Stock DECREMENTED correctly after payment",
        false,
        "Stock is $finalStock, expected $expectedStock"
    );
}

// ===== TEST 11: ORDER DETAIL =====
section("TEST 11: ORDER VERIFICATION");

$result = apiCall('GET', "/orders/$orderUuid", null, $customerToken);
if (testCase(
    "GET /api/orders/{uuid}",
    $result['code'] === 200,
    $result['code'] != 200 ? "HTTP {$result['code']}" : ''
)) {
    $order = $result['data']['data'] ?? null;
    if ($order) {
        info("Order status: " . ($order['status'] ?? 'unknown'));
        info("Payment status: " . ($order['payment_status'] ?? 'unknown'));
        
        testCase(
            "Order status is 'processing'",
            ($order['status'] ?? '') === 'processing',
            "Status is: " . ($order['status'] ?? 'unknown')
        );
        
        testCase(
            "Payment status is 'paid'",
            ($order['payment_status'] ?? '') === 'paid',
            "Payment status is: " . ($order['payment_status'] ?? 'unknown')
        );
    }
}

// ===== FINAL SUMMARY =====
section("TEST RESULTS SUMMARY");

echo "\n";
echo bold("Total Tests: ") . $testResults['total'] . "\n";
echo green("Passed: ") . $testResults['passed'] . "\n";
if ($testResults['failed'] > 0) {
    echo red("Failed: ") . $testResults['failed'] . "\n";
} else {
    echo green("Failed: 0\n");
}

$percentage = $testResults['total'] > 0 
    ? round(($testResults['passed'] / $testResults['total']) * 100, 1) 
    : 0;

echo bold("\nSuccess Rate: ") . "$percentage%\n\n";

if ($testResults['failed'] === 0) {
    echo green("╔════════════════════════════════════════════════════════════╗\n");
    echo green("║                                                            ║\n");
    echo green("║  🎉  ALL TESTS PASSED! BACKEND IS PRODUCTION READY! 🎉   ║\n");
    echo green("║                                                            ║\n");
    echo green("╚════════════════════════════════════════════════════════════╝\n");
    echo "\n" . bold("Next Steps:") . "\n";
    echo "  ✅ Backend API fully verified\n";
    echo "  ✅ Critical stock decrement working\n";
    echo "  ✅ Ready for frontend integration\n";
    echo "\n  → Follow FRONTEND_INTEGRATION_GUIDE.md\n";
    echo "  → Start with Login/Register pages\n\n";
} else {
    echo red("╔════════════════════════════════════════════════════════════╗\n");
    echo red("║                                                            ║\n");
    echo red("║  ⚠️  SOME TESTS FAILED - NEEDS ATTENTION! ⚠️              ║\n");
    echo red("║                                                            ║\n");
    echo red("╚════════════════════════════════════════════════════════════╝\n");
    echo "\n" . bold("Action Required:") . "\n";
    echo "  ❌ Review failed tests above\n";
    echo "  ❌ Fix issues before frontend integration\n";
    echo "  ❌ Re-run this test after fixes\n\n";
}

// ===== STOCK FLOW DIAGRAM =====
section("STOCK FLOW VERIFICATION");

echo "Stock Timeline:\n";
echo "  Initial:      $initialStock\n";
echo "  After Order:  $stockAfterOrder " . ($stockAfterOrder == $initialStock ? green("✓ Correct") : red("✗ Wrong")) . "\n";
echo "  After Payment: $finalStock " . ($finalStock == $expectedStock ? green("✓ Correct") : red("✗ Wrong")) . "\n";
echo "\n";

if ($stockAfterOrder == $initialStock && $finalStock == $expectedStock) {
    echo green("✅ Stock decrement logic is WORKING PERFECTLY!\n");
    echo green("✅ Stock only decreases when payment is confirmed!\n");
} else {
    echo red("❌ Stock decrement logic has ISSUES!\n");
    if ($stockAfterOrder != $initialStock) {
        echo red("❌ Stock decreased too early (at order creation)\n");
    }
    if ($finalStock != $expectedStock) {
        echo red("❌ Stock didn't decrease correctly on payment confirmation\n");
    }
}

echo "\n";
echo str_repeat("=", 70) . "\n";
echo bold("Testing Complete!") . "\n";
echo str_repeat("=", 70) . "\n\n";
