<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    use ApiResponse;

    /**
     * Daftar review yang sudah diapprove (public)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::approved()
            ->with(['user:id,name', 'product:id,name,main_image']);

        // Filter by product_id
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        // Sort: latest (default), highest, lowest
        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'highest' => $query->orderByDesc('rating'),
            'lowest'  => $query->orderBy('rating'),
            default   => $query->orderByDesc('created_at'),
        };

        $perPage = min((int) $request->get('per_page', 6), 50);
        $reviews = $query->paginate($perPage);

        // Hitung statistik rating
        $stats = Review::approved()->selectRaw('
            COUNT(*) as total,
            ROUND(AVG(rating), 1) as average,
            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as star5,
            SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as star4,
            SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as star3,
            SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as star2,
            SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as star1
        ')->first();

        return response()->json([
            'success' => true,
            'message' => 'Reviews retrieved successfully',
            'data' => [
                'items' => $reviews->map(function ($r) {
                    return [
                        'id'          => $r->id,
                        'rating'      => $r->rating,
                        'comment'     => $r->comment,
                        'created_at'  => $r->created_at->diffForHumans(),
                        'user'        => [
                            'name' => $r->user->name,
                        ],
                        'product'     => [
                            'id'         => $r->product->id,
                            'name'       => $r->product->name,
                            'main_image' => $r->product->main_image,
                        ],
                    ];
                }),
                'pagination' => [
                    'total'        => $reviews->total(),
                    'per_page'     => $reviews->perPage(),
                    'current_page' => $reviews->currentPage(),
                    'last_page'    => $reviews->lastPage(),
                ],
                'stats' => [
                    'total'   => (int) ($stats->total ?? 0),
                    'average' => (float) ($stats->average ?? 0),
                    'star5'   => (int) ($stats->star5 ?? 0),
                    'star4'   => (int) ($stats->star4 ?? 0),
                    'star3'   => (int) ($stats->star3 ?? 0),
                    'star2'   => (int) ($stats->star2 ?? 0),
                    'star1'   => (int) ($stats->star1 ?? 0),
                ],
            ],
        ]);
    }

    /**
     * Simpan review baru (harus login & order completed)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'order_id'   => 'required|integer|exists:orders,id',
            'product_id' => 'required|integer|exists:products,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'required|string|min:10|max:1000',
        ]);

        $user = Auth::user();

        // Pastikan order milik user ini dan statusnya completed
        $order = Order::where('id', $request->order_id)
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->first();

        if (!$order) {
            return $this->errorResponse(
                'Order tidak ditemukan atau belum selesai. Anda hanya dapat memberikan ulasan setelah pesanan selesai.',
                403
            );
        }

        // Pastikan produk ada di order ini
        $hasProduct = $order->items()->where('product_id', $request->product_id)->exists();
        if (!$hasProduct) {
            return $this->errorResponse('Produk ini tidak ada di pesanan tersebut.', 403);
        }

        // Cek apakah sudah pernah review produk ini di order yang sama
        $existing = Review::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->where('order_id', $request->order_id)
            ->first();

        if ($existing) {
            return $this->errorResponse('Anda sudah memberikan ulasan untuk produk ini.', 409);
        }

        $review = Review::create([
            'user_id'     => $user->id,
            'product_id'  => $request->product_id,
            'order_id'    => $request->order_id,
            'rating'      => $request->rating,
            'comment'     => $request->comment,
            'is_approved' => true, // Auto-approve, admin bisa ubah nanti
        ]);

        return $this->successResponse([
            'id'      => $review->id,
            'rating'  => $review->rating,
            'comment' => $review->comment,
        ], 'Ulasan berhasil disimpan. Terima kasih!', 201);
    }

    /**
     * Cek produk mana dari order yang belum di-review (untuk form)
     */
    public function reviewableProducts(int $orderId): JsonResponse
    {
        $user = Auth::user();

        $order = Order::where('id', $orderId)
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->with('items.product')
            ->first();

        if (!$order) {
            return $this->errorResponse('Order tidak ditemukan atau belum selesai.', 404);
        }

        // ID produk yang sudah di-review di order ini
        $reviewedProductIds = Review::where('user_id', $user->id)
            ->where('order_id', $orderId)
            ->pluck('product_id')
            ->toArray();

        $products = $order->items->map(function ($item) use ($reviewedProductIds) {
            return [
                'product_id'    => $item->product_id,
                'product_name'  => $item->product_name,
                'main_image'    => $item->product?->main_image,
                'is_reviewed'   => in_array($item->product_id, $reviewedProductIds),
            ];
        })->unique('product_id')->values();

        return $this->successResponse([
            'order_id'        => $order->id,
            'order_number'    => $order->order_number,
            'products'        => $products,
        ], 'Reviewable products retrieved');
    }

    /**
     * Daftar order completed user yang bisa di-review
     */
    public function myReviewableOrders(): JsonResponse
    {
        $user = Auth::user();

        $orders = Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->with('items.product')
            ->orderByDesc('created_at')
            ->get();

        $result = $orders->map(function ($order) use ($user) {
            $reviewedProductIds = Review::where('user_id', $user->id)
                ->where('order_id', $order->id)
                ->pluck('product_id')
                ->toArray();

            $products = $order->items->map(function ($item) use ($reviewedProductIds) {
                return [
                    'product_id'   => $item->product_id,
                    'product_name' => $item->product_name,
                    'main_image'   => $item->product?->main_image,
                    'is_reviewed'  => in_array($item->product_id, $reviewedProductIds),
                ];
            })->unique('product_id')->values();

            $allReviewed = $products->every(fn($p) => $p['is_reviewed']);

            return [
                'order_id'      => $order->id,
                'order_number'  => $order->order_number,
                'created_at'    => $order->created_at->format('d M Y'),
                'all_reviewed'  => $allReviewed,
                'products'      => $products,
            ];
        })->filter(fn($o) => !$o['all_reviewed'])->values(); // Hanya tampilkan yang masih ada yg belum di-review

        return $this->successResponse($result, 'Reviewable orders retrieved');
    }
}
