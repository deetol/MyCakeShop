<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CreateOrderRequest;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderResource;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\ShippingMethod;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    use ApiResponse;

    /**
     * List user orders with pagination
     */
    public function index(): JsonResponse
    {
        $orders = Auth::user()->orders()
            ->with(['shippingMethod', 'paymentMethod', 'payment'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return $this->paginatedResponse($orders->through(fn($order) => new OrderResource($order)), 'Orders retrieved successfully');
    }

    /**
     * Get order detail by UUID
     */
    public function show(string $uuid): JsonResponse
    {
        $order = Order::where('uuid', $uuid)
            ->where('user_id', Auth::id())
            ->with(['items', 'shippingMethod', 'paymentMethod', 'payment'])
            ->first();

        if (!$order) {
            return $this->errorResponse('Order not found', 404);
        }

        return $this->successResponse(
            new OrderDetailResource($order),
            'Order retrieved successfully'
        );
    }

    /**
     * Create new order from cart
     */
    public function store(CreateOrderRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Get cart items
            $cartItems = Auth::user()->cartItems()->with(['product', 'productSize'])->get();

            if ($cartItems->isEmpty()) {
                return $this->errorResponse('Cart is empty', 400);
            }

            // Get address
            $address = Address::where('id', $request->address_id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$address) {
                return $this->errorResponse('Address not found', 404);
            }

            // Get shipping and payment methods
            $shippingMethod = ShippingMethod::find($request->shipping_method_id);
            $paymentMethod = PaymentMethod::find($request->payment_method_id);

            // Calculate totals
            $subtotal = $cartItems->sum(function ($item) {
                $price = $item->productSize ? $item->productSize->price : $item->product->base_price;
                return $price * $item->quantity;
            });

            $shippingCost = $shippingMethod->cost;
            $tax = ($subtotal + $shippingCost) * 0.11; // 11% PPN
            $total = $subtotal + $shippingCost + $tax;

            // Create order with UUID and order number
            $order = Order::create([
                'uuid' => Str::uuid(),
                'order_number' => $this->generateOrderNumber(),
                'user_id' => Auth::id(),
                'address_id' => $address->id,
                'shipping_method_id' => $shippingMethod->id,
                'payment_method_id' => $paymentMethod->id,
                'status' => 'pending',
                'payment_status' => 'pending',
                
                // Address snapshot
                'recipient_name' => $address->recipient_name,
                'recipient_phone' => $address->phone,
                'shipping_address' => $address->address_line,
                'city' => $address->city,
                'province' => $address->province,
                'postal_code' => $address->postal_code,
                
                // Pricing
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'tax' => $tax,
                'total' => $total,
                'notes' => $request->notes,
            ]);

            // Create order items (snapshot product info)
            foreach ($cartItems as $cartItem) {
                $price = $cartItem->productSize ? $cartItem->productSize->price : $cartItem->product->base_price;
                $sizeName = $cartItem->productSize ? $cartItem->productSize->size_name : null;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'product_name' => $cartItem->product->name,
                    'product_size' => $sizeName,
                    'quantity' => $cartItem->quantity,
                    'price' => $price,
                    'subtotal' => $price * $cartItem->quantity,
                ]);
            }

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method_id' => $paymentMethod->id,
                'amount' => $total,
                'status' => 'pending',
            ]);

            // Clear cart
            Auth::user()->cartItems()->delete();

            DB::commit();

            // Load relationships for response
            $order->load(['items', 'shippingMethod', 'paymentMethod', 'payment']);

            return $this->successResponse(
                new OrderDetailResource($order),
                'Order created successfully',
                201
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to create order: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancel order
     */
    public function cancel(string $uuid): JsonResponse
    {
        $order = Order::where('uuid', $uuid)
            ->where('user_id', Auth::id())
            ->first();

        if (!$order) {
            return $this->errorResponse('Order not found', 404);
        }

        if (!$order->canBeCancelled()) {
            return $this->errorResponse('Order cannot be cancelled', 400);
        }

        $order->update(['status' => 'cancelled']);

        return $this->successResponse(
            new OrderResource($order),
            'Order cancelled successfully'
        );
    }

    /**
     * Generate unique order number
     */
    private function generateOrderNumber(): string
    {
        $year = date('Y');
        $lastOrder = Order::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastOrder ? (int) substr($lastOrder->order_number, -4) + 1 : 1;
        
        return 'ORD-' . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
