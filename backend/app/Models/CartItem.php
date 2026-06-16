<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'product_size_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    /**
     * Get the user that owns the cart item
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the product size (optional)
     */
    public function productSize(): BelongsTo
    {
        return $this->belongsTo(ProductSize::class);
    }

    /**
     * Calculate the price for this cart item
     */
    public function getPrice()
    {
        if ($this->productSize) {
            return $this->productSize->price;
        }
        return $this->product->base_price;
    }

    /**
     * Calculate the subtotal for this cart item
     */
    public function getSubtotal()
    {
        return $this->getPrice() * $this->quantity;
    }
}
