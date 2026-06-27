<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'uuid', 'order_number', 'user_id', 'address_id',
        'shipping_method_id', 'payment_method_id',
        'status', 'payment_status',
        'recipient_name', 'recipient_phone',
        'shipping_address', 'city', 'province', 'postal_code',
        'subtotal', 'shipping_cost', 'tax', 'total',
        'dp_amount', 'remaining_amount', 'payment_type',
        'notes',
    ];

    protected $casts = [
        'subtotal'         => 'decimal:2',
        'shipping_cost'    => 'decimal:2',
        'tax'              => 'decimal:2',
        'total'            => 'decimal:2',
        'dp_amount'        => 'decimal:2',
        'remaining_amount' => 'decimal:2',
    ];

    /**
     * Boot method - auto generate UUID dan order number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->uuid)) {
                $order->uuid = (string) Str::uuid();
            }
            
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }
        });
    }

    /**
     * Generate unique order number
     */
    protected static function generateOrderNumber()
    {
        $year = date('Y');
        $lastOrder = static::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastOrder ? (int) substr($lastOrder->order_number, -4) + 1 : 1;
        
        return 'ORD-' . $year . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Scope untuk filter by status
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk filter by payment status
     */
    public function scopeWithPaymentStatus($query, $paymentStatus)
    {
        return $query->where('payment_status', $paymentStatus);
    }

    /**
     * Check if order dapat di-cancel
     */
    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'processing']) 
            && $this->payment_status !== 'paid';
    }
}
