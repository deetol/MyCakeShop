<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('order_number', 50)->unique(); // e.g., 'ORD-2026-0001'
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->foreignId('address_id')->constrained()->onDelete('restrict');
            $table->foreignId('shipping_method_id')->constrained()->onDelete('restrict');
            $table->foreignId('payment_method_id')->constrained()->onDelete('restrict');
            
            // Order Status
            $table->enum('status', ['pending', 'processing', 'shipped', 'completed', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            
            // Shipping Address Snapshot (tidak pakai FK, snapshot saat checkout)
            $table->string('recipient_name');
            $table->string('recipient_phone', 20);
            $table->text('shipping_address');
            $table->string('city', 100);
            $table->string('province', 100);
            $table->string('postal_code', 10);
            
            // Pricing
            $table->decimal('subtotal', 10, 2);
            $table->decimal('shipping_cost', 10, 2);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('uuid');
            $table->index('order_number');
            $table->index('status');
            $table->index('payment_status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
