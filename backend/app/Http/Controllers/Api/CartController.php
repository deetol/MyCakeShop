<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use App\Models\Product;
use App\Traits\ApiResponse;
use App\Models\ProductSize;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use ApiResponse;

    /**
     * Get user's cart
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $cartItems = CartItem::with(['product', 'productSize'])
            ->where('user_id', $user->id)
            ->get();

        // Calculate cart summary
        $subtotal = $cartItems->sum(function ($item) {
            return $item->getSubtotal();
        });

        $packagingFee = 5000; // Fixed packaging fee
        $taxRate = 0.11; // 11% tax
        $tax = ($subtotal + $packagingFee) * $taxRate;
        $total = $subtotal + $packagingFee + $tax;

        return $this->successResponse([
            'items' => CartItemResource::collection($cartItems),
            'summary' => [
                'subtotal' => (float) $subtotal,
                'packaging_fee' => (float) $packagingFee,
                'tax' => (float) round($tax, 2),
                'total' => (float) round($total, 2),
            ],
        ], 'Cart retrieved successfully');
    }

    /**
     * Add item to cart
     */
    public function store(AddToCartRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        // Check if product exists and is active
        $product = Product::active()->find($validated['product_id']);
        if (!$product) {
            return $this->errorResponse('Product not found or inactive', 404);
        }

        if (!empty($validated['product_size_id'])) {

        $sizeExists = ProductSize::where('id', $validated['product_size_id'])
            ->where('product_id', $validated['product_id'])
            ->exists();

            if (!$sizeExists) {
                return $this->errorResponse(
                    'Invalid product size',
                    422
                );
            }
        }
        // Check stock availability
        if ($product->stock < $validated['quantity']) {
            return $this->errorResponse('Insufficient stock. Available: ' . $product->stock, 400);
        }

        // Check if item already exists in cart
        $cartItem = CartItem::where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->where('product_size_id', $validated['product_size_id'] ?? null)
            ->first();

        if ($cartItem) {
            // Update quantity if already exists
            $newQuantity = $cartItem->quantity + $validated['quantity'];
            
            // Check stock for new quantity
            if ($product->stock < $newQuantity) {
                return $this->errorResponse('Insufficient stock. Available: ' . $product->stock, 400);
            }

            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            // Create new cart item
            $cartItem = CartItem::create([
                'user_id' => $user->id,
                'product_id' => $validated['product_id'],
                'product_size_id' => $validated['product_size_id'] ?? null,
                'quantity' => $validated['quantity'],
            ]);
        }

        $cartItem->load(['product', 'productSize']);

        return $this->successResponse(
            new CartItemResource($cartItem),
            'Item added to cart successfully',
            201
        );
    }

    /**
     * Update cart item quantity
     */
    public function update(UpdateCartItemRequest $request, $id)
    {
        $user = $request->user();
        $validated = $request->validated();

        // Find cart item
        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$cartItem) {
            return $this->errorResponse('Cart item not found', 404);
        }

        // Check stock availability
        $product = $cartItem->product;
        if ($product->stock < $validated['quantity']) {
            return $this->errorResponse('Insufficient stock. Available: ' . $product->stock, 400);
        }

        $cartItem->quantity = $validated['quantity'];
        $cartItem->save();

        $cartItem->load(['product', 'productSize']);

        return $this->successResponse(
            new CartItemResource($cartItem),
            'Cart item updated successfully'
        );
    }

    /**
     * Remove item from cart
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$cartItem) {
            return $this->errorResponse('Cart item not found', 404);
        }

        $cartItem->delete();

        return $this->successResponse(null, 'Item removed from cart successfully');
    }

    /**
     * Clear entire cart
     */
    public function clear(Request $request)
    {
        $user = $request->user();

        CartItem::where('user_id', $user->id)->delete();

        return $this->successResponse(null, 'Cart cleared successfully');
    }
}
