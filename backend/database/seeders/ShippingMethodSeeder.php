<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shippingMethods = [
            [
                'name' => 'Kurir Instan',
                'description' => 'Pengiriman cepat dalam kota',
                'cost' => 25000,
                'estimated_time' => 'Maks 3 jam',
                'is_active' => true,
            ],
            [
                'name' => 'Kurir Sameday',
                'description' => 'Pengiriman hari yang sama',
                'cost' => 15000,
                'estimated_time' => 'Hari yang sama',
                'is_active' => true,
            ],
            [
                'name' => 'Kurir Reguler',
                'description' => 'Pengiriman reguler 1-2 hari',
                'cost' => 7000,
                'estimated_time' => '1-2 hari',
                'is_active' => true,
            ],
        ];

        foreach ($shippingMethods as $method) {
            ShippingMethod::create($method);
        }
    }
}
