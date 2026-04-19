<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Section>
 */
class SectionFactory extends Factory
{
    protected $model = Section::class;

    public function definition(): array
    {
        return [
            'book_id' => Book::factory(),
            'title' => fake()->unique()->sentence(2),
            'order' => 0,
            'total_page' => 0,
            'is_visible' => true,
        ];
    }
}
