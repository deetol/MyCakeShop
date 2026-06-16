<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
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
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'main_image' => $this->product->main_image,
                'stock' => $this->product->stock,
            ],
            'size' => $this->productSize ? [
                'id' => $this->productSize->id,
                'size_name' => $this->productSize->size_name,
                'price' => (float) $this->productSize->price,
            ] : null,
            'quantity' => $this->quantity,
            'price' => (float) $this->getPrice(),
            'subtotal' => (float) $this->getSubtotal(),
        ];
    }
}
