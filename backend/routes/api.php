<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\ShippingMethodController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\Admin\ProductAdminController;
use App\Http\Controllers\Api\Admin\OrderAdminController;
use App\Http\Controllers\Api\Admin\UserAdminController;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'message' => 'API works',
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public product routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Public shipping & payment methods
Route::get('/shipping-methods', [ShippingMethodController::class, 'index']);
Route::get('/payment-methods', [PaymentMethodController::class, 'index']);

// Public reviews
Route::get('/reviews', [ReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'profile']);
    Route::put('/profile', [ProfileController::class, 'update']);
    
    // Cart routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/items/{id}', [CartController::class, 'update']);
    Route::delete('/cart/items/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
    
    // Address routes
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::get('/addresses/{address}', [AddressController::class, 'show']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
    Route::put('/addresses/{address}/set-default', [AddressController::class, 'setDefault']);
    
    // Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{uuid}', [OrderController::class, 'show']);
    Route::put('/orders/{uuid}/cancel', [OrderController::class, 'cancel']);
    
    // Payment routes (customer)
    Route::post('/payments/{payment}/upload-proof', [PaymentController::class, 'uploadProof']);
    Route::post('/orders/{order}/create-remaining-payment', [PaymentController::class, 'createRemainingPayment']);
    Route::post('/payments/{payment}/simulate-qris-success', [PaymentController::class, 'simulateQrisSuccess']);

    // Review routes (customer)
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/reviews/reviewable-orders', [ReviewController::class, 'myReviewableOrders']);
    Route::get('/reviews/reviewable-orders/{orderId}', [ReviewController::class, 'reviewableProducts']);
});

// Admin only routes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::put('/payments/{payment}/confirm', [PaymentController::class, 'confirm']);
    Route::put('/payments/{payment}/reject', [PaymentController::class, 'reject']);
    
    // Admin Product Management
    Route::post('/admin/products/upload-image', [ProductAdminController::class, 'uploadImage']);
    Route::get('/admin/products', [ProductAdminController::class, 'index']);
    Route::post('/admin/products', [ProductAdminController::class, 'store']);
    Route::get('/admin/products/{product}', [ProductAdminController::class, 'show']);
    Route::put('/admin/products/{product}', [ProductAdminController::class, 'update']);
    Route::delete('/admin/products/{product}', [ProductAdminController::class, 'destroy']);
    Route::put('/admin/products/{product}/toggle-status', [ProductAdminController::class, 'toggleStatus']);
    Route::patch('/admin/products/{product}/stock-price', [ProductAdminController::class, 'updateStockPrice']);
    Route::post('/admin/products/bulk-stock-price', [ProductAdminController::class, 'bulkUpdateStockPrice']);
    
    // Admin Categories
    Route::get('/admin/categories', [CategoryController::class, 'index']);

    // Admin Order Management
    Route::get('/admin/orders', [OrderAdminController::class, 'index']);
    Route::get('/admin/orders/{order}', [OrderAdminController::class, 'show']);
    Route::patch('/admin/orders/{order}/status', [OrderAdminController::class, 'updateStatus']);
    Route::post('/admin/orders/{order}/confirm-payment', [OrderAdminController::class, 'confirmPayment']);

    // Admin User/Customer Management
    Route::get('/admin/users', [UserAdminController::class, 'index']);
    Route::get('/admin/users/{user}', [UserAdminController::class, 'show']);
});