# 📝 BACKEND MASTER PLAN - REVISIONS LOG

**Tanggal Revisi:** 14 Juni 2026  
**Versi:** 1.1

---

## 🔄 RINGKASAN PERUBAHAN

### 1. **Tambah Field `stock` pada Tabel `products`**

**Alasan:** Untuk inventory management dan mencegah overselling.

**Schema Update:**
```sql
-- Tambahan pada tabel products
stock               INT NOT NULL DEFAULT 0
```

**Impact:**
- ✅ Migration: `create_products_table.php` perlu ditambahkan field stock
- ✅ Model: `Product.php` perlu include stock di fillable
- ✅ Seeder: `ProductSeeder.php` perlu set stock value
- ✅ API Response: Product resource perlu expose stock
- ✅ Cart Validation: Perlu validasi stock sebelum add to cart
- ✅ Order Creation: Perlu decrement stock setelah order dibuat

**Example Usage:**
```php
// Check stock before adding to cart
if ($product->stock < $quantity) {
    return response()->json(['message' => 'Insufficient stock'], 400);
}

// Decrement stock after order
$product->decrement('stock', $quantity);
```

---

### 2. **Tambah Snapshot Alamat Pengiriman pada Tabel `orders`**

**Alasan:** 
- Menyimpan snapshot alamat untuk historical record
- Jika user mengubah/menghapus alamat, data order tetap utuh
- Compliance dengan requirement invoice/shipping label

**Schema Update:**
```sql
-- Tambahan pada tabel orders
recipient_name      VARCHAR(255) NOT NULL
recipient_phone     VARCHAR(20) NOT NULL
shipping_address    TEXT NOT NULL
city                VARCHAR(100) NOT NULL
province            VARCHAR(100) NOT NULL
postal_code         VARCHAR(10) NOT NULL
```

**Impact:**
- ✅ Migration: `create_orders_table.php` perlu tambah 6 field snapshot
- ✅ Model: `Order.php` perlu include snapshot fields di fillable
- ✅ Order Creation: Copy data dari Address ke Order snapshot saat checkout
- ✅ API Response: Order detail bisa langsung show shipping address tanpa join

**Example Implementation:**
```php
// OrderController - Create Order
$address = Address::findOrFail($request->address_id);

$order = Order::create([
    'user_id' => auth()->id(),
    'address_id' => $address->id,
    // Snapshot address
    'recipient_name' => $address->recipient_name,
    'recipient_phone' => $address->phone,
    'shipping_address' => $address->address_line,
    'city' => $address->city,
    'province' => $address->province,
    'postal_code' => $address->postal_code,
    // ... other fields
]);
```

---

### 3. **Tambah Field `uuid` pada Tabel `orders`**

**Alasan:**
- Public identifier untuk order (tidak expose auto-increment ID)
- Security: Prevent order enumeration attack
- SEO-friendly URLs: `/orders/{uuid}` vs `/orders/1`

**Schema Update:**
```sql
-- Tambahan pada tabel orders
uuid                CHAR(36) UNIQUE NOT NULL

-- Tambah index
INDEX(uuid)
```

**Impact:**
- ✅ Migration: `create_orders_table.php` perlu tambah uuid field
- ✅ Model: `Order.php` perlu auto-generate UUID
- ✅ API Endpoint: Change dari `/api/orders/{id}` ke `/api/orders/{uuid}`
- ✅ Frontend: Update order detail URL menggunakan UUID

**Example Implementation:**
```php
// Order.php Model
use Illuminate\Support\Str;

protected static function boot()
{
    parent::boot();
    
    static::creating(function ($order) {
        $order->uuid = (string) Str::uuid();
    });
}

// Route binding
Route::get('/orders/{order:uuid}', [OrderController::class, 'show']);
```

---

### 4. **Simplifikasi Struktur Cart: Hapus Tabel `carts`**

**Alasan:**
- Untuk MVP, tabel carts terpisah tidak memberikan value tambahan
- Relasi langsung user → cart_items lebih sederhana
- Mengurangi kompleksitas join queries
- Satu user hanya punya satu cart (tidak perlu multiple carts)

**Schema Changes:**

**BEFORE:**
```
users (1) → (1) carts (1) → (M) cart_items
```

**AFTER:**
```
users (1) → (M) cart_items
```

**New Schema:**
```sql
-- Tabel cart_items (simplified)
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED NOT NULL  -- Direct relation
product_id          BIGINT UNSIGNED NOT NULL
product_size_id     BIGINT UNSIGNED NULLABLE
quantity            INT NOT NULL DEFAULT 1
created_at          TIMESTAMP
updated_at          TIMESTAMP

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
UNIQUE(user_id, product_id, product_size_id)
```

**Impact:**
- ❌ Remove: `create_carts_table.php` migration (tidak perlu)
- ❌ Remove: `Cart.php` model (tidak perlu)
- ✅ Update: `create_cart_items_table.php` - langsung ke user_id
- ✅ Update: `CartItem.php` model - belongsTo User (bukan Cart)
- ✅ Update: `User.php` model - hasMany CartItem (bukan hasOne Cart)
- ❌ Remove: `CheckCartOwnership.php` middleware (tidak perlu, langsung check user_id)
- ✅ Simplify: CartController queries (langsung CartItem::where('user_id'))

**Example Implementation:**
```php
// CartController - Get Cart
public function index(Request $request)
{
    $cartItems = CartItem::with(['product', 'productSize'])
        ->where('user_id', auth()->id())
        ->get();
    
    return CartResource::collection($cartItems);
}

// CartController - Add to Cart
public function store(Request $request)
{
    $cartItem = CartItem::updateOrCreate(
        [
            'user_id' => auth()->id(),
            'product_id' => $request->product_id,
            'product_size_id' => $request->product_size_id,
        ],
        ['quantity' => DB::raw('quantity + ' . $request->quantity)]
    );
    
    return new CartItemResource($cartItem);
}
```

---

## 📊 IMPACT SUMMARY

### Database Changes
| Table | Action | Fields Changed |
|-------|--------|----------------|
| `products` | ADD | `stock` (INT) |
| `orders` | ADD | `uuid`, `recipient_name`, `recipient_phone`, `shipping_address`, `city`, `province`, `postal_code` |
| `carts` | REMOVE | Entire table removed |
| `cart_items` | MODIFY | Change `cart_id` FK to `user_id` FK |

### Migration Count Changes
- **Before:** 18 migrations
- **After:** 16 migrations (-2: carts removed, cart_items simplified)

### Model Count Changes
- **Before:** 13 models
- **After:** 12 models (-1: Cart model removed)

### API Endpoint Changes
| Endpoint | Change |
|----------|--------|
| `GET /api/orders/{id}` | → `GET /api/orders/{uuid}` |
| `PUT /api/orders/{id}/cancel` | → `PUT /api/orders/{uuid}/cancel` |

### Code Complexity
- ✅ **Reduced:** Cart management (no intermediate carts table)
- ✅ **Simplified:** CartController queries
- ➕ **Added:** Stock validation logic
- ➕ **Added:** Address snapshot logic on order creation
- ➕ **Added:** UUID generation on order creation

---

## ✅ CHECKLIST IMPLEMENTASI REVISI

### Phase 2: Product Catalog (Updated)
- [ ] Add `stock` field to products migration
- [ ] Update ProductSeeder with stock values
- [ ] Add stock validation in API

### Phase 3: Shopping Cart (Updated)
- [ ] ~~Create carts table migration~~ (SKIP)
- [ ] ~~Create Cart model~~ (SKIP)
- [ ] Create simplified cart_items migration (direct to user_id)
- [ ] Create CartItem model (belongsTo User directly)
- [ ] Update User model (hasMany CartItem)
- [ ] Implement stock validation in add to cart
- [ ] ~~Create CheckCartOwnership middleware~~ (SKIP)

### Phase 5: Order & Payment (Updated)
- [ ] Add `uuid` field to orders migration
- [ ] Add address snapshot fields to orders migration
- [ ] Update Order model with UUID auto-generation
- [ ] Implement address snapshot logic in OrderController
- [ ] Update API routes to use UUID
- [ ] Implement stock decrement on order creation
- [ ] Update frontend to use UUID in order URLs

---

## 🔍 TESTING CHECKLIST (Updated)

### Stock Management
- [ ] Cek stock tersedia sebelum add to cart
- [ ] Error jika quantity > stock
- [ ] Stock berkurang setelah order dibuat
- [ ] Stock bertambah jika order di-cancel

### Cart (Simplified)
- [ ] User bisa add item to cart
- [ ] Duplicate item (same product + size) quantity increment
- [ ] Update quantity works
- [ ] Remove item works
- [ ] Clear cart works
- [ ] Cart items terhapus jika user dihapus (CASCADE)

### Order with UUID & Snapshot
- [ ] UUID generated otomatis saat order dibuat
- [ ] UUID unique
- [ ] Alamat ter-snapshot ke order
- [ ] Order detail accessible via UUID
- [ ] Perubahan address tidak affect existing order
- [ ] Penghapusan address tidak affect existing order

---

## 📋 DATABASE COMPARISON

### Entity Count
| Version | Tables | Change |
|---------|--------|--------|
| v1.0 | 13 | Initial |
| v1.1 | 12 | -1 (carts removed) |

### ERD Comparison

**v1.0:**
```
User → Cart → CartItems → Product
```

**v1.1:**
```
User → CartItems → Product (simplified)
```

---

## 🚀 NEXT STEPS

Dengan revisi ini, implementasi menjadi:
1. ✅ **Lebih sederhana** - Struktur cart simplified
2. ✅ **Lebih aman** - UUID untuk public identifier
3. ✅ **Lebih lengkap** - Stock management + address snapshot
4. ✅ **Production-ready** - Best practices untuk e-commerce

Lanjutkan ke implementasi dengan mengacu pada:
- `BACKEND_MASTER_PLAN.md` untuk roadmap lengkap
- `BACKEND_REVISIONS.md` (dokumen ini) untuk detail perubahan

---

**Revision Author:** Senior Full Stack Architect  
**Approved:** Ready for Implementation


---

## 🔄 REVISI FINAL (v1.2)

**Tanggal:** 14 Juni 2026  
**Status:** Final Review

---

### 5. **Tambah Field `payment_status` pada Tabel `orders`**

**Alasan:**
- Pisahkan status pembayaran dari status fulfillment order
- Tracking pembayaran lebih jelas (pending, paid, failed, refunded)
- Memudahkan reconciliation payment
- Support multiple payment scenarios

**Schema Update:**
```sql
-- Tambahan pada tabel orders
payment_status      ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending'

-- Tambah index
INDEX(payment_status)
```

**Payment Status Flow:**
```
pending → paid (payment confirmed by admin/gateway)
pending → failed (payment rejected/expired)
paid → refunded (order cancelled after payment)
```

**Impact:**
- ✅ Migration: `create_orders_table.php` perlu tambah payment_status field
- ✅ Model: `Order.php` perlu include payment_status di fillable
- ✅ API Response: Order resource perlu expose payment_status
- ✅ Order Status: Bisa tracking order status & payment status independently
- ✅ Business Logic: Payment confirmation triggers stock decrement

**Example States:**
| Order Status | Payment Status | Meaning |
|--------------|----------------|---------|
| pending | pending | Waiting for payment |
| pending | paid | Paid, ready to process |
| processing | paid | Order being prepared |
| shipped | paid | Order shipped |
| completed | paid | Order delivered |
| cancelled | refunded | Order cancelled, payment returned |

**Example Implementation:**
```php
// Order.php Model
protected $fillable = [
    // ... existing fields
    'payment_status',
];

protected $casts = [
    'status' => 'string',
    'payment_status' => 'string',
];

// Scopes
public function scopePaid($query)
{
    return $query->where('payment_status', 'paid');
}

public function scopePending($query)
{
    return $query->where('payment_status', 'pending');
}
```

---

### 6. **Ubah Alur Stock Management**

**BEFORE:**
- Stock dikurangi saat order dibuat
- Risk: Stock terkunci untuk unpaid orders
- Problem: User bisa "reserve" stock tanpa bayar

**AFTER:**
- Stock TIDAK dikurangi saat order dibuat
- Stock dikurangi HANYA setelah payment confirmed (payment_status = 'paid')
- Lebih fair untuk semua customer

**Alasan:**
- Prevent stock blocking oleh unpaid orders
- Lebih realistic untuk e-commerce flow
- Allow overselling dengan grace period
- Better inventory management

**Implementation Flow:**

**Step 1: Create Order** (Stock NOT affected)
```php
// OrderController@store
public function store(CreateOrderRequest $request)
{
    // Validate stock availability (soft check)
    foreach ($cartItems as $item) {
        if ($item->product->stock < $item->quantity) {
            return $this->errorResponse(
                "Product {$item->product->name} out of stock",
                400
            );
        }
    }
    
    // Create order WITHOUT decrementing stock
    $order = Order::create([
        'uuid' => Str::uuid(),
        'order_number' => $this->generateOrderNumber(),
        'user_id' => auth()->id(),
        'status' => 'pending',
        'payment_status' => 'pending',
        // ... other fields
    ]);
    
    // Stock NOT touched yet
    return $this->successResponse($order);
}
```

**Step 2: Confirm Payment** (Stock DECREMENTED)
```php
// PaymentController@confirm (Admin only)
public function confirm(Request $request, $paymentId)
{
    $payment = Payment::with('order.items.product')->findOrFail($paymentId);
    
    DB::transaction(function () use ($payment) {
        // Update payment status
        $payment->update([
            'status' => 'success',
            'paid_at' => now(),
        ]);
        
        // Update order payment_status
        $payment->order->update([
            'payment_status' => 'paid',
            'status' => 'processing',
        ]);
        
        // NOW decrement stock
        foreach ($payment->order->items as $item) {
            $item->product->decrement('stock', $item->quantity);
            
            // Log for audit
            \Log::info("Stock decremented", [
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'order_id' => $payment->order_id,
            ]);
        }
    });
    
    return $this->successResponse($payment, 'Payment confirmed successfully');
}
```

**Step 3: Handle Failed/Cancelled Orders**
```php
// If order cancelled before payment
public function cancel(Order $order)
{
    if ($order->payment_status === 'paid') {
        return $this->errorResponse('Cannot cancel paid order directly', 400);
    }
    
    $order->update([
        'status' => 'cancelled',
        'payment_status' => 'failed',
    ]);
    
    // No stock adjustment needed (was never decremented)
    return $this->successResponse($order);
}

// If order cancelled after payment (refund)
public function refund(Order $order)
{
    if ($order->payment_status !== 'paid') {
        return $this->errorResponse('Order not paid yet', 400);
    }
    
    DB::transaction(function () use ($order) {
        $order->update([
            'status' => 'cancelled',
            'payment_status' => 'refunded',
        ]);
        
        // Return stock
        foreach ($order->items as $item) {
            $item->product->increment('stock', $item->quantity);
        }
    });
    
    return $this->successResponse($order);
}
```

**Impact:**
- ✅ OrderController: Remove stock decrement from create order
- ✅ PaymentController: Add stock decrement on payment confirmation
- ✅ OrderController: Add stock increment on refund
- ✅ Validation: Add stock check before payment (final verification)
- ✅ Documentation: Update API docs for new flow

**Stock Management Summary:**
```
Order Created → Stock: NO CHANGE
Payment Pending → Stock: NO CHANGE
Payment Confirmed → Stock: DECREMENTED ✅
Order Cancelled (unpaid) → Stock: NO CHANGE
Order Refunded (paid) → Stock: INCREMENTED (returned)
```

---

### 7. **Tambah Soft Delete pada Tabel `products`**

**Alasan:**
- Data retention: Tidak benar-benar hapus produk dari database
- Historical data: Order items tetap valid meski produk dihapus
- Restore capability: Bisa restore produk jika dihapus by mistake
- Audit trail: Track produk yang pernah ada

**Schema Update:**
```sql
-- Tambahan pada tabel products
deleted_at          TIMESTAMP NULLABLE

-- Tambah index
INDEX(deleted_at)
```

**Impact:**
- ✅ Migration: `create_products_table.php` perlu tambah deleted_at
- ✅ Model: `Product.php` perlu use SoftDeletes trait
- ✅ Queries: Laravel automatically exclude soft deleted (where deleted_at IS NULL)
- ✅ Admin: Bisa restore soft deleted products
- ✅ API: Soft deleted products tidak muncul di listing

**Example Implementation:**
```php
// Product.php Model
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'base_price',
        'stock',
        'unit',
        'tag',
        'main_image',
        'ingredients',
        'allergens',
        'is_active',
    ];
    
    protected $dates = ['deleted_at'];
    
    protected $casts = [
        'ingredients' => 'array',
        'allergens' => 'array',
        'is_active' => 'boolean',
        'stock' => 'integer',
    ];
}
```

**Usage Examples:**
```php
// Normal query - auto excludes soft deleted
$products = Product::all(); // SELECT * FROM products WHERE deleted_at IS NULL

// Include soft deleted
$products = Product::withTrashed()->get();

// Only soft deleted
$products = Product::onlyTrashed()->get();

// Soft delete
$product->delete(); // Sets deleted_at = NOW()

// Restore
$product->restore(); // Sets deleted_at = NULL

// Force delete (permanent)
$product->forceDelete(); // Actually deletes from DB
```

**Admin Endpoints (Optional):**
```php
// routes/api.php (Admin only)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/products/trashed', [AdminProductController::class, 'trashed']);
    Route::put('/admin/products/{id}/restore', [AdminProductController::class, 'restore']);
    Route::delete('/admin/products/{id}/force', [AdminProductController::class, 'forceDelete']);
});
```

---

## 📊 FINAL IMPACT SUMMARY

### Database Schema Changes (v1.2)

| Table | Field | Type | Action |
|-------|-------|------|--------|
| `products` | `stock` | INT | ADDED (v1.1) |
| `products` | `deleted_at` | TIMESTAMP | ADDED (v1.2) |
| `orders` | `uuid` | CHAR(36) | ADDED (v1.1) |
| `orders` | `recipient_name` | VARCHAR(255) | ADDED (v1.1) |
| `orders` | `recipient_phone` | VARCHAR(20) | ADDED (v1.1) |
| `orders` | `shipping_address` | TEXT | ADDED (v1.1) |
| `orders` | `city` | VARCHAR(100) | ADDED (v1.1) |
| `orders` | `province` | VARCHAR(100) | ADDED (v1.1) |
| `orders` | `postal_code` | VARCHAR(10) | ADDED (v1.1) |
| `orders` | `payment_status` | ENUM | ADDED (v1.2) |
| `carts` | - | - | REMOVED (v1.1) |
| `cart_items` | `cart_id` → `user_id` | FK | MODIFIED (v1.1) |

### Stock Management Flow (v1.2)

```mermaid
User Creates Order → Order Status: pending, Payment Status: pending
                  ↓ (Stock: NO CHANGE)
User Uploads Payment Proof → Payment Status: pending
                  ↓
Admin Confirms Payment → Payment Status: paid
                  ↓ (Stock: DECREMENTED ✅)
Order Status: processing → Stock reduced
```

### Business Logic Changes

1. **Stock Management:**
   - ❌ OLD: Decrement on order create
   - ✅ NEW: Decrement on payment confirm

2. **Product Deletion:**
   - ❌ OLD: Hard delete (permanent)
   - ✅ NEW: Soft delete (restorable)

3. **Payment Tracking:**
   - ❌ OLD: Single status field
   - ✅ NEW: Separate payment_status field

---

## ✅ UPDATED IMPLEMENTATION CHECKLIST

### Phase 2: Product Catalog (v1.2)
- [ ] Add `stock` field to products migration
- [ ] Add `deleted_at` field to products migration (SoftDeletes)
- [ ] Update Product model to use SoftDeletes trait
- [ ] Update ProductSeeder with stock values
- [ ] Add stock validation in cart API

### Phase 3: Shopping Cart (v1.2)
- [ ] Stock validation saat add to cart (soft check)
- [ ] Show "Out of Stock" message di frontend
- [ ] NO stock decrement saat add to cart

### Phase 5: Order & Payment (v1.2)
- [ ] Add `payment_status` field to orders migration
- [ ] Update Order model with payment_status
- [ ] Order creation: NO stock decrement
- [ ] Payment confirmation: DECREMENT stock (admin action)
- [ ] Order refund: INCREMENT stock (return)
- [ ] Add stock check before payment confirmation
- [ ] Update API response to include payment_status

### Testing Checklist (v1.2)

**Stock Management:**
- [ ] Create order → Stock unchanged
- [ ] Confirm payment → Stock decremented
- [ ] Multiple orders for same product → Stock accurate
- [ ] Cancel unpaid order → Stock unchanged
- [ ] Refund paid order → Stock incremented
- [ ] Insufficient stock → Payment confirmation rejected

**Soft Deletes:**
- [ ] Delete product → Not visible in API
- [ ] Deleted product → Still in database (deleted_at set)
- [ ] Restore product → Visible again
- [ ] Order with deleted product → Order still valid
- [ ] Force delete → Permanently removed (admin only)

**Payment Status:**
- [ ] Order created → payment_status: pending
- [ ] Payment uploaded → payment_status: pending
- [ ] Payment confirmed → payment_status: paid, status: processing
- [ ] Payment failed → payment_status: failed
- [ ] Order refunded → payment_status: refunded

---

## 🎯 FINAL VERSION SUMMARY

**Version:** 1.2 (Final)  
**Tables:** 12  
**Migrations:** 16  
**Models:** 12  
**New Features:**
- ✅ Stock management dengan payment confirmation trigger
- ✅ Payment status tracking terpisah
- ✅ Product soft deletes
- ✅ UUID untuk orders
- ✅ Address snapshot
- ✅ Simplified cart structure

**Ready for Production Implementation! 🚀**
