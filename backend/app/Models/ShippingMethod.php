<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    protected $fillable = [
        'name',
        'description',
        'cost',
        'estimated_time',
        'is_active',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Scope untuk hanya metode pengiriman yang aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get orders yang menggunakan shipping method ini
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
