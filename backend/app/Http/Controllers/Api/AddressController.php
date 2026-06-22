<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Address\StoreAddressRequest;
use App\Http\Requests\Address\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of user addresses
     */
    public function index(): JsonResponse
    {
        $addresses = Auth::user()->addresses()
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse(
            AddressResource::collection($addresses),
            'Addresses retrieved successfully'
        );
    }

    /**
     * Store a newly created address
     */
    public function store(StoreAddressRequest $request): JsonResponse
    {
        $address = Auth::user()->addresses()->create($request->validated());

        return $this->successResponse(
            new AddressResource($address),
            'Address created successfully',
            201
        );
    }

    /**
     * Display the specified address
     */
    public function show(Address $address): JsonResponse
    {
        // Check ownership
        if ($address->user_id !== Auth::id()) {
            return $this->errorResponse('Unauthorized', 403);
        }

        return $this->successResponse(
            new AddressResource($address),
            'Address retrieved successfully'
        );
    }

    /**
     * Update the specified address
     */
    public function update(UpdateAddressRequest $request, Address $address): JsonResponse
    {
        // Check ownership
        if ($address->user_id !== Auth::id()) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $address->update($request->validated());

        return $this->successResponse(
            new AddressResource($address->fresh()),
            'Address updated successfully'
        );
    }

    /**
     * Remove the specified address
     */
    public function destroy(Address $address): JsonResponse
    {
        // Check ownership
        if ($address->user_id !== Auth::id()) {
            return $this->errorResponse('Unauthorized', 403);
        }

        // If this is the default address, set another address as default
        if ($address->is_default) {
            $nextAddress = Address::where('user_id', Auth::id())
                ->where('id', '!=', $address->id)
                ->first();

            if ($nextAddress) {
                $nextAddress->update(['is_default' => true]);
            }
        }

        $address->delete();

        return $this->successResponse(
            null,
            'Address deleted successfully'
        );
    }

    /**
     * Set address as default
     */
    public function setDefault(Address $address): JsonResponse
    {
        // Check ownership
        if ($address->user_id !== Auth::id()) {
            return $this->errorResponse('Unauthorized', 403);
        }

        // Update to default (model boot method will handle unsetting others)
        $address->update(['is_default' => true]);

        return $this->successResponse(
            new AddressResource($address->fresh()),
            'Default address set successfully'
        );
    }
}
