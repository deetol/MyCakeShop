<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paymentMethods = [
            [
                'name' => 'Transfer BCA',
                'type' => 'bank_transfer',
                'icon' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Transfer Mandiri',
                'type' => 'bank_transfer',
                'icon' => null,
                'is_active' => true,
            ],
            [
                'name' => 'GoPay',
                'type' => 'ewallet',
                'icon' => null,
                'is_active' => true,
            ],
            [
                'name' => 'OVO',
                'type' => 'ewallet',
                'icon' => null,
                'is_active' => true,
            ],
            [
                'name' => 'QRIS',
                'type' => 'qris',
                'icon' => null,
                'is_active' => true,
            ],
        ];

        foreach ($paymentMethods as $method) {
            PaymentMethod::create($method);
        }
    }
}
