<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
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
            // Store payment proof
            $path = $request->file('payment_proof')->store('payment-proofs', 'public');

            // Update payment
            $payment->update([
                'payment_proof' => $path,
                'status' => 'processing',
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
