<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'uuid'             => $this->uuid,
            'order_number'     => $this->order_number,
            'status'           => $this->status,
            'payment_status'   => $this->payment_status,

            // Address snapshot
            'recipient_name'   => $this->recipient_name,
            'recipient_phone'  => $this->recipient_phone,
            'shipping_address' => $this->shipping_address,
            'city'             => $this->city,
            'province'         => $this->province,
            'postal_code'      => $this->postal_code,

            // Pricing
            'subtotal'         => (float) $this->subtotal,
            'shipping_cost'    => (float) $this->shipping_cost,
            'tax'              => (float) $this->tax,
            'total'            => (float) $this->total,
            'dp_amount'        => $this->dp_amount ? (float) $this->dp_amount : null,
            'remaining_amount' => $this->remaining_amount ? (float) $this->remaining_amount : null,
            'payment_type'     => $this->payment_type ?? 'full',
            'notes'            => $this->notes,

            // Relations
            'shipping_method'  => $this->whenLoaded('shippingMethod', fn() => $this->shippingMethod?->name),
            'payment_method'   => $this->whenLoaded('paymentMethod', fn() => $this->paymentMethod?->name),
            'items'            => $this->whenLoaded('items', function () {
                return $this->items->map(fn($item) => [
                    'product_name'  => $item->product_name,
                    'product_size'  => $item->product_size,
                    'quantity'      => $item->quantity,
                    'price'         => (float) $item->price,
                    'subtotal'      => (float) $item->subtotal,
                    'product_image' => $item->product?->main_image,
                ]);
            }),
            'payment' => $this->whenLoaded('payment', function () {
                return $this->payment ? [
                    'status'   => $this->payment->status,
                    'amount'   => (float) $this->payment->amount,
                    'paid_at'  => $this->payment->paid_at?->toISOString(),
                ] : null;
            }),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
