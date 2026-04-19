<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Fantastik', 'description' => 'Fantastik kitaplar', 'order' => 1],
            ['name' => 'Bilim Kurgu', 'description' => 'Bilim kurgu kitaplar', 'order' => 2],
            ['name' => 'Romantik', 'description' => 'Romantik kitaplar', 'order' => 3],
            ['name' => 'Gerilim', 'description' => 'Gerilim kitaplar', 'order' => 4],
            ['name' => 'Korku', 'description' => 'Korku kitaplar', 'order' => 5],
            ['name' => 'Dram', 'description' => 'Dram kitaplar', 'order' => 6],
            ['name' => 'Macera', 'description' => 'Macera kitaplar', 'order' => 7],
            ['name' => 'Tarih', 'description' => 'Tarih kitaplar', 'order' => 8],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
