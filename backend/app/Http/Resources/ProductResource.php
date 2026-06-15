<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'base_price' => (float) $this->base_price,
            'stock' => $this->stock,
            'unit' => $this->unit,
            'tag' => $this->tag,
            'main_image' => $this->main_image,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'sizes' => $this->whenLoaded('sizes', function () {
                return $this->sizes->map(function ($size) {
                    return [
                        'id' => $size->id,
                        'size_name' => $size->size_name,
                        'price' => (float) $size->price,
                    ];
                });
            }),
        ];
    }
}
