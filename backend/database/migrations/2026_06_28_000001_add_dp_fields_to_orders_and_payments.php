<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('dp_amount', 10, 2)->nullable()->after('total');
            $table->decimal('remaining_amount', 10, 2)->nullable()->after('dp_amount');
            $table->enum('payment_type', ['full', 'dp'])->default('full')->after('remaining_amount');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->enum('payment_type', ['dp', 'remaining', 'full'])->default('full')->after('amount');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['dp_amount', 'remaining_amount', 'payment_type']);
        });
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('payment_type');
        });
    }
};
