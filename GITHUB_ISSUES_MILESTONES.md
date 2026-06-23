# 📋 GitHub Issues & Milestones - MyCakeShop Backend

**Project:** MyCakeShop Backend Integration  
**Tech Stack:** Laravel 12 + MySQL + REST API  
**Created:** 21 Juni 2026

---

## 🎯 MILESTONES

### Milestone 1: Foundation & Authentication ✅
**Due Date:** 17 Juni 2026  
**Status:** ✅ COMPLETED  
**Description:** Setup infrastruktur dasar, authentication, dan user management.

**Progress:** 5/5 issues closed (100%)

---

### Milestone 2: Product Catalog ✅
**Due Date:** 19 Juni 2026  
**Status:** ✅ COMPLETED  
**Description:** Implementasi sistem produk, kategori, dan filtering.

**Progress:** 7/7 issues closed (100%)

---

### Milestone 3: Shopping Cart ✅
**Due Date:** 20 Juni 2026  
**Status:** ✅ COMPLETED  
**Description:** Implementasi sistem keranjang belanja dengan cart calculation.

**Progress:** 5/5 issues closed (100%)

---

### Milestone 4: Address Management ✅
**Due Date:** 21 Juni 2026  
**Status:** ✅ COMPLETED  
**Description:** Implementasi sistem manajemen alamat pengiriman.

**Progress:** 5/5 issues closed (100%)

---

### Milestone 5: Order & Payment System ✅
**Due Date:** 26 Juni 2026  
**Status:** ✅ COMPLETED  
**Description:** Implementasi sistem order dan payment dengan stock management.

**Progress:** 10/10 issues closed (100%)

---

### Milestone 6: Integration & Testing ⏳
**Due Date:** 30 Juni 2026  
**Status:** ⏳ PLANNED  
**Description:** Integrasi frontend-backend dan comprehensive testing.

**Progress:** 0/6 issues closed (0%)

---

## 🐛 ISSUES

---

## ✅ MILESTONE 1: Foundation & Authentication (CLOSED)

### Issue #1: Setup Laravel Sanctum ✅
**Labels:** `backend`, `auth`, `setup`  
**Milestone:** Foundation & Authentication  
**Assignees:** Backend Developer  
**Status:** ✅ CLOSED

**Description:**
Install dan configure Laravel Sanctum untuk API authentication.

**Tasks:**
- [x] Install Laravel Sanctum via composer
- [x] Publish Sanctum config & migrations
- [x] Run migrations
- [x] Add HasApiTokens trait to User model
- [x] Configure sanctum middleware in api routes

**Acceptance Criteria:**
- Sanctum installed and configured
- Token authentication working
- API routes protected with auth:sanctum

---

### Issue #2: Configure CORS for Frontend ✅
**Labels:** `backend`, `config`, `cors`  
**Milestone:** Foundation & Authentication  
**Status:** ✅ CLOSED

**Description:**
Setup CORS configuration untuk allow frontend Next.js communicate dengan backend.

**Tasks:**
- [x] Update `config/cors.php`
- [x] Set `allowed_origins` to frontend URL
- [x] Enable `supports_credentials`
- [x] Configure SANCTUM_STATEFUL_DOMAINS in .env

---

### Issue #3: Modify Users Table for Email/Phone Login ✅
**Labels:** `backend`, `database`, `migration`  
**Milestone:** Foundation & Authentication  
**Status:** ✅ CLOSED

**Description:**
Update users table untuk support login dengan email atau phone number.

**Tasks:**
- [x] Create migration to add phone column
- [x] Make email nullable
- [x] Add unique constraint to phone
- [x] Run migration

---

### Issue #4: Update AuthController for Email/Phone Login ✅
**Labels:** `backend`, `auth`, `controller`  
**Milestone:** Foundation & Authentication  
**Status:** ✅ CLOSED

**Description:**
Update AuthController untuk support authentication dengan email atau phone.

**Tasks:**
- [x] Update login method to accept email or phone
- [x] Update register method
- [x] Add validation for phone format
- [x] Return token on successful auth
- [x] Add logout endpoint

---

### Issue #5: Create ProfileController ✅
**Labels:** `backend`, `profile`, `controller`  
**Milestone:** Foundation & Authentication  
**Status:** ✅ CLOSED

**Description:**
Buat ProfileController untuk user profile management.

**Tasks:**
- [x] Create ProfileController
- [x] Add profile() method to get current user
- [x] Add update() method to update profile
- [x] Create UpdateProfileRequest for validation
- [x] Add routes to api.php

---

## ✅ MILESTONE 2: Product Catalog (CLOSED)

### Issue #6: Create Database Schema for Products ✅
**Labels:** `backend`, `database`, `migration`  
**Milestone:** Product Catalog  
**Status:** ✅ CLOSED

**Description:**
Buat migrations untuk categories, products, product_sizes, product_images.

**Tasks:**
- [x] Create categories migration
- [x] Create products migration (with stock field)
- [x] Create product_sizes migration
- [x] Create product_images migration
- [x] Add foreign keys and indexes
- [x] Run all migrations

---

### Issue #7: Create Product Models with Relationships ✅
**Labels:** `backend`, `model`, `eloquent`  
**Milestone:** Product Catalog  
**Status:** ✅ CLOSED

**Description:**
Buat Models untuk Category, Product, ProductSize, ProductImage dengan proper relationships.

**Tasks:**
- [x] Create Category model
- [x] Create Product model (with SoftDeletes)
- [x] Create ProductSize model
- [x] Create ProductImage model
- [x] Define relationships (hasMany, belongsTo)
- [x] Add fillable fields and casts

---

### Issue #8: Create Product Seeders ✅
**Labels:** `backend`, `seeder`, `data`  
**Milestone:** Product Catalog  
**Status:** ✅ CLOSED

**Description:**
Buat seeders untuk populate database dengan data produk dari frontend.

**Tasks:**
- [x] Create CategorySeeder
- [x] Create ProductSeeder
- [x] Migrate data from products.ts
- [x] Run seeders

---

### Issue #9: Create ProductController with Filtering ✅
**Labels:** `backend`, `controller`, `api`  
**Milestone:** Product Catalog  
**Status:** ✅ CLOSED

**Description:**
Buat ProductController dengan support untuk filtering, sorting, dan pagination.

**Tasks:**
- [x] Create ProductController
- [x] Implement index() with filters
- [x] Add category filter
- [x] Add search functionality
- [x] Add sorting (recommended, price, newest)
- [x] Add pagination
- [x] Implement show() for product detail

---

### Issue #10: Create CategoryController ✅
**Labels:** `backend`, `controller`, `api`  
**Milestone:** Product Catalog  
**Status:** ✅ CLOSED

**Description:**
Buat CategoryController untuk list categories.

**Tasks:**
- [x] Create CategoryController
- [x] Implement index() method
- [x] Create CategoryResource
- [x] Add route to api.php

---

### Issue #11: Create Product Resources ✅
**Labels:** `backend`, `resource`, `api`  
**Milestone:** Product Catalog  
**Status:** ✅ CLOSED

**Description:**
Buat API Resources untuk format response yang konsisten.

**Tasks:**
- [x] Create ProductResource
- [x] Create ProductDetailResource
- [x] Include related data (category, sizes, images)

---

### Issue #12: Test Product Endpoints ✅
**Labels:** `backend`, `testing`, `api`  
**Milestone:** Product Catalog  
**Status:** ✅ CLOSED

**Description:**
Test semua product endpoints untuk ensure functionality.

**Tasks:**
- [x] Test GET /api/products
- [x] Test filtering by category
- [x] Test search functionality
- [x] Test sorting
- [x] Test pagination
- [x] Test GET /api/products/{slug}
- [x] Test soft delete exclusion

---

## ✅ MILESTONE 3: Shopping Cart (CLOSED)

### Issue #13: Create Cart Database Schema ✅
**Labels:** `backend`, `database`, `migration`  
**Milestone:** Shopping Cart  
**Status:** ✅ CLOSED

**Description:**
Buat migration untuk cart_items table (simplified, no separate carts table).

**Tasks:**
- [x] Create cart_items migration
- [x] Add foreign keys to users and products
- [x] Add unique constraint (user_id, product_id, product_size_id)
- [x] Run migration

---

### Issue #14: Create CartItem Model ✅
**Labels:** `backend`, `model`, `eloquent`  
**Milestone:** Shopping Cart  
**Status:** ✅ CLOSED

**Description:**
Buat CartItem model dengan relationships.

**Tasks:**
- [x] Create CartItem model
- [x] Define relationships to User, Product, ProductSize
- [x] Add fillable fields
- [x] Add casts if needed

---

### Issue #15: Create CartController with CRUD ✅
**Labels:** `backend`, `controller`, `api`  
**Milestone:** Shopping Cart  
**Status:** ✅ CLOSED

**Description:**
Buat CartController dengan methods untuk manage cart items.

**Tasks:**
- [x] Create CartController
- [x] Implement index() - get user cart
- [x] Implement store() - add to cart
- [x] Implement update() - update quantity
- [x] Implement destroy() - remove item
- [x] Implement clear() - clear entire cart

---

### Issue #16: Implement Cart Calculation ✅
**Labels:** `backend`, `feature`, `calculation`  
**Milestone:** Shopping Cart  
**Status:** ✅ CLOSED

**Description:**
Implementasi cart calculation untuk subtotal, packaging fee, tax, total.

**Tasks:**
- [x] Calculate subtotal from cart items
- [x] Add packaging fee
- [x] Calculate tax (11%)
- [x] Return cart summary in response

---

### Issue #17: Create Cart Resources & Validation ✅
**Labels:** `backend`, `resource`, `validation`  
**Milestone:** Shopping Cart  
**Status:** ✅ CLOSED

**Description:**
Buat Resources dan Form Requests untuk cart operations.

**Tasks:**
- [x] Create CartResource
- [x] Create CartItemResource
- [x] Create AddToCartRequest
- [x] Create UpdateCartItemRequest
- [x] Add stock validation

---

## ✅ MILESTONE 4: Address Management (CLOSED)

### Issue #18: Create Address Database Schema ✅
**Labels:** `backend`, `database`, `migration`  
**Milestone:** Address Management  
**Status:** ✅ CLOSED

**Description:**
Buat migration untuk addresses table.

**Tasks:**
- [x] Create addresses migration
- [x] Add all required fields (label, recipient_name, phone, etc.)
- [x] Add foreign key to users
- [x] Add is_default boolean field
- [x] Add indexes
- [x] Run migration

---

### Issue #19: Create Address Model ✅
**Labels:** `backend`, `model`, `eloquent`  
**Milestone:** Address Management  
**Status:** ✅ CLOSED

**Description:**
Buat Address model dengan auto-manage default logic.

**Tasks:**
- [x] Create Address model
- [x] Define relationship to User
- [x] Add fillable fields
- [x] Add boot method for default management
- [x] Update User model with addresses relationship

---

### Issue #20: Create AddressController ✅
**Labels:** `backend`, `controller`, `api`  
**Milestone:** Address Management  
**Status:** ✅ CLOSED

**Description:**
Buat AddressController dengan full CRUD operations.

**Tasks:**
- [x] Create AddressController
- [x] Implement index() - list addresses
- [x] Implement store() - create address
- [x] Implement show() - get single address
- [x] Implement update() - update address
- [x] Implement destroy() - delete address
- [x] Implement setDefault() - set as default

---

### Issue #21: Create Address Validation & Resource ✅
**Labels:** `backend`, `validation`, `resource`  
**Milestone:** Address Management  
**Status:** ✅ CLOSED

**Description:**
Buat Form Requests dan Resource untuk address operations.

**Tasks:**
- [x] Create StoreAddressRequest
- [x] Create UpdateAddressRequest
- [x] Create AddressResource
- [x] Add custom validation messages

---

### Issue #22: Add Address Routes ✅
**Labels:** `backend`, `routes`, `api`  
**Milestone:** Address Management  
**Status:** ✅ CLOSED

**Description:**
Tambahkan routes untuk address management ke api.php.

**Tasks:**
- [x] Add 6 address routes
- [x] Protect with auth:sanctum middleware
- [x] Test route registration

---

## 🔄 MILESTONE 5: Order & Payment System (CLOSED)

### Issue #23: Create Shipping & Payment Methods Schema ✅
**Labels:** `backend`, `database`, `migration`  
**Milestone:** Order & Payment System  
**Status:** ✅ CLOSED

**Description:**
Buat migrations untuk shipping_methods dan payment_methods tables.

**Tasks:**
- [x] Create shipping_methods migration
- [x] Create payment_methods migration
- [x] Add required fields
- [x] Run migrations
- [x] Create models

**Acceptance Criteria:**
- Tables created successfully
- Models with proper fillable fields
- Seeders ready for data

---

### Issue #24: Create Shipping & Payment Seeders ✅
**Labels:** `backend`, `seeder`, `data`  
**Milestone:** Order & Payment System  
**Status:** ✅ CLOSED

**Description:**
Buat seeders untuk populate shipping dan payment methods.

**Tasks:**
- [x] Create ShippingMethodSeeder
- [x] Add shipping methods (Instant, Sameday, Regular)
- [x] Create PaymentMethodSeeder
- [x] Add payment methods (Bank Transfer, GoPay, OVO, QRIS)
- [x] Run seeders

---

### Issue #25: Create Orders Database Schema ✅
**Labels:** `backend`, `database`, `migration`  
**Milestone:** Order & Payment System  
**Status:** ✅ CLOSED  
**Priority:** HIGH

**Description:**
Buat migrations untuk orders dan order_items tables dengan UUID dan address snapshot.

**Tasks:**
- [x] Create orders migration with UUID
- [x] Add payment_status field (separate from status)
- [x] Add address snapshot fields
- [x] Create order_items migration
- [x] Add foreign keys and indexes
- [x] Run migrations

**Important Notes:**
- orders table harus punya UUID untuk public identifier
- Snapshot alamat pengiriman saat checkout (jangan pakai FK ke addresses)
- payment_status terpisah dari order status
- Stock TIDAK berkurang saat order dibuat

---

### Issue #26: Create Payments Table ✅
**Labels:** `backend`, `database`, `migration`  
**Milestone:** Order & Payment System  
**Status:** ✅ CLOSED

**Description:**
Buat migration untuk payments table.

**Tasks:**
- [x] Create payments migration
- [x] Link to orders table
- [x] Add payment_proof field for bank transfer
- [x] Add status field
- [x] Run migration

---

### Issue #27: Create Order & Payment Models ✅
**Labels:** `backend`, `model`, `eloquent`  
**Milestone:** Order & Payment System  
**Status:** ✅ CLOSED

**Description:**
Buat Models untuk Order, OrderItem, Payment dengan relationships.

**Tasks:**
- [x] Create Order model
- [x] Create OrderItem model
- [x] Create Payment model
- [x] Define all relationships
- [x] Add UUID generation in Order model
- [x] Add order number generation

---

### Issue #28: Create OrderController ✅
**Labels:** `backend`, `controller`, `api`  
**Milestone:** Order & Payment System  
**Status:** ✅ CLOSED  
**Priority:** HIGH

**Description:**
Buat OrderController untuk create, list, detail, cancel orders.

**Tasks:**
- [x] Create OrderController
- [x] Implement store() - create order with address snapshot
- [x] Implement index() - list user orders
- [x] Implement show() - get order detail by UUID
- [x] Implement cancel() - cancel order (if pending)
- [x] Calculate order totals
- [x] Clear cart after order created

**Important:**
- Use UUID in URLs, not database ID
- Snapshot address saat checkout
- Don't decrement stock on order creation

---

### Issue #29: Create PaymentController ✅
**Labels:** `backend`, `controller`, `api`  
**Milestone:** Order & Payment System  
**Status:** ✅ CLOSED

**Description:**
Buat PaymentController untuk payment operations.

**Tasks:**
- [x] Create PaymentController
- [x] Implement uploadProof() - upload payment proof
- [x] Implement confirm() - admin confirm payment
- [x] Update order payment_status when confirmed
- [x] Decrement stock when payment confirmed as 'paid'

**Important:**
- Stock ONLY decrements when payment_status = 'paid'
- Admin only endpoint for confirm payment

---

### Issue #30: Create Shipping & Payment Controllers ✅
**Labels:** `backend`, `controller`, `api`  
**Milestone:** Order & Payment System  
**Status:** ✅ CLOSED

**Description:**
Buat controllers untuk list shipping and payment methods.

**Tasks:**
- [x] Create ShippingMethodController
- [x] Create PaymentMethodController
- [x] Both return active methods only
- [x] Add public routes (no auth required)

---

### Issue #31: Create Order Resources & Validation ✅
**Labels:** `backend`, `resource`, `validation`  
**Milestone:** Order & Payment System  
**Status:** ✅ CLOSED

**Description:**
Buat Resources dan Form Requests untuk order operations.

**Tasks:**
- [x] Create OrderResource
- [x] Create OrderDetailResource
- [x] Create PaymentResource
- [x] Create CreateOrderRequest
- [x] Include order items, payment, status in resources

---

### Issue #32: Implement Stock Management ✅
**Labels:** `backend`, `feature`, `stock`  
**Milestone:** Order & Payment System  
**Status:** ✅ CLOSED  
**Priority:** HIGH

**Description:**
Implementasi stock decrement setelah payment confirmed.

**Tasks:**
- [x] Create stock decrement logic in Payment model
- [x] Trigger on payment confirmation
- [x] Validate stock availability before decrement
- [x] Handle insufficient stock scenario

**Important:**
- Stock decrements ONLY when payment_status changes to 'paid'
- NOT when order is created

---

## ⏳ MILESTONE 6: Integration & Testing (PLANNED)

### Issue #33: Update Frontend to Use Backend API ⏳
**Labels:** `frontend`, `integration`, `api`  
**Milestone:** Integration & Testing  
**Status:** ⏳ PLANNED

**Description:**
Update frontend untuk fetch data dari backend API dengan fallback ke mock data.

**Tasks:**
- [ ] Create API client helper (lib/api.ts)
- [ ] Create auth storage helper (lib/auth.ts)
- [ ] Update login/register pages
- [ ] Update products page
- [ ] Update cart context
- [ ] Update checkout page
- [ ] Update profile page
- [ ] Update orders page

---

### Issue #34: Implement Error Handling ⏳
**Labels:** `frontend`, `error-handling`, `ux`  
**Milestone:** Integration & Testing  
**Status:** ⏳ PLANNED

**Description:**
Implementasi proper error handling di frontend.

**Tasks:**
- [ ] Create ErrorMessage component
- [ ] Handle API errors gracefully
- [ ] Show user-friendly error messages
- [ ] Implement retry logic for failed requests

---

### Issue #35: Add Loading States ⏳
**Labels:** `frontend`, `ux`, `loading`  
**Milestone:** Integration & Testing  
**Status:** ⏳ PLANNED

**Description:**
Tambahkan loading states untuk better UX.

**Tasks:**
- [ ] Add loading spinners to buttons
- [ ] Add skeleton loaders for content
- [ ] Disable buttons during async operations
- [ ] Show loading indicators on page transitions

---

### Issue #36: End-to-End Testing ⏳
**Labels:** `testing`, `e2e`, `qa`  
**Milestone:** Integration & Testing  
**Status:** ⏳ PLANNED

**Description:**
Perform comprehensive end-to-end testing.

**Tasks:**
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test product browsing & filtering
- [ ] Test add to cart & cart management
- [ ] Test address management
- [ ] Test checkout flow
- [ ] Test order creation
- [ ] Test payment upload
- [ ] Test profile update

---

### Issue #37: Performance Optimization ⏳
**Labels:** `backend`, `optimization`, `performance`  
**Milestone:** Integration & Testing  
**Status:** ⏳ PLANNED

**Description:**
Optimize backend performance dengan query optimization dan caching.

**Tasks:**
- [ ] Add eager loading to relationships
- [ ] Optimize N+1 queries
- [ ] Add database indexes where needed
- [ ] Implement caching for static data
- [ ] Optimize product search queries

---

### Issue #38: Documentation & Deployment ⏳
**Labels:** `documentation`, `deployment`, `devops`  
**Milestone:** Integration & Testing  
**Status:** ⏳ PLANNED

**Description:**
Complete documentation dan prepare for deployment.

**Tasks:**
- [ ] Complete API documentation
- [ ] Write deployment guide
- [ ] Create environment setup guide
- [ ] Document testing procedures
- [ ] Prepare production checklist

---

## 📊 LABELS USED

| Label | Color | Description |
|-------|-------|-------------|
| `backend` | `#0052CC` | Backend Laravel development |
| `frontend` | `#00875A` | Frontend Next.js development |
| `database` | `#403294` | Database migrations & schema |
| `api` | `#FF5630` | API endpoints & routes |
| `auth` | `#FFAB00` | Authentication & authorization |
| `testing` | `#36B37E` | Testing & QA |
| `bug` | `#DE350B` | Bug fixes |
| `feature` | `#6554C0` | New features |
| `enhancement` | `#0065FF` | Improvements to existing features |
| `documentation` | `#5243AA` | Documentation updates |
| `performance` | `#FFC400` | Performance optimization |
| `security` | `#FF5630` | Security improvements |

---

## 📈 PROGRESS TRACKING

### Overall Progress
- **Total Issues:** 38
- **Closed:** 32 (84.2%)
- **In Progress:** 0 (0%)
- **Todo:** 6 (15.8%)

### By Milestone
1. ✅ Foundation & Authentication: 5/5 (100%)
2. ✅ Product Catalog: 7/7 (100%)
3. ✅ Shopping Cart: 5/5 (100%)
4. ✅ Address Management: 5/5 (100%)
5. ✅ Order & Payment: 10/10 (100%)
6. ⏳ Integration & Testing: 0/6 (0%)

---

## 🚀 HOW TO USE THIS IN GITHUB

### Step 1: Create Milestones
1. Go to your GitHub repository
2. Click on "Issues" tab
3. Click on "Milestones"
4. Click "New milestone"
5. Create each milestone with title, description, and due date

### Step 2: Create Issues
1. Go to "Issues" tab
2. Click "New issue"
3. Copy issue title and description from this document
4. Add appropriate labels
5. Assign to milestone
6. Assign to team member
7. Create the issue

### Step 3: Track Progress
1. Use Projects board for kanban view
2. Move issues through: Todo → In Progress → Done
3. Close issues when completed
4. Milestones automatically track completion %

### Step 4: Create Labels
1. Go to "Issues" tab
2. Click "Labels"
3. Click "New label"
4. Add each label with color code from table above

---

## 💡 TIPS FOR ISSUE MANAGEMENT

1. **Break down large tasks** - If an issue is too big, break it into smaller sub-issues
2. **Link related issues** - Use "Related to #X" or "Blocked by #X" in descriptions
3. **Update regularly** - Comment on issues with progress updates
4. **Use checkboxes** - Enable GitHub to show task completion in issue lists
5. **Close with commits** - Use "Fixes #X" or "Closes #X" in commit messages
6. **Review regularly** - Weekly review of open issues and milestones

---

**Ready to track your development progress! 🎯**
