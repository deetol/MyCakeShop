<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            
            // Shipping address snapshot
            'recipient_name' => $this->recipient_name,
            'recipient_phone' => $this->recipient_phone,
            'shipping_address' => $this->shipping_address,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            
            // Pricing
            'subtotal' => $this->subtotal,
            'shipping_cost' => $this->shipping_cost,
            'tax' => $this->tax,
            'total' => $this->total,
            'dp_amount' => $this->dp_amount,
            'remaining_amount' => $this->remaining_amount,
            'payment_type' => $this->payment_type,
            'notes' => $this->notes,
            
            // Relationships
            'shipping_method' => [
                'id' => $this->shippingMethod->id,
                'name' => $this->shippingMethod->name,
                'cost' => $this->shippingMethod->cost,
            ],
            'payment_method' => [
                'id' => $this->paymentMethod->id,
                'name' => $this->paymentMethod->name,
                'type' => $this->paymentMethod->type,
            ],
            'items' => $this->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_size' => $item->product_size,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'subtotal' => $item->subtotal,
                ];
            }),
            'payment' => $this->when($this->payment, function () {
                return [
                    'id' => $this->payment->id,
                    'status' => $this->payment->status,
                    'amount' => $this->payment->amount,
                    'payment_proof' => $this->payment->payment_proof,
                    'paid_at' => $this->payment->paid_at?->toISOString(),
                ];
            }),
            
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
