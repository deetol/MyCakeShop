<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ShippingMethodController extends Controller
{
    use ApiResponse;

    /**
     * Get all active shipping methods
     */
    public function index(): JsonResponse
    {
        $shippingMethods = ShippingMethod::where('is_active', true)
            ->orderBy('cost', 'asc')
            ->get();

        return $this->successResponse(
            $shippingMethods,
            'Shipping methods retrieved successfully'
        );
    }
}
