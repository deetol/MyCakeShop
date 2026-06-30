<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Roti Manis',
                'slug' => 'roti-manis',
                'description' => 'Koleksi roti manis yang lembut dan menggugah selera',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Kue Kering',
                'slug' => 'kue-kering',
                'description' => 'Aneka kue kering untuk menemani santai Anda',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Jajanan Pasar',
                'slug' => 'jajanan-pasar',
                'description' => 'Jajanan pasar tradisional yang autentik',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Roti',
                'slug' => 'roti',
                'description' => 'Koleksi roti lezat',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Kue',
                'slug' => 'kue',
                'description' => 'Aneka kue manis',
                'image' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Pastry',
                'slug' => 'pastry',
                'description' => 'Pastry renyah dan gurih',
                'image' => null,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
