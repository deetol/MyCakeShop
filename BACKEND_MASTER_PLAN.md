# 🎂 MASTER PLAN INTEGRASI BACKEND - MyCakeShop

**Dokumen Perencanaan Teknis**  
**Versi:** 1.0  
**Tanggal:** 14 Juni 2026  
**Tech Stack:** Laravel 12 + MySQL + REST API

---

## 📋 DAFTAR ISI

1. [Analisis Frontend & Kebutuhan Backend](#1-analisis-frontend--kebutuhan-backend)
2. [Database Schema & ERD](#2-database-schema--erd)
3. [API Endpoints](#3-api-endpoints)
4. [Struktur Laravel](#4-struktur-laravel)
5. [Roadmap Implementasi](#5-roadmap-implementasi)
6. [Strategi Integrasi](#6-strategi-integrasi)

---

## 1. ANALISIS FRONTEND & KEBUTUHAN BACKEND

### 1.1 Halaman Login (`/login`)
**Fitur yang Ada:**
- Login dengan Email atau Phone Number
- Password authentication
- Remember me checkbox
- Social login (Google, Facebook) - UI only

**Kebutuhan Backend:**
- ✅ POST `/api/login` - Autentikasi user
- ✅ POST `/api/logout` - Logout user
- ✅ Validasi email/phone & password
- ✅ Generate token (Laravel Sanctum)
- 🔜 Social authentication (Google, Facebook OAuth)


### 1.2 Halaman Register (`/register`)
**Fitur yang Ada:**
- Register dengan Email atau Phone Number
- Full name, password input
- Terms & conditions agreement

**Kebutuhan Backend:**
- ✅ POST `/api/register` - Pendaftaran user baru
- ✅ Validasi unique email/phone
- ✅ Hash password
- ✅ Auto-login setelah register

---

### 1.3 Halaman Products (`/products`)
**Fitur yang Ada:**
- Filter by category (Roti Manis, Kue Kering, Jajanan Pasar)
- Search by product name/description
- Sort (Rekomendasi, Harga, Terbaru)
- Product card dengan tag (Favorit, Terlaris, Baru)

**Kebutuhan Backend:**
- ✅ GET `/api/products` - List products dengan filter & pagination
  - Query params: `category`, `search`, `sort`, `page`, `per_page`
- ✅ GET `/api/products/{id}` - Detail produk
- ✅ GET `/api/categories` - List kategori


---

### 1.4 Halaman Cart (`/cart`)
**Fitur yang Ada:**
- List cart items dengan quantity control
- Subtotal calculation
- Packaging fee & tax calculation
- Remove item dari cart

**Kebutuhan Backend:**
- ✅ GET `/api/cart` - Get user cart
- ✅ POST `/api/cart` - Add item to cart
- ✅ PUT `/api/cart/{id}` - Update quantity
- ✅ DELETE `/api/cart/{id}` - Remove item
- ✅ DELETE `/api/cart` - Clear cart

---

### 1.5 Halaman Checkout (`/checkout`)
**Fitur yang Ada:**
- Shipping address selection
- Shipping method selection (Instant, Sameday)
- Payment method (Bank Transfer, GoPay, QRIS)
- Order summary

**Kebutuhan Backend:**
- ✅ GET `/api/addresses` - List user addresses
- ✅ POST `/api/addresses` - Add new address
- ✅ GET `/api/shipping-methods` - List shipping options
- ✅ POST `/api/orders` - Create order
- ✅ POST `/api/payments` - Process payment


---

### 1.6 Halaman Profile (`/profile`)
**Fitur yang Ada:**
- View & edit profile (name, email, phone)
- Manage shipping addresses
- Set default address

**Kebutuhan Backend:**
- ✅ GET `/api/profile` - Get user profile
- ✅ PUT `/api/profile` - Update profile
- ✅ GET `/api/addresses` - List addresses
- ✅ POST `/api/addresses` - Add address
- ✅ PUT `/api/addresses/{id}` - Update address
- ✅ DELETE `/api/addresses/{id}` - Delete address
- ✅ PUT `/api/addresses/{id}/set-default` - Set default

---

### 1.7 Halaman Orders (`/order`)
**Fitur yang Ada:**
- List order history
- Order status (Diproses, Dikirim, Selesai, Dibatalkan)
- Order detail expansion
- Reorder functionality

**Kebutuhan Backend:**
- ✅ GET `/api/orders` - List user orders dengan pagination
- ✅ GET `/api/orders/{id}` - Order detail
- ✅ PUT `/api/orders/{id}/cancel` - Cancel order (if applicable)


---

## 2. DATABASE SCHEMA & ERD

### 2.1 Entity List

| No | Entity | Deskripsi |
|----|--------|-----------|
| 1 | **users** | Data pengguna (customer & admin) |
| 2 | **addresses** | Alamat pengiriman user |
| 3 | **categories** | Kategori produk |
| 4 | **products** | Master produk kue |
| 5 | **product_sizes** | Variasi ukuran produk |
| 6 | **product_images** | Galeri foto produk |
| 7 | **cart_items** | Item keranjang belanja (simplified) |
| 8 | **orders** | Order/pesanan |
| 9 | **order_items** | Detail item pesanan |
| 10 | **shipping_methods** | Metode pengiriman |
| 11 | **payment_methods** | Metode pembayaran |
| 12 | **payments** | Transaksi pembayaran |


---

### 2.2 Database Schema Detail

#### **Table: users**
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
name                VARCHAR(255) NOT NULL
email               VARCHAR(255) UNIQUE NULLABLE
phone               VARCHAR(20) UNIQUE NULLABLE
email_verified_at   TIMESTAMP NULLABLE
password            VARCHAR(255) NOT NULL
role                ENUM('customer', 'admin') DEFAULT 'customer'
remember_token      VARCHAR(100) NULLABLE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX(email), INDEX(phone), INDEX(role)
```

#### **Table: addresses**
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
user_id             BIGINT UNSIGNED NOT NULL
label               VARCHAR(100) NOT NULL (e.g., 'Rumah', 'Kantor')
recipient_name      VARCHAR(255) NOT NULL
phone               VARCHAR(20) NOT NULL
address_line        TEXT NOT NULL
city                VARCHAR(100) NOT NULL
province            VARCHAR(100) NOT NULL
postal_code         VARCHAR(10) NOT NULL
is_default          BOOLEAN DEFAULT FALSE
created_at          TIMESTAMP
updated_at          TIMESTAMP

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
INDEX(user_id), INDEX(is_default)
```


#### **Table: categories**
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
name                VARCHAR(100) NOT NULL
slug                VARCHAR(100) UNIQUE NOT NULL
description         TEXT NULLABLE
image               VARCHAR(255) NULLABLE
is_active           BOOLEAN DEFAULT TRUE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX(slug), INDEX(is_active)
```

#### **Table: products**
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
category_id         BIGINT UNSIGNED NOT NULL
name                VARCHAR(255) NOT NULL
slug                VARCHAR(255) UNIQUE NOT NULL
description         TEXT NOT NULL
base_price          DECIMAL(10,2) NOT NULL
stock               INT NOT NULL DEFAULT 0
unit                VARCHAR(50) NULLABLE (e.g., '/ pcs', '/ porsi')
tag                 VARCHAR(50) NULLABLE (e.g., 'Favorit', 'Terlaris', 'Baru')
main_image          VARCHAR(255) NOT NULL
ingredients         TEXT NULLABLE (JSON array)
allergens           TEXT NULLABLE (JSON array)
is_active           BOOLEAN DEFAULT TRUE
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP NULLABLE (Soft Delete)

FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
INDEX(category_id), INDEX(slug), INDEX(tag), INDEX(is_active), INDEX(deleted_at)
```


#### **Table: product_sizes**
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
product_id          BIGINT UNSIGNED NOT NULL
size_name           VARCHAR(100) NOT NULL (e.g., 'Reguler', 'Besar')
price               DECIMAL(10,2) NOT NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP

FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
INDEX(product_id)
```

#### **Table: product_images**
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
product_id          BIGINT UNSIGNED NOT NULL
image_url           VARCHAR(255) NOT NULL
order               INT DEFAULT 0
created_at          TIMESTAMP
updated_at          TIMESTAMP

FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
INDEX(product_id), INDEX(order)
```

#### **Table: cart_items** (Simplified - No separate carts table)
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
user_id             BIGINT UNSIGNED NOT NULL
product_id          BIGINT UNSIGNED NOT NULL
product_size_id     BIGINT UNSIGNED NULLABLE
quantity            INT NOT NULL DEFAULT 1
created_at          TIMESTAMP
updated_at          TIMESTAMP

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
FOREIGN KEY (product_size_id) REFERENCES product_sizes(id) ON DELETE SET NULL
UNIQUE(user_id, product_id, product_size_id)
INDEX(user_id), INDEX(product_id)
```
UNIQUE(cart_id, product_id, product_size_id)
INDEX(cart_id), INDEX(product_id)
```

#### **Table: shipping_methods**
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
name                VARCHAR(100) NOT NULL (e.g., 'Kurir Instan', 'Kurir Sameday')
description         TEXT NULLABLE
cost                DECIMAL(10,2) NOT NULL
estimated_time      VARCHAR(100) NULLABLE (e.g., 'Maks 3 jam')
is_active           BOOLEAN DEFAULT TRUE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX(is_active)
```


#### **Table: payment_methods**
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
name                VARCHAR(100) NOT NULL (e.g., 'BCA Transfer', 'GoPay', 'QRIS')
type                ENUM('bank_transfer', 'ewallet', 'qris') NOT NULL
icon                VARCHAR(255) NULLABLE
is_active           BOOLEAN DEFAULT TRUE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX(type), INDEX(is_active)
```

#### **Table: orders**
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
uuid                CHAR(36) UNIQUE NOT NULL
order_number        VARCHAR(50) UNIQUE NOT NULL (e.g., 'ORD-2023-8890')
user_id             BIGINT UNSIGNED NOT NULL
address_id          BIGINT UNSIGNED NOT NULL
shipping_method_id  BIGINT UNSIGNED NOT NULL
payment_method_id   BIGINT UNSIGNED NOT NULL
status              ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending'
payment_status      ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending'

# Shipping Address Snapshot
recipient_name      VARCHAR(255) NOT NULL
recipient_phone     VARCHAR(20) NOT NULL
shipping_address    TEXT NOT NULL
city                VARCHAR(100) NOT NULL
province            VARCHAR(100) NOT NULL
postal_code         VARCHAR(10) NOT NULL

# Pricing
subtotal            DECIMAL(10,2) NOT NULL
shipping_cost       DECIMAL(10,2) NOT NULL
tax                 DECIMAL(10,2) NOT NULL DEFAULT 0
total               DECIMAL(10,2) NOT NULL
notes               TEXT NULLABLE
created_at          TIMESTAMP
updated_at          TIMESTAMP

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT
FOREIGN KEY (shipping_method_id) REFERENCES shipping_methods(id) ON DELETE RESTRICT
FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE RESTRICT
INDEX(user_id), INDEX(uuid), INDEX(order_number), INDEX(status), INDEX(payment_status), INDEX(created_at)
```


#### **Table: order_items**
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
order_id            BIGINT UNSIGNED NOT NULL
product_id          BIGINT UNSIGNED NOT NULL
product_name        VARCHAR(255) NOT NULL (snapshot)
product_size        VARCHAR(100) NULLABLE (snapshot)
quantity            INT NOT NULL
price               DECIMAL(10,2) NOT NULL (snapshot harga per unit)
subtotal            DECIMAL(10,2) NOT NULL (price * quantity)
created_at          TIMESTAMP
updated_at          TIMESTAMP

FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
INDEX(order_id), INDEX(product_id)
```

#### **Table: payments**
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
order_id            BIGINT UNSIGNED UNIQUE NOT NULL
payment_method_id   BIGINT UNSIGNED NOT NULL
amount              DECIMAL(10,2) NOT NULL
status              ENUM('pending', 'processing', 'success', 'failed') DEFAULT 'pending'
payment_proof       VARCHAR(255) NULLABLE (untuk bank transfer)
paid_at             TIMESTAMP NULLABLE
created_at          TIMESTAMP
updated_at          TIMESTAMP

FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT
FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE RESTRICT
INDEX(order_id), INDEX(status)
```


---

### 2.3 ERD Sederhana (Text Format)

```
┌─────────────┐
│   USERS     │
├─────────────┤
│ id (PK)     │──┐
│ name        │  │
│ email       │  │
│ phone       │  │
│ password    │  │
│ role        │  │
└─────────────┘  │
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌───────▼──────┐
│  ADDRESSES   │  │  CART_ITEMS  │
├──────────────┤  ├──────────────┤
│ id (PK)      │  │ id (PK)      │
│ user_id (FK) │  │ user_id (FK) │
│ label        │  │ product_id   │
│ is_default   │  │ quantity     │
└──────────────┘  └──────────────┘

┌─────────────┐
│ CATEGORIES  │
├─────────────┤
│ id (PK)     │──┐
│ name        │  │
│ slug        │  │
└─────────────┘  │
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌───────▼──────────┐
│  PRODUCTS    │  │  PRODUCT_SIZES   │
├──────────────┤  ├──────────────────┤
│ id (PK)      │──│ id (PK)          │
│ category_id  │  │ product_id (FK)  │
│ name         │  │ size_name        │
│ base_price   │  │ price            │
│ stock        │  └──────────────────┘
│ tag          │
└──────────────┘
       │
       │         ┌──────────────────┐
       └─────────│ PRODUCT_IMAGES   │
                 ├──────────────────┤
                 │ id (PK)          │
                 │ product_id (FK)  │
                 │ image_url        │
                 └──────────────────┘

┌────────────────────┐
│      ORDERS        │
├────────────────────┤
│ id (PK)            │──┐
│ uuid               │  │
│ order_number       │  │
│ user_id (FK)       │  │
│ address_id (FK)    │  │
│ shipping_method_id │  │
│ payment_method_id  │  │
│ status             │  │
│ # Address Snapshot │  │
│ recipient_name     │  │
│ recipient_phone    │  │
│ shipping_address   │  │
│ city               │  │
│ province           │  │
│ postal_code        │  │
│ total              │  │
└────────────────────┘  │
          │             │
          │    ┌────────▼────────┐
          │    │  ORDER_ITEMS    │
          │    ├─────────────────┤
          │    │ id (PK)         │
          │    │ order_id (FK)   │
          │    │ product_id (FK) │
          │    │ quantity        │
          │    │ price           │
          │    └─────────────────┘
          │
          │
┌─────────▼───────────┐
│     PAYMENTS        │
├─────────────────────┤
│ id (PK)             │
│ order_id (FK)       │
│ payment_method_id   │
│ amount              │
│ status              │
│ payment_proof       │
└─────────────────────┘

┌─────────────────────┐
│ SHIPPING_METHODS    │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ cost                │
└─────────────────────┘

┌─────────────────────┐
│  PAYMENT_METHODS    │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ type                │
└─────────────────────┘
```


---

## 3. API ENDPOINTS

### 3.1 Authentication & User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/register` | Register new user | ❌ |
| POST | `/api/login` | Login user | ❌ |
| POST | `/api/logout` | Logout user | ✅ |
| GET | `/api/profile` | Get current user profile | ✅ |
| PUT | `/api/profile` | Update user profile | ✅ |

**Request/Response Examples:**

```json
// POST /api/register
{
  "name": "John Doe",
  "email": "john@example.com",  // atau phone: "+628123456789"
  "password": "password123"
}

// Response
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "2|AbcDefGhijk123456789..."
  }
}
```


---

### 3.2 Product & Category Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | List all active categories | ❌ |
| GET | `/api/products` | List products with filters | ❌ |
| GET | `/api/products/{id}` | Get product detail | ❌ |

**Query Parameters untuk `/api/products`:**
- `category` - Filter by category slug
- `search` - Search by name/description
- `sort` - Sort by: `recommended`, `price_asc`, `price_desc`, `newest`
- `tag` - Filter by tag: `favorit`, `terlaris`, `baru`
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 12)

**Response Example:**
```json
// GET /api/products?category=roti-manis&page=1
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Roti Sisir Mentega",
        "slug": "roti-sisir",
        "description": "Roti manis klasik...",
        "base_price": 45000,
        "stock": 50,
        "unit": null,
        "tag": "Favorit Keluarga",
        "main_image": "https://...",
        "category": {
          "id": 1,
          "name": "Roti Manis",
          "slug": "roti-manis"
        },
        "sizes": [
          {"id": 1, "size_name": "Reguler (10 Slice)", "price": 45000},
          {"id": 2, "size_name": "Besar (20 Slice)", "price": 85000}
        ]
      }
    ],
    "pagination": {
      "total": 50,
      "per_page": 12,
      "current_page": 1,
      "last_page": 5
    }
  }
}

// Note: Soft deleted products automatically excluded from listing
```


---

### 3.3 Cart Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get user's cart items | ✅ |
| POST | `/api/cart` | Add item to cart | ✅ |
| PUT | `/api/cart/items/{id}` | Update cart item quantity | ✅ |
| DELETE | `/api/cart/items/{id}` | Remove item from cart | ✅ |
| DELETE | `/api/cart` | Clear entire cart | ✅ |

**Request/Response Examples:**

```json
// POST /api/cart
{
  "product_id": 1,
  "product_size_id": 2,  // Optional
  "quantity": 2
}

// Response GET /api/cart
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Roti Sisir Mentega",
          "main_image": "https://...",
          "stock": 50
        },
        "size": {
          "id": 2,
          "size_name": "Besar (20 Slice)",
          "price": 85000
        },
        "quantity": 2,
        "price": 85000,
        "subtotal": 170000
      }
    ],
    "summary": {
      "subtotal": 170000,
      "packaging_fee": 5000,
      "tax": 19250,
      "total": 194250
    }
  }
}
```


---

### 3.4 Address Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/addresses` | List user addresses | ✅ |
| POST | `/api/addresses` | Add new address | ✅ |
| PUT | `/api/addresses/{id}` | Update address | ✅ |
| DELETE | `/api/addresses/{id}` | Delete address | ✅ |
| PUT | `/api/addresses/{id}/set-default` | Set default address | ✅ |

**Request Example:**
```json
// POST /api/addresses
{
  "label": "Rumah",
  "recipient_name": "John Doe",
  "phone": "+628123456789",
  "address_line": "Jl. Melati No. 45, RT 05/RW 02",
  "city": "Jakarta Selatan",
  "province": "DKI Jakarta",
  "postal_code": "12240",
  "is_default": true
}
```

---

### 3.5 Shipping & Payment Methods

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/shipping-methods` | List active shipping methods | ❌ |
| GET | `/api/payment-methods` | List active payment methods | ❌ |


---

### 3.6 Order Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create new order | ✅ |
| GET | `/api/orders` | List user orders | ✅ |
| GET | `/api/orders/{uuid}` | Get order detail by UUID | ✅ |
| PUT | `/api/orders/{uuid}/cancel` | Cancel order | ✅ |

**Request Example:**
```json
// POST /api/orders
{
  "address_id": 1,
  "shipping_method_id": 2,
  "payment_method_id": 3,
  "notes": "Tolong kirim pagi hari"
}

// Response
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": 42,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "order_number": "ORD-2026-0001",
      "status": "pending",
      "payment_status": "pending",
      "recipient_name": "John Doe",
      "recipient_phone": "+628123456789",
      "shipping_address": "Jl. Melati No. 45",
      "city": "Jakarta Selatan",
      "province": "DKI Jakarta",
      "postal_code": "12240",
      "total": 194250,
      "created_at": "2026-06-14T10:30:00Z"
    },
    "payment": {
      "id": 42,
      "status": "pending",
      "amount": 194250,
      "payment_method": {
        "name": "GoPay",
        "type": "ewallet"
      }
    }
  }
}

// GET /api/orders/{uuid}
// Returns full order detail with items, shipping address snapshot, payment_status, etc.
```


---

### 3.7 Payment Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/{id}/upload-proof` | Upload payment proof | ✅ |
| PUT | `/api/payments/{id}/confirm` | Confirm payment (updates payment_status) | ✅ Admin |

**Important:** When payment is confirmed as 'paid', the system will:
1. Update `orders.payment_status` to 'paid'
2. Decrement product stock based on order items
3. Update `orders.status` to 'processing'

---

## 4. STRUKTUR LARAVEL

### 4.1 Migration Files (16 files)

```
database/migrations/
├── 2024_01_01_000001_create_users_table.php (sudah ada, modifikasi)
├── 2024_01_01_000002_create_personal_access_tokens_table.php (Sanctum)
├── 2024_01_02_000001_create_categories_table.php
├── 2024_01_02_000002_create_products_table.php (tambah field stock)
├── 2024_01_02_000003_create_product_sizes_table.php
├── 2024_01_02_000004_create_product_images_table.php
├── 2024_01_03_000001_create_addresses_table.php
├── 2024_01_03_000002_create_shipping_methods_table.php
├── 2024_01_03_000003_create_payment_methods_table.php
├── 2024_01_04_000001_create_cart_items_table.php (simplified - no carts table)
├── 2024_01_05_000001_create_orders_table.php (tambah uuid & address snapshot)
├── 2024_01_05_000002_create_order_items_table.php
├── 2024_01_05_000003_create_payments_table.php
```


### 4.2 Model Files (12 files)

```
app/Models/
├── User.php (sudah ada, modifikasi)
├── Address.php
├── Category.php
├── Product.php (tambah stock field + SoftDeletes)
├── ProductSize.php
├── ProductImage.php
├── CartItem.php (simplified - no Cart model)
├── ShippingMethod.php
├── PaymentMethod.php
├── Order.php (tambah uuid, payment_status & address snapshot fields)
├── OrderItem.php
└── Payment.php
```

**Relasi Penting:**
- User hasMany Address, CartItem, Order
- Category hasMany Product
- Product belongsTo Category, hasMany ProductSize, ProductImage, CartItem, OrderItem
- Product uses SoftDeletes trait
- CartItem belongsTo User, Product (simplified - no Cart)
- Order belongsTo User, Address, ShippingMethod, PaymentMethod, hasMany OrderItem, hasOne Payment
- Order memiliki UUID untuk public identifier
- Order memiliki payment_status terpisah dari status


### 4.3 Controller Files (10 files)

```
app/Http/Controllers/Api/
├── AuthController.php (sudah ada, modifikasi)
├── ProfileController.php
├── CategoryController.php
├── ProductController.php
├── CartController.php
├── AddressController.php
├── ShippingMethodController.php
├── PaymentMethodController.php
├── OrderController.php
└── PaymentController.php
```

### 4.4 Request Validation Files (12 files)

```
app/Http/Requests/
├── Auth/
│   ├── LoginRequest.php (sudah ada, modifikasi)
│   └── RegisterRequest.php
├── Profile/
│   └── UpdateProfileRequest.php
├── Address/
│   ├── StoreAddressRequest.php
│   └── UpdateAddressRequest.php
├── Cart/
│   ├── AddToCartRequest.php
│   └── UpdateCartItemRequest.php
└── Order/
    └── CreateOrderRequest.php
```


### 4.5 Resource/Transformer Files (10 files)

```
app/Http/Resources/
├── UserResource.php
├── AddressResource.php
├── CategoryResource.php
├── ProductResource.php
├── ProductDetailResource.php
├── CartResource.php
├── CartItemResource.php
├── OrderResource.php
├── OrderDetailResource.php
└── PaymentResource.php
```

### 4.6 Middleware Files (2 files)

```
app/Http/Middleware/
├── EnsureTokenIsValid.php (sudah ada)
└── RoleMiddleware.php (sudah ada, untuk admin)
```

**Note:** CheckCartOwnership middleware tidak diperlukan karena cart items langsung terhubung ke user_id.

### 4.7 Seeder Files (5 files)

```
database/seeders/
├── DatabaseSeeder.php (main seeder)
├── UserSeeder.php (sudah ada, modifikasi)
├── CategorySeeder.php
├── ProductSeeder.php
├── ShippingMethodSeeder.php
└── PaymentMethodSeeder.php
```


---

## 5. ROADMAP IMPLEMENTASI

### **FASE 1: Foundation & Authentication** (Estimasi: 2-3 hari)

#### Tujuan
Setup infrastruktur dasar, authentication, dan user management.

#### Tasks
1. ✅ Install & Configure Laravel Sanctum
2. ✅ Setup CORS untuk Next.js frontend
3. ✅ Modifikasi User migration (tambah phone, role)
4. ✅ Update AuthController (support email/phone login)
5. ✅ Buat ProfileController
6. ✅ Testing endpoint auth dengan Postman

#### Perintah Artisan
```bash
# Install Sanctum
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate

# Buat Controllers
php artisan make:controller Api/AuthController
php artisan make:controller Api/ProfileController

# Buat Requests
php artisan make:request Auth/RegisterRequest
php artisan make:request Profile/UpdateProfileRequest

# Buat Resources
php artisan make:resource UserResource
```

#### Hasil Yang Diharapkan
- ✅ User bisa register dengan email atau phone
- ✅ User bisa login dan dapat token
- ✅ User bisa update profile
- ✅ Frontend bisa komunikasi dengan backend via API


---

### **FASE 2: Product Catalog** (Estimasi: 3-4 hari)

#### Tujuan
Setup produk, kategori, dan sistem filtering/sorting.

#### Tasks
1. ✅ Buat migrations: categories, products, product_sizes, product_images
2. ✅ Buat Models dengan relasi
3. ✅ Buat Seeders dengan data dari frontend
4. ✅ Buat CategoryController & ProductController
5. ✅ Implementasi filtering, sorting, pagination
6. ✅ Buat Resources untuk format response
7. ✅ Testing endpoint products

#### Perintah Artisan
```bash
# Migrations
php artisan make:migration create_categories_table
php artisan make:migration create_products_table
php artisan make:migration create_product_sizes_table
php artisan make:migration create_product_images_table
php artisan migrate

# Models
php artisan make:model Category
php artisan make:model Product
php artisan make:model ProductSize
php artisan make:model ProductImage

# Controllers
php artisan make:controller Api/CategoryController
php artisan make:controller Api/ProductController

# Resources
php artisan make:resource CategoryResource
php artisan make:resource ProductResource
php artisan make:resource ProductDetailResource

# Seeders
php artisan make:seeder CategorySeeder
php artisan make:seeder ProductSeeder
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=ProductSeeder
```

#### Hasil Yang Diharapkan
- ✅ Produk dari `products.ts` sudah masuk database
- ✅ Products menggunakan SoftDeletes
- ✅ API `/api/products` sudah bisa filter, search, sort
- ✅ Soft deleted products tidak muncul di listing
- ✅ Frontend bisa fetch data produk dari backend


---

### **FASE 3: Shopping Cart** (Estimasi: 1-2 hari)

#### Tujuan
Implementasi sistem keranjang belanja (simplified).

#### Tasks
1. ✅ Buat migration: cart_items (tanpa tabel carts terpisah)
2. ✅ Buat Model CartItem dengan relasi ke User & Product
3. ✅ Buat CartController (CRUD cart items)
4. ✅ Implementasi cart calculation (subtotal, tax)
5. ✅ Testing cart operations

#### Perintah Artisan
```bash
# Migration
php artisan make:migration create_cart_items_table
php artisan migrate

# Model
php artisan make:model CartItem

# Controller
php artisan make:controller Api/CartController

# Requests
php artisan make:request Cart/AddToCartRequest
php artisan make:request Cart/UpdateCartItemRequest

# Resources
php artisan make:resource CartResource
php artisan make:resource CartItemResource
```

#### Hasil Yang Diharapkan
- ✅ User bisa add/update/remove items dari cart
- ✅ Stock validation saat add to cart (check availability)
- ✅ Cart calculation akurat (subtotal, packaging fee, tax)
- ✅ Frontend cart sinkron dengan backend
- ✅ Simplified structure tanpa tabel carts terpisah


---

### **FASE 4: Address Management** (Estimasi: 1-2 hari)

#### Tujuan
Implementasi manajemen alamat pengiriman.

#### Tasks
1. ✅ Buat migration addresses
2. ✅ Buat Model Address dengan relasi ke User
3. ✅ Buat AddressController (CRUD)
4. ✅ Implementasi set default address
5. ✅ Testing address operations

#### Perintah Artisan
```bash
# Migration
php artisan make:migration create_addresses_table
php artisan migrate

# Model
php artisan make:model Address

# Controller
php artisan make:controller Api/AddressController

# Requests
php artisan make:request Address/StoreAddressRequest
php artisan make:request Address/UpdateAddressRequest

# Resource
php artisan make:resource AddressResource
```

#### Hasil Yang Diharapkan
- ✅ User bisa CRUD alamat pengiriman
- ✅ Set default address berfungsi
- ✅ Frontend bisa manage addresses


---

### **FASE 5: Order & Payment System** (Estimasi: 4-5 hari)

#### Tujuan
Implementasi sistem order dan payment.

#### Tasks
1. ✅ Buat migrations: shipping_methods, payment_methods, orders, order_items, payments
2. ✅ Tambahkan UUID, payment_status & address snapshot fields ke orders
3. ✅ Buat semua Models dengan relasi
4. ✅ Buat Seeders untuk shipping & payment methods
5. ✅ Buat OrderController (create, list, detail, cancel)
6. ✅ Implementasi UUID & order number generation
7. ✅ Snapshot alamat pengiriman saat checkout
8. ✅ Buat PaymentController (upload proof, confirm payment)
9. ✅ Implementasi stock decrement setelah payment confirmed
10. ✅ Testing complete checkout flow

#### Perintah Artisan
```bash
# Migrations
php artisan make:migration create_shipping_methods_table
php artisan make:migration create_payment_methods_table
php artisan make:migration create_orders_table
php artisan make:migration create_order_items_table
php artisan make:migration create_payments_table
php artisan migrate

# Models
php artisan make:model ShippingMethod
php artisan make:model PaymentMethod
php artisan make:model Order
php artisan make:model OrderItem
php artisan make:model Payment

# Controllers
php artisan make:controller Api/ShippingMethodController
php artisan make:controller Api/PaymentMethodController
php artisan make:controller Api/OrderController
php artisan make:controller Api/PaymentController

# Requests
php artisan make:request Order/CreateOrderRequest

# Resources
php artisan make:resource OrderResource
php artisan make:resource OrderDetailResource
php artisan make:resource PaymentResource

# Seeders
php artisan make:seeder ShippingMethodSeeder
php artisan make:seeder PaymentMethodSeeder
php artisan db:seed --class=ShippingMethodSeeder
php artisan db:seed --class=PaymentMethodSeeder
```

#### Hasil Yang Diharapkan
- ✅ User bisa checkout dan create order
- ✅ UUID ter-generate otomatis untuk public access
- ✅ Order number ter-generate otomatis
- ✅ Payment status tracked terpisah dari order status
- ✅ Alamat pengiriman ter-snapshot saat order dibuat
- ✅ Stock TIDAK berkurang saat order dibuat
- ✅ Stock berkurang HANYA setelah payment confirmed (status = 'paid')
- ✅ User bisa lihat order history
- ✅ Payment proof bisa di-upload
- ✅ Admin bisa confirm payment


---

### **FASE 6: Integration & Testing** (Estimasi: 2-3 hari)

#### Tujuan
Integrasi frontend-backend secara menyeluruh dan testing.

#### Tasks
1. ✅ Update frontend untuk fetch dari API
2. ✅ Handle error responses dengan baik
3. ✅ Implementasi loading states
4. ✅ Testing end-to-end flow
5. ✅ Fix bugs yang ditemukan
6. ✅ Optimize queries (eager loading)

#### Testing Checklist
- [ ] Register → Login → Browse Products
- [ ] Add to Cart → Update Quantity → Remove
- [ ] Checkout → Select Address → Create Order
- [ ] View Order History
- [ ] Update Profile
- [ ] Manage Addresses

---

### **FASE 7: Admin Panel (Optional)** (Estimasi: 5-7 hari)

#### Tujuan
Buat admin dashboard untuk manage products & orders.

#### Tasks
1. ✅ Buat admin middleware & routes
2. ✅ Product CRUD untuk admin
3. ✅ Order management (update status)
4. ✅ Payment verification
5. ✅ Dashboard statistics


---

## 6. STRATEGI INTEGRASI FRONTEND-BACKEND

### 6.1 Prinsip Integrasi Bertahap

**Tujuan:** Integrasi backend tanpa merombak frontend yang sudah jadi.

**Strategi:**
1. **Fallback Pattern** - Frontend tetap punya mock data sebagai fallback
2. **Progressive Enhancement** - Tambahkan API calls secara bertahap
3. **Error Handling** - Graceful fallback ke mock data jika API error
4. **Environment Variables** - Konfigurasi API URL via `.env`

---

### 6.2 Setup Environment Variables

**File: `frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_API_TIMEOUT=10000
```

**File: `backend/.env`**
```env
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
```

---

### 6.3 Setup CORS di Laravel

**File: `backend/config/cors.php`**
```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```


---

### 6.4 API Client Helper (Frontend)

**File: `frontend/lib/api.ts`**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface ApiOptions extends RequestInit {
  token?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Helper functions
export const api = {
  get: <T>(endpoint: string, token?: string) =>
    apiClient<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, data: any, token?: string) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  put: <T>(endpoint: string, data: any, token?: string) =>
    apiClient<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  delete: <T>(endpoint: string, token?: string) =>
    apiClient<T>(endpoint, { method: 'DELETE', token }),
};
```


---

### 6.5 Token Management (Frontend)

**File: `frontend/lib/auth.ts`**
```typescript
const TOKEN_KEY = 'mycakeshop_token';
const USER_KEY = 'user';

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  clearAll: (): void => {
    authStorage.removeToken();
    authStorage.removeUser();
  },
};
```


---

### 6.6 Contoh Integrasi: Login Page

**Before (Mock Only):**
```typescript
// frontend/app/login/page.tsx - EXISTING CODE
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:8000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    localStorage.setItem("user", JSON.stringify(data.user));
    router.push("/profile");
  } catch (err) {
    // FALLBACK TO MOCK
    const mockUser = { id: "mock-123", name: "Customer" };
    localStorage.setItem("user", JSON.stringify(mockUser));
    router.push("/profile");
  }
};
```

**After (With Proper API Client):**
```typescript
// frontend/app/login/page.tsx - IMPROVED
import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth';

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const response = await api.post<{
      success: boolean;
      data: { user: any; token: string };
    }>('/login', {
      email: loginMethod === 'email' ? email : undefined,
      phone: loginMethod === 'phone' ? phone : undefined,
      password: password,
    });

    // Save token & user
    authStorage.setToken(response.data.token);
    authStorage.setUser(response.data.user);

    router.push("/profile");
  } catch (err: any) {
    setError(err.message || "Login gagal. Silakan coba lagi.");
  } finally {
    setLoading(false);
  }
};
```


---

### 6.7 Contoh Integrasi: Products Page

**Before (Mock Data):**
```typescript
// frontend/app/products/page.tsx - EXISTING
import { PRODUCTS } from "@/data/products";

export default function ProductsPage() {
  const [products] = useState(PRODUCTS);
  // ... filtering & sorting logic
}
```

**After (API Integration with Fallback):**
```typescript
// frontend/app/products/page.tsx - IMPROVED
import { PRODUCTS } from "@/data/products"; // Keep as fallback
import { api } from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState(PRODUCTS); // Default to mock
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get<{
        success: boolean;
        data: { products: any[] };
      }>(`/products?category=${selectedCategory}&search=${searchQuery}&sort=${sortBy}`);
      
      setProducts(response.data.products);
    } catch (err) {
      console.warn('Failed to fetch products, using mock data', err);
      // Fallback to mock data - already set in useState
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```


---

### 6.8 Contoh Integrasi: Cart Context

**Modified: `frontend/context/CartContext.tsx`**

**Tambahkan API sync functions:**
```typescript
// Add to CartContext.tsx
import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load cart dari localStorage DAN backend
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const token = authStorage.getToken();
    
    if (token) {
      // User logged in - fetch from backend
      try {
        const response = await api.get('/cart', token);
        setCartItems(response.data.items.map(mapBackendToFrontend));
      } catch (err) {
        console.warn('Failed to load cart from backend', err);
        // Fallback to localStorage
        const storedCart = localStorage.getItem("mycakeshop_cart");
        if (storedCart) setCartItems(JSON.parse(storedCart));
      }
    } else {
      // Guest user - use localStorage
      const storedCart = localStorage.getItem("mycakeshop_cart");
      if (storedCart) setCartItems(JSON.parse(storedCart));
    }
  };

  const addToCart = async (item: Omit<CartItem, "quantity">, quantity = 1) => {
    const newItems = [...cartItems];
    const existingItem = newItems.find((i) => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      newItems.push({ ...item, quantity });
    }

    setCartItems(newItems);
    localStorage.setItem("mycakeshop_cart", JSON.stringify(newItems));

    // Sync to backend if logged in
    const token = authStorage.getToken();
    if (token) {
      try {
        await api.post('/cart', {
          product_id: item.id,
          quantity: quantity,
        }, token);
      } catch (err) {
        console.warn('Failed to add to backend cart', err);
      }
    }
  };

  // Similar pattern for updateQuantity, removeFromCart, clearCart
  // ...
}

function mapBackendToFrontend(backendItem: any): CartItem {
  return {
    id: backendItem.product.id,
    name: backendItem.product.name,
    price: backendItem.price,
    image: backendItem.product.main_image,
    quantity: backendItem.quantity,
    unit: backendItem.size?.size_name,
  };
}
```


---

### 6.9 Error Handling Strategy

**Consistent Error Response Format (Backend):**

**File: `backend/app/Exceptions/Handler.php`**
```php
<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $e)
    {
        if ($request->is('api/*')) {
            // Validation errors
            if ($e instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422);
            }

            // Not found
            if ($e instanceof NotFoundHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found',
                ], 404);
            }

            // General errors
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'An error occurred',
            ], 500);
        }

        return parent::render($request, $e);
    }
}
```

**Frontend Error Display:**
```typescript
// frontend/components/ErrorMessage.tsx
export function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  
  return (
    <div className="mb-4 p-3 bg-error-container text-on-error-container border border-error/20 rounded-lg text-sm">
      {message}
    </div>
  );
}
```


---

### 6.10 Response Format Standar (Backend)

**Trait untuk Consistent Response:**

**File: `backend/app/Traits/ApiResponse.php`**
```php
<?php

namespace App\Traits;

trait ApiResponse
{
    protected function successResponse($data, $message = 'Success', $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    protected function errorResponse($message = 'Error', $code = 400, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    protected function paginatedResponse($data, $message = 'Success')
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'items' => $data->items(),
                'pagination' => [
                    'total' => $data->total(),
                    'per_page' => $data->perPage(),
                    'current_page' => $data->currentPage(),
                    'last_page' => $data->lastPage(),
                    'from' => $data->firstItem(),
                    'to' => $data->lastItem(),
                ],
            ],
        ]);
    }
}
```

**Usage dalam Controller:**
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Models\Product;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $products = Product::with(['category', 'sizes'])
            ->when($request->category, function ($q) use ($request) {
                $q->whereHas('category', fn($q) => $q->where('slug', $request->category));
            })
            ->when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            })
            ->paginate($request->per_page ?? 12);

        return $this->paginatedResponse($products, 'Products retrieved successfully');
    }
}
```


---

## 7. CHECKLIST IMPLEMENTASI

### ✅ Phase 1: Foundation (PRIORITAS TERTINGGI)
- [ ] Install Laravel Sanctum
- [ ] Configure CORS
- [ ] Modify users table migration (add phone, role)
- [ ] Update AuthController (email/phone login)
- [ ] Create ProfileController
- [ ] Test authentication flow
- [ ] Update frontend login/register to use API

### ✅ Phase 2: Product Catalog
- [ ] Create categories, products, product_sizes, product_images migrations
- [ ] Create Models with relationships
- [ ] Create CategorySeeder & ProductSeeder (from products.ts)
- [ ] Create ProductController with filtering
- [ ] Create ProductResource for response format
- [ ] Test product endpoints
- [ ] Update frontend products page to fetch from API

### ✅ Phase 3: Shopping Cart
- [ ] Create carts & cart_items migrations
- [ ] Create Cart & CartItem models
- [ ] Create CartController (CRUD operations)
- [ ] Implement cart calculations
- [ ] Create CartResource
- [ ] Test cart operations
- [ ] Update CartContext to sync with backend

### ✅ Phase 4: Address Management
- [ ] Create addresses migration
- [ ] Create Address model
- [ ] Create AddressController
- [ ] Implement set default logic
- [ ] Create AddressResource
- [ ] Test address CRUD
- [ ] Update profile page address management

### ✅ Phase 5: Order & Payment
- [ ] Create shipping_methods, payment_methods migrations
- [ ] Create orders, order_items, payments migrations
- [ ] Create all related models
- [ ] Create seeders for shipping & payment methods
- [ ] Create OrderController
- [ ] Implement order number generation
- [ ] Create PaymentController
- [ ] Test complete checkout flow
- [ ] Update checkout & order pages

### ✅ Phase 6: Testing & Optimization
- [ ] End-to-end testing
- [ ] Performance optimization (eager loading)
- [ ] Error handling improvements
- [ ] Security audit
- [ ] Documentation


---

## 8. DEPENDENCIES & PACKAGES

### Backend (Laravel)
```json
{
  "require": {
    "php": "^8.2",
    "laravel/framework": "^12.0",
    "laravel/sanctum": "^4.0",
    "laravel/tinker": "^2.10"
  },
  "require-dev": {
    "fakerphp/faker": "^1.23",
    "laravel/pint": "^1.13",
    "mockery/mockery": "^1.6",
    "nunomaduro/collision": "^8.0",
    "phpunit/phpunit": "^11.0"
  }
}
```

**Install Sanctum:**
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### Frontend (Next.js)
```json
{
  "dependencies": {
    "next": "15.x",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5"
  }
}
```

**No additional packages needed** - menggunakan native fetch API.

---

## 9. BEST PRACTICES & TIPS

### 9.1 Database
- ✅ Gunakan migrations untuk semua perubahan schema
- ✅ Buat seeders untuk data master (categories, shipping methods)
- ✅ Gunakan foreign keys dengan ON DELETE CASCADE/RESTRICT yang sesuai
- ✅ Index kolom yang sering di-query (email, phone, status, created_at)

### 9.2 Security
- ✅ Validasi semua input dengan Form Requests
- ✅ Sanitize data sebelum save ke database
- ✅ Gunakan Laravel Sanctum untuk token authentication
- ✅ Hash passwords dengan bcrypt
- ✅ Rate limiting untuk login endpoint
- ✅ HTTPS di production

### 9.3 Performance
- ✅ Eager loading untuk relasi (with(), load())
- ✅ Pagination untuk list endpoints
- ✅ Cache untuk data yang jarang berubah (categories, shipping methods)
- ✅ Database indexes untuk query optimization
- ✅ Query optimization (select only needed columns)
- ✅ Soft deletes untuk products (data retention & restore capability)

### 9.4 Code Quality
- ✅ Gunakan Resources untuk transform response
- ✅ Gunakan Form Requests untuk validation
- ✅ Gunakan Traits untuk reusable code (ApiResponse)
- ✅ Follow PSR-12 coding standards
- ✅ Write meaningful comments
- ✅ Consistent naming conventions


---

## 10. TESTING STRATEGY

### 10.1 Testing Tools

**Backend Testing:**
```bash
# Unit & Feature Tests
php artisan test

# Specific test file
php artisan test tests/Feature/AuthTest.php

# With coverage
php artisan test --coverage
```

**Frontend Testing:**
- Manual testing dengan browser
- Postman/Insomnia untuk API testing

### 10.2 Test Scenarios

#### Authentication
- [ ] Register dengan email berhasil
- [ ] Register dengan phone berhasil
- [ ] Register dengan email duplicate (error)
- [ ] Login dengan email berhasil
- [ ] Login dengan phone berhasil
- [ ] Login dengan kredensial salah (error)
- [ ] Logout berhasil
- [ ] Access protected route tanpa token (error)

#### Products
- [ ] Get all products
- [ ] Filter by category
- [ ] Search by name
- [ ] Sort by price
- [ ] Get product detail
- [ ] Pagination works correctly

#### Cart
- [ ] Add item to cart
- [ ] Update quantity
- [ ] Remove item
- [ ] Clear cart
- [ ] Cart calculation akurat

#### Orders
- [ ] Create order berhasil
- [ ] Get order list
- [ ] Get order detail
- [ ] Cancel order

### 10.3 Example Feature Test

**File: `backend/tests/Feature/AuthTest.php`**
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_email()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
        ]);
    }

    public function test_user_can_login_with_email()
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['user', 'token'],
            ]);
    }
}
```


---

## 11. DEPLOYMENT CHECKLIST

### 11.1 Backend (Laravel)

**Environment Setup:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.mycakeshop.com

DB_CONNECTION=mysql
DB_HOST=your_db_host
DB_PORT=3306
DB_DATABASE=mycakeshop_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

FRONTEND_URL=https://mycakeshop.com
SANCTUM_STATEFUL_DOMAINS=mycakeshop.com
SESSION_DOMAIN=.mycakeshop.com
```

**Deployment Commands:**
```bash
# Update dependencies
composer install --optimize-autoloader --no-dev

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Run seeders (first time only)
php artisan db:seed --force

# Storage link
php artisan storage:link

# Set permissions
chmod -R 755 storage bootstrap/cache
```

**Server Requirements:**
- PHP >= 8.2
- MySQL >= 8.0
- Composer
- SSL Certificate (Let's Encrypt)

### 11.2 Frontend (Next.js)

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://api.mycakeshop.com/api
```

**Build & Deploy:**
```bash
# Build production
npm run build

# Start production server
npm start

# Or deploy to Vercel/Netlify
vercel deploy --prod
```

### 11.3 Production Checklist

**Security:**
- [ ] SSL certificate installed
- [ ] APP_DEBUG=false
- [ ] Strong database passwords
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] .env file secured (not in git)

**Performance:**
- [ ] Config cached
- [ ] Routes cached
- [ ] Views cached
- [ ] Database indexed
- [ ] Query optimization
- [ ] CDN for static assets

**Monitoring:**
- [ ] Error logging configured
- [ ] Server monitoring
- [ ] Database backups automated
- [ ] Uptime monitoring


---

## 12. TROUBLESHOOTING COMMON ISSUES

### Issue 1: CORS Error
**Problem:** Frontend tidak bisa akses backend API
**Solution:**
```php
// backend/config/cors.php
'allowed_origins' => [env('FRONTEND_URL')],
'supports_credentials' => true,
```

### Issue 2: Sanctum Token Not Working
**Problem:** Token authentication gagal
**Solution:**
```php
// backend/config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000')),

// backend/app/Http/Kernel.php - Ensure api middleware has sanctum
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

### Issue 3: Database Connection Failed
**Problem:** Laravel tidak bisa connect ke database
**Solution:**
```bash
# Check .env database settings
php artisan config:clear
php artisan migrate:status
```

### Issue 4: 419 CSRF Token Mismatch
**Problem:** CSRF token error
**Solution:**
- API routes di Laravel tidak butuh CSRF protection
- Pastikan routes di `routes/api.php` bukan `routes/web.php`

### Issue 5: 404 Not Found untuk API Endpoints
**Problem:** API endpoint tidak ditemukan
**Solution:**
```bash
# Clear route cache
php artisan route:clear

# Check registered routes
php artisan route:list --path=api
```


---

## 13. NEXT STEPS - ACTION PLAN

### Immediate Actions (Hari Ini)

1. **Review & Approval**
   - Review master plan ini
   - Diskusikan jika ada perubahan requirement
   - Approval untuk mulai implementasi

2. **Setup Environment**
   - Pastikan Laravel 12 sudah terinstall
   - Pastikan MySQL running
   - Setup database `mycakeshop_db`

3. **Mulai Fase 1**
   - Install Laravel Sanctum
   - Configure CORS
   - Test authentication endpoint

### Week 1: Foundation & Products
- Days 1-2: Authentication & User Management (Fase 1)
- Days 3-4: Product Catalog (Fase 2)
- Day 5: Testing & Bug Fixes

### Week 2: Cart, Address & Orders
- Days 1-2: Shopping Cart (Fase 3)
- Day 3: Address Management (Fase 4)
- Days 4-5: Order & Payment System (Fase 5)

### Week 3: Integration & Polish
- Days 1-3: Frontend-Backend Integration (Fase 6)
- Days 4-5: Testing, Bug Fixes, Documentation

---

## 14. KESIMPULAN

### Summary

Dokumen ini menyediakan **roadmap lengkap** untuk integrasi backend Laravel dengan frontend Next.js yang sudah ada. Dengan mengikuti tahapan implementasi secara bertahap, Anda bisa:

✅ **Tidak Merombak Frontend** - Frontend tetap berfungsi dengan mock data sebagai fallback
✅ **Progressive Enhancement** - Tambahkan backend secara bertahap per fitur
✅ **Clear Structure** - Database schema, API endpoints, dan file structure sudah terdefinisi
✅ **Best Practices** - Mengikuti Laravel & Next.js best practices
✅ **Testing Strategy** - Clear testing approach untuk ensure quality

### Estimated Timeline
- **Minimum:** 2-3 minggu (basic features)
- **Recommended:** 3-4 minggu (dengan testing & polish)
- **With Admin Panel:** 4-6 minggu

### Resources Needed
- 1 Backend Developer (Laravel)
- 1 Frontend Developer (Next.js) - untuk integrasi
- MySQL Database
- Development & Staging Environment

---

## 15. CONTACT & SUPPORT

Jika ada pertanyaan atau butuh klarifikasi mengenai master plan ini, silakan diskusikan untuk revisi atau penjelasan lebih detail.

**Good luck with the implementation! 🎂🚀**

---

**Document Version:** 1.0  
**Last Updated:** 14 Juni 2026  
**Author:** Senior Full Stack Architect
