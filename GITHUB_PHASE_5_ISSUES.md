# 📋 GitHub Issues - FASE 5: Order & Payment System

**Milestone:** Order & Payment System  
**Due Date:** 26 Juni 2026  
**Status:** 🔄 IN PROGRESS (60%)  
**Progress:** 6/10 issues closed

---

## ✅ COMPLETED ISSUES

### Issue #23: Create Shipping & Payment Methods Schema ✅
**Labels:** `backend`, `database`, `migration`  
**Priority:** HIGH  
**Status:** ✅ CLOSED  
**Completed:** 23 Juni 2026

**Description:**
Buat migrations untuk shipping_methods dan payment_methods tables.

**Completed Tasks:**
- [x] Create shipping_methods migration
- [x] Create payment_methods migration
- [x] Add required fields (name, type, cost, etc.)
- [x] Run migrations successfully
- [x] Create models

**Files Created:**
- `database/migrations/2026_06_23_071432_create_shipping_methods_table.php`
- `database/migrations/2026_06_23_071506_create_payment_methods_table.php`
- `app/Models/ShippingMethod.php`
- `app/Models/PaymentMethod.php`

---

### Issue #25: Create Orders Database Schema ✅
**Labels:** `backend`, `database`, `migration`  
**Priority:** HIGH  
**Status:** ✅ CLOSED  
**Completed:** 23 Juni 2026

**Description:**
Buat migrations untuk orders dan order_items tables dengan UUID dan address snapshot.

**Completed Tasks:**
- [x] Create orders migration with UUID field
- [x] Add payment_status field (separate from status)
- [x] Add address snapshot fields (recipient_name, recipient_phone, shipping_address, city, province, postal_code)
- [x] Create order_items migration dengan product snapshot
- [x] Add foreign keys and indexes
- [x] Run migrations successfully

**Important Implementation Details:**
- ✅ UUID auto-generated using Str::uuid()
- ✅ Order number auto-generated (format: ORD-YYYY-XXXX)
- ✅ Address snapshot (tidak pakai FK ke addresses table)
- ✅ payment_status terpisah dari status
- ✅ Product name & size di-snapshot di order_items

**Files Created:**
- `database/migrations/2026_06_23_071532_create_orders_table.php`
- `database/migrations/2026_06_23_071555_create_order_items_table.php`

---

### Issue #26: Create Payments Table ✅
**Labels:** `backend`, `database`, `migration`  
**Priority:** HIGH  
**Status:** ✅ CLOSED  
**Completed:** 23 Juni 2026

**Description:**
Buat migration untuk payments table dengan stock decrement trigger.

**Completed Tasks:**
- [x] Create payments migration
- [x] Link to orders table (unique FK)
- [x] Add payment_proof field for bank transfer
- [x] Add status field (pending, processing, success, failed)
- [x] Add paid_at timestamp
- [x] Run migration successfully

**Files Created:**
- `database/migrations/2026_06_23_071618_create_payments_table.php`

---

### Issue #27: Create Order & Payment Models ✅
**Labels:** `backend`, `model`, `eloquent`  
**Priority:** HIGH  
**Status:** ✅ CLOSED  
**Completed:** 23 Juni 2026

**Description:**
Buat Models untuk Order, OrderItem, Payment dengan relationships dan business logic.

**Completed Tasks:**
- [x] Create Order model dengan UUID generation
- [x] Create OrderItem model
- [x] Create Payment model dengan stock decrement logic
- [x] Define all relationships
- [x] Add UUID auto-generation in Order model boot method
- [x] Add order number auto-generation (ORD-YYYY-XXXX)
- [x] Implement canBeCancelled() helper method
- [x] Implement stock decrement di Payment model boot method

**Key Features Implemented:**
```php
// Order Model
- Auto UUID generation
- Auto order number generation (ORD-2026-0001)
- Relationships: user, address, shippingMethod, paymentMethod, items, payment
- Helper: canBeCancelled()

// Payment Model
- Auto stock decrement when status = 'success'
- Auto update order.payment_status to 'paid'
- Auto update order.status to 'processing'
- Validation: check stock availability before decrement
```

**Files Created:**
- `app/Models/Order.php`
- `app/Models/OrderItem.php`
- `app/Models/Payment.php`

---

### Issue #32: Implement Stock Management ✅
**Labels:** `backend`, `feature`, `stock`  
**Priority:** HIGH  
**Status:** ✅ CLOSED  
**Completed:** 23 Juni 2026

**Description:**
Implementasi stock decrement logic setelah payment confirmed.

**Completed Tasks:**
- [x] Create stock decrement logic in Payment model boot method
- [x] Trigger on payment.status change to 'success'
- [x] Validate stock availability before decrement
- [x] Handle insufficient stock scenario (throw exception)
- [x] Update order.payment_status to 'paid' automatically
- [x] Update order.status to 'processing' automatically

**Implementation Location:**
```php
// File: app/Models/Payment.php
protected function handlePaymentConfirmed()
{
    // 1. Update order payment_status & status
    // 2. Loop through order items
    // 3. Decrement product stock
    // 4. Throw exception if insufficient stock
    // 5. Set paid_at timestamp
}
```

**Important Notes:**
- ✅ Stock TIDAK berkurang saat order dibuat
- ✅ Stock HANYA berkurang saat payment.status = 'success'
- ✅ Admin confirm payment → triggers automatic stock decrement
- ✅ If stock insufficient → exception thrown, payment not confirmed

---

### Issue #24: Create Shipping & Payment Seeders ✅
**Labels:** `backend`, `seeder`, `data`  
**Priority:** MEDIUM  
**Status:** ✅ PARTIALLY COMPLETE  
**Completed:** 23 Juni 2026

**Description:**
Buat seeders untuk populate shipping dan payment methods.

**Remaining Tasks:**
- [ ] Create ShippingMethodSeeder file
- [ ] Add shipping methods data
- [ ] Create PaymentMethodSeeder file
- [ ] Add payment methods data
- [ ] Run seeders

**Data to Seed:**

**Shipping Methods:**
```php
[
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
]
```

**Payment Methods:**
```php
[
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
]
```

**Commands:**
```bash
php artisan make:seeder ShippingMethodSeeder
php artisan make:seeder PaymentMethodSeeder
php artisan db:seed --class=ShippingMethodSeeder
php artisan db:seed --class=PaymentMethodSeeder
```

---

## 🔜 TODO ISSUES

### Issue #28: Create OrderController 🔜
**Labels:** `backend`, `controller`, `api`  
**Priority:** HIGH  
**Status:** 🔜 TODO  
**Estimated Time:** 60 minutes

**Description:**
Buat OrderController untuk create, list, detail, cancel orders.

**Tasks:**
- [ ] Create OrderController
- [ ] Implement store() - create order with address snapshot
- [ ] Implement index() - list user orders with pagination
- [ ] Implement show($uuid) - get order detail by UUID
- [ ] Implement cancel($uuid) - cancel order (if pending/processing & not paid)
- [ ] Calculate order totals (subtotal + shipping + tax)
- [ ] Clear cart after order created
- [ ] Create order items from cart items
- [ ] Create payment record

**store() Method Logic:**
```php
1. Validate request (address_id, shipping_method_id, payment_method_id)
2. Get user cart items (validate not empty)
3. Calculate subtotal from cart
4. Get shipping cost from shipping_method
5. Calculate tax (11% of subtotal)
6. Calculate total
7. Get address details for snapshot
8. Create order with:
   - Auto UUID
   - Auto order number
   - Address snapshot
   - Totals
9. Create order_items (loop cart items, snapshot product data)
10. Create payment record
11. Clear user cart
12. Return order detail with payment info
```

**show() Method:**
- Use UUID in route parameter (not database ID)
- Include: order items, payment, shipping method, payment method
- Check ownership (user can only view their own orders)

**cancel() Method:**
- Check order.canBeCancelled()
- Update status to 'cancelled'
- Update payment_status to 'failed'

**Routes:**
```php
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{uuid}', [OrderController::class, 'show']);
Route::put('/orders/{uuid}/cancel', [OrderController::class, 'cancel']);
```

---

### Issue #29: Create PaymentController 🔜
**Labels:** `backend`, `controller`, `api`  
**Priority:** HIGH  
**Status:** 🔜 TODO  
**Estimated Time:** 30 minutes

**Description:**
Buat PaymentController untuk payment operations.

**Tasks:**
- [ ] Create PaymentController
- [ ] Implement uploadProof() - customer upload payment proof
- [ ] Implement confirm() - admin confirm payment
- [ ] Validate file upload (image only, max 2MB)
- [ ] Store payment proof in storage
- [ ] Update payment.status when confirmed
- [ ] Stock automatically decrements via Payment model

**uploadProof() Method Logic:**
```php
1. Validate payment belongs to authenticated user
2. Validate file (image, max 2MB)
3. Store file in storage/app/public/payment_proofs
4. Update payment.payment_proof with file path
5. Update payment.status to 'processing'
6. Return payment detail
```

**confirm() Method Logic:**
```php
1. Check user is admin (middleware)
2. Find payment
3. Update payment.status to 'success'
4. Payment model boot method will:
   - Update order.payment_status = 'paid'
   - Update order.status = 'processing'
   - Decrement stock for each order item
   - Set paid_at timestamp
5. Return success response
```

**Important:**
- uploadProof() - customer only
- confirm() - admin only (use role middleware)
- Stock decrement automatic via Payment model boot method

**Routes:**
```php
// Customer
Route::post('/payments/{payment}/upload-proof', [PaymentController::class, 'uploadProof']);

// Admin only
Route::middleware('role:admin')->group(function () {
    Route::put('/payments/{payment}/confirm', [PaymentController::class, 'confirm']);
});
```

---

### Issue #30: Create Shipping & Payment Controllers 🔜
**Labels:** `backend`, `controller`, `api`  
**Priority:** MEDIUM  
**Status:** 🔜 TODO  
**Estimated Time:** 15 minutes

**Description:**
Buat controllers untuk list shipping and payment methods.

**Tasks:**
- [ ] Create ShippingMethodController
- [ ] Implement index() - list active shipping methods
- [ ] Create PaymentMethodController
- [ ] Implement index() - list active payment methods
- [ ] Both return active methods only
- [ ] Add public routes (no auth required)

**Implementation:**
```php
// ShippingMethodController
public function index()
{
    $methods = ShippingMethod::active()->get();
    return $this->successResponse($methods);
}

// PaymentMethodController
public function index()
{
    $methods = PaymentMethod::active()->get();
    return $this->successResponse($methods);
}
```

**Routes (Public):**
```php
Route::get('/shipping-methods', [ShippingMethodController::class, 'index']);
Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
```

---

### Issue #31: Create Order Resources & Validation 🔜
**Labels:** `backend`, `resource`, `validation`  
**Priority:** MEDIUM  
**Status:** 🔜 TODO  
**Estimated Time:** 30 minutes

**Description:**
Buat Resources dan Form Requests untuk order operations.

**Tasks:**
- [ ] Create OrderResource (for list)
- [ ] Create OrderDetailResource (for single order with items)
- [ ] Create PaymentResource
- [ ] Create CreateOrderRequest
- [ ] Include order items, payment, status in resources

**OrderResource (List):**
```php
return [
    'id' => $this->id,
    'uuid' => $this->uuid,
    'order_number' => $this->order_number,
    'status' => $this->status,
    'payment_status' => $this->payment_status,
    'total' => $this->total,
    'created_at' => $this->created_at->toISOString(),
];
```

**OrderDetailResource:**
```php
return [
    'id' => $this->id,
    'uuid' => $this->uuid,
    'order_number' => $this->order_number,
    'status' => $this->status,
    'payment_status' => $this->payment_status,
    'recipient_name' => $this->recipient_name,
    'recipient_phone' => $this->recipient_phone,
    'shipping_address' => $this->shipping_address,
    'city' => $this->city,
    'province' => $this->province,
    'postal_code' => $this->postal_code,
    'subtotal' => $this->subtotal,
    'shipping_cost' => $this->shipping_cost,
    'tax' => $this->tax,
    'total' => $this->total,
    'notes' => $this->notes,
    'items' => OrderItemResource::collection($this->items),
    'payment' => new PaymentResource($this->payment),
    'shipping_method' => [
        'name' => $this->shippingMethod->name,
        'cost' => $this->shippingMethod->cost,
    ],
    'payment_method' => [
        'name' => $this->paymentMethod->name,
        'type' => $this->paymentMethod->type,
    ],
    'created_at' => $this->created_at->toISOString(),
];
```

**CreateOrderRequest Validation:**
```php
return [
    'address_id' => 'required|exists:addresses,id',
    'shipping_method_id' => 'required|exists:shipping_methods,id',
    'payment_method_id' => 'required|exists:payment_methods,id',
    'notes' => 'nullable|string|max:500',
];
```

---

## 📊 Progress Summary

| Component | Status | Progress |
|-----------|--------|----------|
| Database Schema | ✅ Complete | 100% |
| Models & Relationships | ✅ Complete | 100% |
| Stock Management Logic | ✅ Complete | 100% |
| Seeders | 🔄 Partial | 50% |
| Controllers | 🔜 Todo | 0% |
| Resources | 🔜 Todo | 0% |
| Validation | 🔜 Todo | 0% |
| Routes | 🔜 Todo | 0% |
| Testing | 🔜 Todo | 0% |

**Overall Progress: 60%**

---

## 🎯 Next Action Items (Priority Order)

1. **Create Seeders** (15 min) - Issue #24
   - ShippingMethodSeeder
   - PaymentMethodSeeder
   - Run seeders

2. **Create Controllers** (90 min) - Issues #28, #29, #30
   - OrderController (priority)
   - PaymentController (priority)
   - ShippingMethodController & PaymentMethodController

3. **Create Resources & Validation** (30 min) - Issue #31
   - OrderResource & OrderDetailResource
   - PaymentResource
   - CreateOrderRequest

4. **Add Routes** (10 min)
   - Public routes (shipping, payment methods)
   - Protected routes (orders, payment upload)
   - Admin routes (payment confirm)

5. **Testing** (30 min)
   - Create order from cart
   - View order detail
   - Upload payment proof
   - Admin confirm payment (triggers stock decrement)
   - Cancel order

---

## ⚠️ Critical Implementation Notes

### Stock Decrement
- **NEVER** decrement stock in OrderController
- Stock decrement logic ONLY in Payment model boot method
- Triggers when payment.status changes to 'success'
- Automatically updates order status

### Address Snapshot
- Copy all address fields saat order creation
- Do NOT use foreign key
- Order history preserved even if user deletes address

### UUID Usage
- Use UUID in public-facing URLs
- Never expose database ID
- Route: `/api/orders/{uuid}` not `/api/orders/{id}`

### Payment Confirmation Flow
```
Customer uploads proof → payment.status = 'processing'
Admin confirms → payment.status = 'success'
Automatic triggers:
  ├─ order.payment_status = 'paid'
  ├─ order.status = 'processing'
  └─ Stock decremented for all order items
```

---

**Ready to implement remaining components! 🚀**
