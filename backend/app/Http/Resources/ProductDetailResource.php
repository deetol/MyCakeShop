<?php

namespace App\Http\Resources;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Ambil 5 ulasan terbaru untuk preview di halaman detail
        $reviews = Review::where('product_id', $this->id)
            ->where('is_approved', true)
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($r) => [
                'id'         => $r->id,
                'rating'     => $r->rating,
                'comment'    => $r->comment,
                'created_at' => $r->created_at->diffForHumans(),
                'user'       => ['name' => $r->user->name],
            ]);

        // Hitung distribusi bintang
        $ratingDistribution = Review::where('product_id', $this->id)
            ->where('is_approved', true)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'base_price'  => (float) $this->base_price,
            'stock'       => $this->stock,
            'unit'        => $this->unit,
            'tag'         => $this->tag,
            'main_image'  => $this->main_image,
            'ingredients' => $this->ingredients,
            'allergens'   => $this->allergens,
            'is_active'   => $this->is_active,
            'rating_avg'  => $this->rating_avg ? round((float) $this->rating_avg, 1) : null,
            'review_count'=> (int) ($this->review_count ?? 0),
            'rating_distribution' => [
                5 => (int) ($ratingDistribution[5] ?? 0),
                4 => (int) ($ratingDistribution[4] ?? 0),
                3 => (int) ($ratingDistribution[3] ?? 0),
                2 => (int) ($ratingDistribution[2] ?? 0),
                1 => (int) ($ratingDistribution[1] ?? 0),
            ],
            'recent_reviews' => $reviews,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'sizes' => $this->whenLoaded('sizes', function () {
                return $this->sizes->map(fn($size) => [
                    'id'        => $size->id,
                    'size_name' => $size->size_name,
                    'price'     => (float) $size->price,
                ]);
            }),
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(fn($image) => [
                    'id'        => $image->id,
                    'image_url' => $image->image_url,
                    'order'     => $image->order,
                ]);
            }),
        ];
    }
}
