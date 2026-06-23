# 🚀 Quick Start - Melanjutkan FASE 5

**Status Saat Ini:** 60% Complete  
**Yang Perlu Diselesaikan:** 3 jam kerja  
**Target Selesai:** 24 Juni 2026

---

## ✅ Yang Sudah Dikerjakan (60%)

- ✅ 5 Migrations dibuat dan dijalankan
- ✅ 5 Models dibuat dengan relationships & business logic
- ✅ UUID & order number auto-generation
- ✅ Stock decrement logic (di Payment model)
- ✅ Address snapshot functionality

---

## 🎯 Langkah-Langkah Melanjutkan (Dalam Urutan)

### Step 1: Buat Seeders (15 menit)

```bash
cd d:\MyCakeShop\backend

# Create seeder files
php artisan make:seeder ShippingMethodSeeder
php artisan make:seeder PaymentMethodSeeder
```

**File 1: `database/seeders/ShippingMethodSeeder.php`**
```php
<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Kurir Instan',
                'description' => 'Pengiriman cepat dalam 3 jam',
                'cost' => 15000,
                'estimated_time' => 'Maks 3 jam',
                'is_active' => true,
            ],
            [
                'name' => 'Kurir Sameday',
                'description' => 'Pengiriman di hari yang sama',
                'cost' => 10000,
                'estimated_time' => 'Hari yang sama',
                'is_active' => true,
            ],
        ];

        foreach ($methods as $method) {
            ShippingMethod::create($method);
        }
    }
}
```

**File 2: `database/seeders/PaymentMethodSeeder.php`**
```php
<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Transfer BCA',
                'type' => 'bank_transfer',
                'icon' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Transfer Mandiri',
                'type' => 'bank_transfer',
                'icon' => null,
                'is_active' => true,
            ],
            [
                'name' => 'GoPay',
                'type' => 'ewallet',
                'icon' => null,
                'is_active' => true,
            ],
            [
                'name' => 'QRIS',
                'type' => 'qris',
                'icon' => null,
                'is_active' => true,
            ],
        ];

        foreach ($methods as $method) {
            PaymentMethod::create($method);
        }
    }
}
```

**Run Seeders:**
```bash
php artisan db:seed --class=ShippingMethodSeeder
php artisan db:seed --class=PaymentMethodSeeder
```

---

### Step 2: Buat Controllers (60 menit)

```bash
php artisan make:controller Api/ShippingMethodController
php artisan make:controller Api/PaymentMethodController
php artisan make:controller Api/OrderController
php artisan make:controller Api/PaymentController
```

**Implementasi:** Lihat file `GITHUB_PHASE_5_ISSUES.md` untuk detail lengkap setiap controller.

**Key Points:**
- OrderController: create order dari cart, snapshot address, clear cart
- PaymentController: uploadProof (customer), confirm (admin)
- ShippingMethodController & PaymentMethodController: simple index()

---

### Step 3: Buat Resources (20 menit)

```bash
php artisan make:resource OrderResource
php artisan make:resource OrderDetailResource
php artisan make:resource OrderItemResource
php artisan make:resource PaymentResource
```

---

### Step 4: Buat Validation (10 menit)

```bash
php artisan make:request Order/CreateOrderRequest
```

---

### Step 5: Tambahkan Routes (10 menit)

**File: `routes/api.php`**

Tambahkan di bagian public routes:
```php
// Shipping & Payment Methods (Public)
Route::get('/shipping-methods', [ShippingMethodController::class, 'index']);
Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
```

Tambahkan di dalam `auth:sanctum` middleware:
```php
// Orders
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{uuid}', [OrderController::class, 'show']);
Route::put('/orders/{uuid}/cancel', [OrderController::class, 'cancel']);

// Payments
Route::post('/payments/{payment}/upload-proof', [PaymentController::class, 'uploadProof']);
```

Tambahkan admin routes (buat group baru):
```php
// Admin routes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::put('/payments/{payment}/confirm', [PaymentController::class, 'confirm']);
});
```

---

### Step 6: Testing (30 menit)

**Test dengan Postman/Thunder Client:**

1. **Test List Shipping Methods**
```
GET http://127.0.0.1:8000/api/shipping-methods
```

2. **Test List Payment Methods**
```
GET http://127.0.0.1:8000/api/payment-methods
```

3. **Test Create Order** (dengan token)
```
POST http://127.0.0.1:8000/api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
    "address_id": 1,
    "shipping_method_id": 1,
    "payment_method_id": 1,
    "notes": "Tolong kirim pagi hari"
}
```

4. **Test List Orders**
```
GET http://127.0.0.1:8000/api/orders
Authorization: Bearer {token}
```

5. **Test Order Detail**
```
GET http://127.0.0.1:8000/api/orders/{uuid}
Authorization: Bearer {token}
```

6. **Test Upload Payment Proof**
```
POST http://127.0.0.1:8000/api/payments/{payment_id}/upload-proof
Authorization: Bearer {token}
Content-Type: multipart/form-data

payment_proof: [select image file]
```

7. **Test Confirm Payment (Admin)**
```
PUT http://127.0.0.1:8000/api/payments/{payment_id}/confirm
Authorization: Bearer {admin_token}
```

**Verify:**
- Order status berubah ke 'processing'
- Payment status berubah ke 'paid'
- **Stock berkurang** sesuai quantity order items

---

## 📂 Files yang Perlu Dibuat

**Total: 13 files**

### Seeders (2 files)
- [ ] `database/seeders/ShippingMethodSeeder.php`
- [ ] `database/seeders/PaymentMethodSeeder.php`

### Controllers (4 files)
- [ ] `app/Http/Controllers/Api/ShippingMethodController.php`
- [ ] `app/Http/Controllers/Api/PaymentMethodController.php`
- [ ] `app/Http/Controllers/Api/OrderController.php`
- [ ] `app/Http/Controllers/Api/PaymentController.php`

### Resources (4 files)
- [ ] `app/Http/Resources/OrderResource.php`
- [ ] `app/Http/Resources/OrderDetailResource.php`
- [ ] `app/Http/Resources/OrderItemResource.php`
- [ ] `app/Http/Resources/PaymentResource.php`

### Requests (1 file)
- [ ] `app/Http/Requests/Order/CreateOrderRequest.php`

### Routes (1 file - modify)
- [ ] `routes/api.php` (add 10 new routes)

### User Model (1 file - modify)
- [ ] `app/Models/User.php` (add orders() relationship)

---

## ⚠️ Important Reminders

### Stock Management
```php
// ❌ JANGAN decrement stock di OrderController
// ✅ Stock OTOMATIS berkurang via Payment model boot method
// Trigger: saat payment.status = 'success'
```

### Address Snapshot
```php
// OrderController store() method:
$order = Order::create([
    // ... other fields
    'recipient_name' => $address->recipient_name,
    'recipient_phone' => $address->phone,
    'shipping_address' => $address->address_line,
    'city' => $address->city,
    'province' => $address->province,
    'postal_code' => $address->postal_code,
]);
```

### UUID Usage
```php
// Route menggunakan UUID, bukan ID
Route::get('/orders/{uuid}', [OrderController::class, 'show']);

// Di controller:
public function show($uuid) {
    $order = Order::where('uuid', $uuid)->firstOrFail();
    // ...
}
```

---

## 🎯 Success Criteria

Phase 5 dianggap selesai jika:
- [ ] Seeders berjalan tanpa error
- [ ] Semua controllers dibuat dan bekerja
- [ ] API endpoints merespons dengan benar
- [ ] Create order berhasil (dari cart, snapshot address, clear cart)
- [ ] Upload payment proof berhasil
- [ ] **Admin confirm payment → stock berkurang otomatis**
- [ ] Order history bisa dilihat
- [ ] Cancel order berfungsi (jika belum paid)

---

## 📚 Reference Documents

- **GITHUB_PHASE_5_ISSUES.md** - Detail lengkap semua tasks
- **PHASE_5_PROGRESS.md** - Status dan business logic
- **BACKEND_MASTER_PLAN.md** - Overall architecture

---

**Estimated Time: 3 hours total**  
**Let's complete Phase 5! 🚀**
