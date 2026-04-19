<?php

namespace Tests\Feature\Api;

use App\Models\Book;
use App\Models\Category;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class BookListQueryCountTest extends TestCase
{
    use RefreshDatabase;

    public function test_book_listing_does_not_run_per_row_rating_queries(): void
    {
        $author = User::factory()->author()->create();
        $category = Category::factory()->create();

        $books = Book::factory()->count(12)->published()->create([
            'author_id' => $author->id,
            'category_id' => $category->id,
        ]);

        foreach ($books as $book) {
            Rating::create([
                'user_id' => User::factory()->create()->id,
                'book_id' => $book->id,
                'score' => 4,
            ]);
        }

        DB::enableQueryLog();

        $this->getJson('/api/books');

        $queries = DB::getQueryLog();

        $ratingSelects = collect($queries)->filter(function (array $q) {
            $sql = strtolower($q['query'] ?? '');

            return str_contains($sql, 'select') && str_contains($sql, 'ratings');
        });

        $this->assertLessThanOrEqual(
            5,
            $ratingSelects->count(),
            'Beklenenden fazla ratings SELECT — kitap listesinde N+1 olabilir.'
        );
    }
}
