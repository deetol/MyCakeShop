# 🚧 FASE 5: Order & Payment System - IN PROGRESS

**Tanggal Mulai:** 23 Juni 2026  
**Status:** 🚧 **60% COMPLETE**

---

## ✅ Yang Sudah Selesai (60%)

### 1. Database Schema ✅
- [x] Migration `create_shipping_methods_table.php`
- [x] Migration `create_payment_methods_table.php`
- [x] Migration `create_orders_table.php` (dengan UUID & address snapshot)
- [x] Migration `create_order_items_table.php`
- [x] Migration `create_payments_table.php`
- [x] Semua migrations berhasil dijalankan

### 2. Models dengan Relationships ✅
- [x] `ShippingMethod` model dengan scope active
- [x] `PaymentMethod` model dengan scope active
- [x] `Order` model dengan:
  - Auto UUID generation
  - Auto order number generation (ORD-YYYY-XXXX)
  - All relationships (user, address, shippingMethod, paymentMethod, items, payment)
  - Helper methods (canBeCancelled)
- [x] `OrderItem` model dengan product snapshot
- [x] `Payment` model dengan:
  - Stock decrement logic saat payment confirmed
  - Auto update order payment_status ke 'paid'
  - Auto update order status ke 'processing'

### 3. Key Features Implemented ✅
- ✅ UUID untuk public order identifier
- ✅ Order number auto-generation
- ✅ Address snapshot (tidak pakai FK)
- ✅ Payment status terpisah dari order status
- ✅ **Stock HANYA berkurang saat payment status = 'success'**
- ✅ Auto update order saat payment confirmed

---

## 🔜 Yang Belum Selesai (40%)

### 1. Seeders (Priority: HIGH)
- [ ] `ShippingMethodSeeder` - populate shipping methods
- [ ] `PaymentMethodSeeder` - populate payment methods
- [ ] Run seeders

### 2. Controllers (Priority: HIGH)
- [ ] `ShippingMethodController` - list active shipping methods
- [ ] `PaymentMethodController` - list active payment methods
- [ ] `OrderController` - create, list, show, cancel orders
- [ ] `PaymentController` - upload proof, confirm payment (admin)

### 3. Resources & Validation
- [ ] `OrderResource` - format order list response
- [ ] `OrderDetailResource` - format detailed order response
- [ ] `PaymentResource` - format payment response
- [ ] `CreateOrderRequest` - validation untuk create order

### 4. Routes
- [ ] Add shipping methods routes (public)
- [ ] Add payment methods routes (public)
- [ ] Add order routes (protected)
- [ ] Add payment routes (protected + admin)

### 5. Testing
- [ ] Test complete checkout flow
- [ ] Test stock decrement on payment confirmation
- [ ] Test order cancellation
- [ ] Test payment proof upload

---

## 📊 Database Tables Created

| Table | Columns | Status |
|-------|---------|--------|
| shipping_methods | id, name, description, cost, estimated_time, is_active | ✅ |
| payment_methods | id, name, type, icon, is_active | ✅ |
| orders | id, uuid, order_number, user_id, address_id, shipping_method_id, payment_method_id, status, payment_status, recipient_*, subtotal, shipping_cost, tax, total, notes | ✅ |
| order_items | id, order_id, product_id, product_name, product_size, quantity, price, subtotal | ✅ |
| payments | id, order_id, payment_method_id, amount, status, payment_proof, paid_at | ✅ |

---

## 🎯 Business Logic Implemented

### Order Creation Flow
1. User selects address, shipping method, payment method
2. System calculates subtotal from cart items
3. System adds shipping cost and tax
4. System creates order with:
   - Auto-generated UUID
   - Auto-generated order number
   - **Address snapshot** (copy from selected address)
   - Status: 'pending'
   - Payment status: 'pending'
5. System creates order items (snapshot product name, size, price)
6. System creates payment record
7. **Stock TIDAK berkurang** (menunggu payment confirmed)

### Payment Confirmation Flow (IMPORTANT!)
1. User uploads payment proof (for bank transfer)
2. Admin confirms payment → set payment.status = 'success'
3. **Payment model boot method triggered:**
   - Update order.payment_status = 'paid'
   - Update order.status = 'processing'
   - **Decrement stock for each order item**
   - Set payment.paid_at timestamp
4. If stock insufficient → throw exception

### Stock Management Rules
- ✅ Stock TIDAK berkurang saat order dibuat
- ✅ Stock HANYA berkurang saat payment.status = 'success'
- ✅ Jika stock tidak cukup saat payment confirmation → error
- ✅ Stock decrement otomatis via Payment model boot method

---

## 📝 Next Steps (Dalam Urutan Priority)

### Step 1: Create Seeders (15 menit)
```bash
php artisan make:seeder ShippingMethodSeeder
php artisan make:seeder PaymentMethodSeeder
```

**Data untuk Shipping Methods:**
```php
[
    ['name' => 'Kurir Instan', 'description' => 'Pengiriman cepat', 'cost' => 15000, 'estimated_time' => 'Maks 3 jam'],
    ['name' => 'Kurir Sameday', 'description' => 'Pengiriman hari yang sama', 'cost' => 10000, 'estimated_time' => 'Hari yang sama'],
]
```

**Data untuk Payment Methods:**
```php
[
    ['name' => 'Transfer BCA', 'type' => 'bank_transfer', 'icon' => null],
    ['name' => 'GoPay', 'type' => 'ewallet', 'icon' => null],
    ['name' => 'QRIS', 'type' => 'qris', 'icon' => null],
]
```

### Step 2: Create Controllers (60-90 menit)

#### OrderController Methods:
- `store()` - Create order from cart
  - Validate cart not empty
  - Calculate totals
  - Snapshot address
  - Create order + order_items + payment
  - Clear cart after success
- `index()` - List user orders with pagination
- `show($uuid)` - Get order detail by UUID
- `cancel($uuid)` - Cancel order (if canBeCancelled)

#### PaymentController Methods:
- `uploadProof($paymentId)` - Upload payment proof (customer)
- `confirm($paymentId)` - Confirm payment (admin only)
  - Set payment.status = 'success'
  - Trigger stock decrement automatically

### Step 3: Create Resources (20 menit)
- OrderResource - basic order info
- OrderDetailResource - order with items and payment
- PaymentResource - payment info

### Step 4: Add Routes (10 menit)
```php
// Public routes
Route::get('/shipping-methods', [ShippingMethodController::class, 'index']);
Route::get('/payment-methods', [PaymentMethodController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{uuid}', [OrderController::class, 'show']);
    Route::put('/orders/{uuid}/cancel', [OrderController::class, 'cancel']);
    
    Route::post('/payments/{payment}/upload-proof', [PaymentController::class, 'uploadProof']);
});

// Admin only routes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::put('/payments/{payment}/confirm', [PaymentController::class, 'confirm']);
});
```

### Step 5: Testing (30 menit)
- Test create order from cart
- Test list orders
- Test order detail
- Test payment confirmation triggers stock decrement
- Test cancel order

---

## ⚠️ Important Notes

### Stock Management
- Stock decrement logic ada di `Payment` model boot method
- JANGAN decrement stock di OrderController
- Stock validation harus di-check sebelum payment confirmation

### Address Snapshot
- Address di-snapshot saat order dibuat (copy semua field)
- Tidak pakai foreign key ke addresses table
- Jika user edit/delete address, order history tetap utuh

### UUID vs Order Number
- **UUID**: Untuk public-facing URLs (aman, tidak predictable)
- **Order Number**: Untuk display ke user (friendly format)
- Use UUID di routes: `/api/orders/{uuid}`

### Payment Status vs Order Status
- **payment_status**: pending, paid, failed, refunded
- **status**: pending, processing, shipped, completed, cancelled
- Keduanya independent tapi saling mempengaruhi

---

## 🔗 Related Models

### User Model
- Perlu tambah relationship: `orders()` hasMany Order

### Cart Model
- CartController perlu method untuk clear cart after order created

---

## 📂 Files Created (So Far)

### Migrations (5 files)
1. `2026_06_23_071432_create_shipping_methods_table.php`
2. `2026_06_23_071506_create_payment_methods_table.php`
3. `2026_06_23_071532_create_orders_table.php`
4. `2026_06_23_071555_create_order_items_table.php`
5. `2026_06_23_071618_create_payments_table.php`

### Models (5 files)
1. `app/Models/ShippingMethod.php`
2. `app/Models/PaymentMethod.php`
3. `app/Models/Order.php` (with UUID & order number generation)
4. `app/Models/OrderItem.php`
5. `app/Models/Payment.php` (with stock decrement logic)

---

## 🎯 Estimated Time to Complete

- Seeders: 15 minutes
- Controllers: 90 minutes
- Resources & Validation: 30 minutes
- Routes: 10 minutes
- Testing: 30 minutes

**Total: ~3 hours** untuk menyelesaikan Phase 5

---

**Status: Ready to continue! Models & Database setup complete! 🚀**
