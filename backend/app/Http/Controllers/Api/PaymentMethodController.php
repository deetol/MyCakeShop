<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PaymentMethodController extends Controller
{
    use ApiResponse;

    /**
     * Get all active payment methods
     */
    public function index(): JsonResponse
    {
        $paymentMethods = PaymentMethod::where('is_active', true)
            ->orderBy('type', 'asc')
            ->get();

        return $this->successResponse(
            $paymentMethods,
            'Payment methods retrieved successfully'
        );
    }
}
