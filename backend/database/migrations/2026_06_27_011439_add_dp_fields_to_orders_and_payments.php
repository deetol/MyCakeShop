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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('dp_amount', 10, 2)->nullable()->after('total');
            $table->decimal('remaining_amount', 10, 2)->nullable()->after('dp_amount');
            $table->string('payment_type', 20)->default('full')->after('remaining_amount');
            $table->string('payment_status', 30)->default('pending')->change();
        });
 
        Schema::table('payments', function (Blueprint $table) {
            $table->string('payment_type', 20)->default('full')->after('amount');
        });
    }
 
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['dp_amount', 'remaining_amount', 'payment_type']);
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending')->change();
        });
 
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('payment_type');
        });
    }
};
