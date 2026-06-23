<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'type',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Scope untuk hanya metode pembayaran yang aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get orders yang menggunakan payment method ini
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get payments yang menggunakan payment method ini
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
