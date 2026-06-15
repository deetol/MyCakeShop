<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get categories
        $rotiManis = Category::where('slug', 'roti-manis')->first();
        $kueKering = Category::where('slug', 'kue-kering')->first();
        $jajananPasar = Category::where('slug', 'jajanan-pasar')->first();

        $products = [
            // Roti Manis
            [
                'category_id' => $rotiManis->id,
                'name' => 'Roti Sisir Mentega',
                'slug' => 'roti-sisir-mentega',
                'description' => 'Roti manis klasik dengan aroma mentega yang khas. Tekstur lembut sempurna untuk sarapan atau camilan.',
                'base_price' => 45000,
                'stock' => 50,
                'unit' => null,
                'tag' => 'Favorit',
                'main_image' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
                'ingredients' => ['Tepung terigu', 'Mentega', 'Susu', 'Gula', 'Telur'],
                'allergens' => ['Gluten', 'Susu', 'Telur'],
                'is_active' => true,
                'sizes' => [
                    ['size_name' => 'Reguler (10 Slice)', 'price' => 45000],
                    ['size_name' => 'Besar (20 Slice)', 'price' => 85000],
                ],
            ],
            [
                'category_id' => $rotiManis->id,
                'name' => 'Roti Cokelat',
                'slug' => 'roti-cokelat',
                'description' => 'Roti lembut dengan isian cokelat premium yang melimpah.',
                'base_price' => 35000,
                'stock' => 40,
                'unit' => '/ pcs',
                'tag' => 'Terlaris',
                'main_image' => 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400',
                'ingredients' => ['Tepung terigu', 'Cokelat', 'Susu', 'Gula', 'Telur'],
                'allergens' => ['Gluten', 'Susu', 'Telur'],
                'is_active' => true,
                'sizes' => [],
            ],
            [
                'category_id' => $rotiManis->id,
                'name' => 'Roti Keju',
                'slug' => 'roti-keju',
                'description' => 'Roti manis dengan taburan keju melimpah yang gurih.',
                'base_price' => 38000,
                'stock' => 35,
                'unit' => '/ pcs',
                'tag' => 'Baru',
                'main_image' => 'https://images.unsplash.com/photo-1612182062414-d4b9e2360a2b?w=400',
                'ingredients' => ['Tepung terigu', 'Keju', 'Susu', 'Gula', 'Telur'],
                'allergens' => ['Gluten', 'Susu', 'Telur'],
                'is_active' => true,
                'sizes' => [],
            ],

            // Kue Kering
            [
                'category_id' => $kueKering->id,
                'name' => 'Nastar Premium',
                'slug' => 'nastar-premium',
                'description' => 'Kue nastar klasik dengan isian selai nanas asli yang manis segar.',
                'base_price' => 65000,
                'stock' => 30,
                'unit' => '/ toples',
                'tag' => 'Favorit',
                'main_image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
                'ingredients' => ['Tepung terigu', 'Mentega', 'Nanas', 'Gula', 'Telur'],
                'allergens' => ['Gluten', 'Susu', 'Telur'],
                'is_active' => true,
                'sizes' => [
                    ['size_name' => 'Toples Kecil (250g)', 'price' => 65000],
                    ['size_name' => 'Toples Besar (500g)', 'price' => 120000],
                ],
            ],
            [
                'category_id' => $kueKering->id,
                'name' => 'Kastengel Keju',
                'slug' => 'kastengel-keju',
                'description' => 'Kue kering renyah dengan rasa keju yang kuat. Cocok untuk cemilan atau sajian tamu.',
                'base_price' => 70000,
                'stock' => 25,
                'unit' => '/ toples',
                'tag' => 'Terlaris',
                'main_image' => 'https://images.unsplash.com/photo-1599785209758-18f5c0a0c5c5?w=400',
                'ingredients' => ['Tepung terigu', 'Keju', 'Mentega', 'Telur'],
                'allergens' => ['Gluten', 'Susu', 'Telur'],
                'is_active' => true,
                'sizes' => [],
            ],
            [
                'category_id' => $kueKering->id,
                'name' => 'Putri Salju',
                'slug' => 'putri-salju',
                'description' => 'Kue kering lembut dengan taburan gula halus, lumer di mulut.',
                'base_price' => 60000,
                'stock' => 30,
                'unit' => '/ toples',
                'tag' => null,
                'main_image' => 'https://images.unsplash.com/photo-1486427944270-4b5b5e9e4a0d?w=400',
                'ingredients' => ['Tepung terigu', 'Mentega', 'Kacang mete', 'Gula halus'],
                'allergens' => ['Gluten', 'Susu', 'Kacang'],
                'is_active' => true,
                'sizes' => [],
            ],

            // Jajanan Pasar
            [
                'category_id' => $jajananPasar->id,
                'name' => 'Lemper Ayam',
                'slug' => 'lemper-ayam',
                'description' => 'Ketan gurih berisi ayam suwir berbumbu lengkap. Dibungkus daun pisang untuk aroma khas.',
                'base_price' => 25000,
                'stock' => 50,
                'unit' => '/ porsi (5 pcs)',
                'tag' => 'Favorit',
                'main_image' => 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
                'ingredients' => ['Ketan', 'Ayam', 'Santan', 'Bumbu rempah'],
                'allergens' => [],
                'is_active' => true,
                'sizes' => [],
            ],
            [
                'category_id' => $jajananPasar->id,
                'name' => 'Klepon',
                'slug' => 'klepon',
                'description' => 'Kue tradisional dari tepung ketan berisi gula merah cair, ditaburi kelapa parut.',
                'base_price' => 20000,
                'stock' => 60,
                'unit' => '/ porsi (10 pcs)',
                'tag' => 'Terlaris',
                'main_image' => 'https://images.unsplash.com/photo-1576506541685-1e6c1d9e1e8d?w=400',
                'ingredients' => ['Tepung ketan', 'Gula merah', 'Kelapa parut', 'Pandan'],
                'allergens' => [],
                'is_active' => true,
                'sizes' => [],
            ],
            [
                'category_id' => $jajananPasar->id,
                'name' => 'Onde-onde',
                'slug' => 'onde-onde',
                'description' => 'Bola-bola goreng dari tepung ketan berisi kacang hijau, dilapisi wijen.',
                'base_price' => 22000,
                'stock' => 45,
                'unit' => '/ porsi (8 pcs)',
                'tag' => null,
                'main_image' => 'https://images.unsplash.com/photo-1587248720327-0cdb7c983b8b?w=400',
                'ingredients' => ['Tepung ketan', 'Kacang hijau', 'Gula', 'Wijen'],
                'allergens' => [],
                'is_active' => true,
                'sizes' => [],
            ],
        ];

        foreach ($products as $productData) {
            $sizes = $productData['sizes'];
            unset($productData['sizes']);

            $product = Product::create($productData);

            // Create sizes if exists
            foreach ($sizes as $size) {
                ProductSize::create([
                    'product_id' => $product->id,
                    'size_name' => $size['size_name'],
                    'price' => $size['price'],
                ]);
            }
        }
    }
}
