<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'payment_method_id',
        'amount',
        'status',
        'payment_proof',
        'paid_at',
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
     * Handle payment confirmed - update order dan decrement stock
     */
    protected function handlePaymentConfirmed()
    {
        $order = $this->order;
        
        if (!$order) return;

        // Update order payment_status
        $order->update([
            'payment_status' => 'paid',
            'status' => 'processing', // Auto change status to processing
        ]);

        // Decrement stock for each order item
        foreach ($order->items as $item) {
            $product = $item->product;
            
            if ($product) {
                $newStock = $product->stock - $item->quantity;
                
                if ($newStock < 0) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }
                
                $product->update(['stock' => $newStock]);
            }
        }

        // Set paid_at timestamp
        $this->paid_at = now();
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
