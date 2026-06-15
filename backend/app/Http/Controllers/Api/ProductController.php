<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponse;

    /**
     * Get all products with filters
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'sizes'])
            ->active();

        // Filter by category
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // Search by name or description
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        // Filter by tag
        if ($request->has('tag')) {
            $query->byTag($request->tag);
        }

        // Sorting
        $sort = $request->get('sort', 'recommended');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('base_price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('base_price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'recommended':
            default:
                // Order by tag priority then by created_at
                $query->orderByRaw("
                    CASE 
                        WHEN tag = 'Favorit' THEN 1
                        WHEN tag = 'Terlaris' THEN 2
                        WHEN tag = 'Baru' THEN 3
                        ELSE 4
                    END
                ")->orderBy('created_at', 'desc');
                break;
        }

        // Pagination
        $perPage = min( (int) $request->get('per_page', 12), 50);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Products retrieved successfully',
            'data' => [
                'products' => ProductResource::collection($products->items()),
                'pagination' => [
                    'total' => $products->total(),
                    'per_page' => $products->perPage(),
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'from' => $products->firstItem(),
                    'to' => $products->lastItem(),
                ],
            ],
        ]);
    }

    /**
     * Get product detail by ID
     */
    public function show(string $slug)
    {
        $product = Product::with(['category', 'sizes', 'images'])
            ->active()
            ->where('slug', $slug)
            ->first();

        if (!$product) {
            return $this->errorResponse('Product not found', 404);
        }

        return $this->successResponse(
            new ProductDetailResource($product),
            'Product detail retrieved successfully'
        );
    }
}
