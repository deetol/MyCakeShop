<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductAdminController extends Controller
{
    use ApiResponse;

    /**
     * List all products (including inactive), with search & category filter.
     */
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Search by name or description
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Filter by category_id
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(12);

        $items = collect($products->items())->map(fn ($p) => $this->formatProduct($p));

        return response()->json([
            'success' => true,
            'data' => [
                'products' => $items,
                'pagination' => [
                    'total'        => $products->total(),
                    'per_page'     => $products->perPage(),
                    'current_page' => $products->currentPage(),
                    'last_page'    => $products->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Create a new product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price'  => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'unit'        => 'nullable|string|max:50',
            'tag'         => 'nullable|string|max:100',
            'main_image'  => 'nullable|string|max:2048',
            'is_active'   => 'boolean',
        ]);

        $validated['slug']      = $this->generateUniqueSlug($validated['name']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $product = Product::create($validated);
        $product->load('category');

        return $this->successResponse(
            $this->formatProduct($product),
            'Product created successfully',
            201
        );
    }

    /**
     * Bulk update stock and price for multiple products at once.
     */
    public function bulkUpdateStockPrice(Request $request)
    {
        $request->validate([
            'products'             => 'required|array|min:1',
            'products.*.id'        => 'required|exists:products,id',
            'products.*.stock'     => 'required|integer|min:0',
            'products.*.base_price'=> 'required|numeric|min:0',
        ]);

        foreach ($request->products as $item) {
            Product::where('id', $item['id'])->update([
                'stock'      => $item['stock'],
                'base_price' => $item['base_price'],
            ]);
        }

        return $this->successResponse(null, 'Stok dan harga berhasil diperbarui');
    }

    /**
     * Quick update stock and price for a single product.
     */
    public function updateStockPrice(Request $request, Product $product)
    {
        $request->validate([
            'stock'      => 'sometimes|integer|min:0',
            'base_price' => 'sometimes|numeric|min:0',
        ]);

        $product->update($request->only(['stock', 'base_price']));
        $product->load('category');

        return $this->successResponse($this->formatProduct($product), 'Berhasil diperbarui');
    }

    /**
     * Show a single product.
     */
    public function show(Product $product)
    {
        $product->load('category');
        return $this->successResponse($this->formatProduct($product), 'Product retrieved successfully');
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'base_price'  => 'sometimes|required|numeric|min:0',
            'stock'       => 'sometimes|required|integer|min:0',
            'unit'        => 'nullable|string|max:50',
            'tag'         => 'nullable|string|max:100',
            'main_image'  => 'nullable|string|max:2048',
            'is_active'   => 'boolean',
        ]);

        // Regenerate slug only when name actually changes
        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = $this->generateUniqueSlug($validated['name'], $product->id);
        }

        $product->update($validated);
        $product->load('category');

        return $this->successResponse(
            $this->formatProduct($product),
            'Product updated successfully'
        );
    }

    /**
     * Soft-delete a product.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return $this->successResponse(null, 'Product deleted successfully');
    }

    /**
     * Toggle the is_active flag of a product.
     */
    public function toggleStatus(Product $product)
    {
        $product->update(['is_active' => !$product->is_active]);
        $product->load('category');

        $status  = $product->is_active ? 'activated' : 'deactivated';
        $message = "Product {$status} successfully";

        return $this->successResponse($this->formatProduct($product), $message);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Generate a unique slug, excluding the given product id (for updates).
     */
    private function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $base  = Str::slug($name);
        $slug  = $base;
        $count = 2;

        while (true) {
            $query = Product::where('slug', $slug)->withTrashed();

            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            if (!$query->exists()) {
                break;
            }

            $slug = "{$base}-{$count}";
            $count++;
        }

        return $slug;
    }

    /**
     * Format a product for API responses.
     */
    private function formatProduct(Product $product): array
    {
        return [
            'id'          => $product->id,
            'name'        => $product->name,
            'slug'        => $product->slug,
            'description' => $product->description,
            'base_price'  => $product->base_price,
            'stock'       => $product->stock,
            'unit'        => $product->unit,
            'tag'         => $product->tag,
            'main_image'  => $product->main_image,
            'is_active'   => $product->is_active,
            'category'    => $product->category ? [
                'id'   => $product->category->id,
                'name' => $product->category->name,
            ] : null,
            'created_at'  => $product->created_at,
        ];
    }
}
