<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Order matters: BookSeeder needs users + categories, and the
        // Comment/Rating seeders iterate over published books, so books must
        // be created before them — otherwise a fresh `db:seed` yields an
        // empty catalog with zero comments/ratings.
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            BookSeeder::class,
            CommentSeeder::class,
            RatingSeeder::class,
        ]);
    }
}
