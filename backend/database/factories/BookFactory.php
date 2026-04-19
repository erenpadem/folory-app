<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    protected $model = Book::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'author_id' => User::factory()->author(),
            'category_id' => Category::factory(),
            'title' => $title,
            'short_description' => fake()->sentence(),
            'cover' => null,
            'read_count' => 0,
            'total_page' => 0,
            'is_adult' => false,
            'is_draft' => true,
            'is_published' => false,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_draft' => false,
            'is_published' => true,
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_draft' => true,
            'is_published' => false,
        ]);
    }
}
