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

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sq) use ($q) {
                $sq->where('order_number', 'like', "%$q%")
                   ->orWhere('recipient_name', 'like', "%$q%");
            });
        }

        $perPage = min((int) $request->get('per_page', 15), 50);
        $orders  = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'orders'     => collect($orders->items())->map(fn($o) => $this->formatOrder($o)),
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

    /**
     * Admin only changes ORDER STATUS (logistics flow).
     * Payment status is handled automatically.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,completed,cancelled',
        ]);

        $newStatus = $request->status;

        if ($newStatus === 'cancelled' && $order->status !== 'cancelled') {
            // Restore stock
            $order->load('items.product');
            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('stock', $item->quantity);
                }
            }
            $order->update(['status' => 'cancelled', 'payment_status' => 'failed']);
            if ($order->payment) {
                $order->payment->update(['status' => 'failed']);
            }
        } else {
            $order->update(['status' => $newStatus]);
        }

        $order->load(['user', 'payment', 'items']);
        return $this->successResponse($this->formatOrder($order), 'Status pesanan diperbarui');
    }

    /**
     * Admin confirms that payment proof has been verified.
     * Payment status advances automatically based on payment_type.
     */
    public function confirmPayment(Order $order)
    {
        if ($order->payment_status === 'paid') {
            return $this->errorResponse('Pembayaran sudah lunas.', 400);
        }

        // Determine next payment status
        if ($order->payment_type === 'dp' && $order->payment_status === 'pending') {
            // First payment = DP
            $order->update(['payment_status' => 'dp_paid', 'status' => 'processing']);
            if ($order->payment) {
                $order->payment->update(['status' => 'success', 'paid_at' => now()]);
            }
            $msg = 'DP dikonfirmasi. Pesanan mulai diproses.';
        } elseif ($order->payment_status === 'dp_paid') {
            // Second payment = remaining
            $order->update(['payment_status' => 'paid']);
            $msg = 'Pelunasan dikonfirmasi. Pesanan lunas.';
        } else {
            // Full payment
            $order->update(['payment_status' => 'paid', 'status' => 'processing']);
            if ($order->payment) {
                $order->payment->update(['status' => 'success', 'paid_at' => now()]);
            }
            $msg = 'Pembayaran penuh dikonfirmasi.';
        }

        $order->load(['user', 'payment', 'items']);
        return $this->successResponse($this->formatOrder($order), $msg);
    }

    private function formatOrder(Order $order): array
    {
        return [
            'id'             => $order->id,
            'order_number'   => $order->order_number,
            'status'         => $order->status,
            'payment_status' => $order->payment_status,
            'payment_type'   => $order->payment_type ?? 'full',
            'dp_amount'      => $order->dp_amount,
            'remaining_amount'=> $order->remaining_amount,
            'recipient_name' => $order->recipient_name,
            'recipient_phone'=> $order->recipient_phone,
            'total'          => $order->total,
            'items_count'    => $order->items?->count() ?? 0,
            'created_at'     => $order->created_at,
            'user'           => $order->user ? [
                'id' => $order->user->id, 'name' => $order->user->name, 'email' => $order->user->email,
            ] : null,
            'payment' => $order->payment ? [
                'status' => $order->payment->status, 'amount' => $order->payment->amount,
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
                'product_name' => $i->product_name, 'product_size' => $i->product_size,
                'quantity'     => $i->quantity, 'price' => $i->price, 'subtotal' => $i->subtotal,
            ]),
        ]);
    }
}
