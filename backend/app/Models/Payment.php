<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id', 'payment_method_id',
        'amount', 'payment_type',
        'status', 'payment_proof', 'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    /**
     * Boot method - handle stock decrement when payment confirmed
     */
    protected static function boot()
    {
        parent::boot();

        static::updating(function ($payment) {
            // Check if payment status changed to 'success'
            if ($payment->isDirty('status') && $payment->status === 'success') {
                $payment->handlePaymentConfirmed();
            }
        });
    }

    /**
     * Handle payment confirmed - update order status only
     * Stock already decremented when order was placed
     */
    protected function handlePaymentConfirmed()
    {
        $order = $this->order;
        if (!$order) return;

        if ($this->payment_type === 'dp') {
            $order->update([
                'payment_status' => 'dp_paid',
                'status' => 'processing',
            ]);
        } else {
            // full payment or remaining payment
            $order->update([
                'payment_status' => 'paid',
                'status' => 'processing',
            ]);
        }
    }

    /**
     * Restore stock when order is cancelled
     */
    public static function restoreStockForOrder($order)
    {
        foreach ($order->items as $item) {
            if ($item->product) {
                $item->product->increment('stock', $item->quantity);
            }
        }
    }

    /**
     * Relationships
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
