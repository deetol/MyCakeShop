<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    use ApiResponse;

    /**
     * Create remaining payment record (for DP orders)
     */
    public function createRemainingPayment(Order $order): JsonResponse
    {
        // Check ownership
        if ($order->user_id !== Auth::id()) {
            return $this->errorResponse('Unauthorized', 403);
        }

        // Only for DP orders that have paid DP
        if ($order->payment_type !== 'dp') {
            return $this->errorResponse('Pesanan ini bukan sistem DP', 400);
        }

        if ($order->payment_status !== 'dp_paid') {
            return $this->errorResponse('DP belum dikonfirmasi oleh admin', 400);
        }

        // Check if remaining payment already exists
        $existingRemaining = Payment::where('order_id', $order->id)
            ->where('payment_type', 'remaining')
            ->first();

        if ($existingRemaining) {
            // Return existing
            return $this->successResponse([
                'payment_id' => $existingRemaining->id,
                'amount'     => $existingRemaining->amount,
                'status'     => $existingRemaining->status,
                'payment_proof' => $existingRemaining->payment_proof,
            ], 'Tagihan pelunasan sudah ada');
        }

        // Create remaining payment record
        $remaining = Payment::create([
            'order_id'          => $order->id,
            'payment_method_id' => $order->payment_method_id,
            'amount'            => $order->remaining_amount,
            'payment_type'      => 'remaining',
            'status'            => 'pending',
        ]);

        return $this->successResponse([
            'payment_id' => $remaining->id,
            'amount'     => $remaining->amount,
            'status'     => $remaining->status,
        ], 'Tagihan pelunasan berhasil dibuat', 201);
    }

    /**
     * Upload payment proof (for bank transfer)
     */
    public function uploadProof(Request $request, Payment $payment): JsonResponse
    {
        // Check ownership
        if ($payment->order->user_id !== Auth::id()) {
            return $this->errorResponse('Unauthorized', 403);
        }

        // Validate payment status
        if ($payment->status !== 'pending') {
            return $this->errorResponse('Payment already processed', 400);
        }

        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        try {
            $path = $request->file('payment_proof')->store('payment-proofs', 'public');
            $payment->update([
                'payment_proof' => $path,
                'status'        => 'processing',
            ]);

            return $this->successResponse(
                new PaymentResource($payment->fresh(['paymentMethod'])),
                'Payment proof uploaded successfully'
            );

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to upload payment proof: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Confirm payment (Admin only)
     * This will trigger stock decrement via Payment model boot method
     */
    public function confirm(Payment $payment): JsonResponse
    {
        // Validate payment status
        if ($payment->status === 'success') {
            return $this->errorResponse('Payment already confirmed', 400);
        }

        try {
            // Update payment to success
            // This will trigger Payment model boot method which:
            // 1. Updates order payment_status to 'paid'
            // 2. Updates order status to 'processing'
            // 3. Decrements product stock
            $payment->update([
                'status' => 'success',
                'paid_at' => now(),
            ]);

            return $this->successResponse(
                new PaymentResource($payment->fresh(['paymentMethod'])),
                'Payment confirmed successfully. Stock has been decremented.'
            );

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to confirm payment: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Reject payment (Admin only)
     */
    public function reject(Payment $payment): JsonResponse
    {
        if ($payment->status === 'success') {
            return $this->errorResponse('Cannot reject confirmed payment', 400);
        }

        $payment->update([
            'status' => 'failed',
        ]);

        // Also update order payment status
        $payment->order->update([
            'payment_status' => 'failed',
        ]);

        return $this->successResponse(
            new PaymentResource($payment->fresh(['paymentMethod'])),
            'Payment rejected'
        );
    }
}
