<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class OrderAdminController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Order::with(['user', 'payment', 'items'])
            ->orderBy('created_at', 'desc');

        // Filter by order status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Search by order number or recipient name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->get('per_page', 15), 50);
        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => collect($orders->items())->map(fn($o) => $this->formatOrder($o)),
                'pagination' => [
                    'total'        => $orders->total(),
                    'per_page'     => $orders->perPage(),
                    'current_page' => $orders->currentPage(),
                    'last_page'    => $orders->lastPage(),
                ],
            ],
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['user', 'payment', 'items', 'shippingMethod', 'paymentMethod']);
        return $this->successResponse($this->formatOrderDetail($order), 'Order retrieved');
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,completed,cancelled',
        ]);

        $order->update(['status' => $request->status]);
        $order->load(['user', 'payment', 'items']);

        return $this->successResponse($this->formatOrder($order), 'Status pesanan diperbarui');
    }

    public function updatePaymentStatus(Request $request, Order $order)
    {
        $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
        ]);

        $order->update(['payment_status' => $request->payment_status]);
        if ($order->payment) {
            $statusMap = [
                'paid' => 'success', 'failed' => 'failed',
                'refunded' => 'failed', 'pending' => 'pending',
            ];
            $order->payment->update(['status' => $statusMap[$request->payment_status] ?? 'pending']);
        }

        $order->load(['user', 'payment', 'items']);
        return $this->successResponse($this->formatOrder($order), 'Status pembayaran diperbarui');
    }

    private function formatOrder(Order $order): array
    {
        return [
            'id'             => $order->id,
            'order_number'   => $order->order_number,
            'status'         => $order->status,
            'payment_status' => $order->payment_status,
            'recipient_name' => $order->recipient_name,
            'recipient_phone'=> $order->recipient_phone,
            'total'          => $order->total,
            'items_count'    => $order->items?->count() ?? 0,
            'created_at'     => $order->created_at,
            'user'           => $order->user ? [
                'id' => $order->user->id, 'name' => $order->user->name,
                'email' => $order->user->email,
            ] : null,
            'payment'        => $order->payment ? [
                'status' => $order->payment->status,
                'amount' => $order->payment->amount,
            ] : null,
        ];
    }

    private function formatOrderDetail(Order $order): array
    {
        return array_merge($this->formatOrder($order), [
            'shipping_address' => $order->shipping_address,
            'city'             => $order->city,
            'province'         => $order->province,
            'postal_code'      => $order->postal_code,
            'subtotal'         => $order->subtotal,
            'shipping_cost'    => $order->shipping_cost,
            'tax'              => $order->tax,
            'notes'            => $order->notes,
            'shipping_method'  => $order->shippingMethod?->name,
            'payment_method'   => $order->paymentMethod?->name,
            'items'            => $order->items?->map(fn($i) => [
                'product_name' => $i->product_name,
                'product_size' => $i->product_size,
                'quantity'     => $i->quantity,
                'price'        => $i->price,
                'subtotal'     => $i->subtotal,
            ]),
        ]);
    }
}
