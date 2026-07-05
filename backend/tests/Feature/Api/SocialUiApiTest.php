<?php

namespace Tests\Feature\Api;

use App\Models\Book;
use App\Models\Comment;
use App\Models\Page;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SocialUiApiTest extends TestCase
{
    use RefreshDatabase;

    private function publishedBookWithPage(): array
    {
        $author = User::factory()->author()->create();
        $book = Book::factory()->published()->create([
            'author_id' => $author->id,
            'title' => 'Kitap '.uniqid(),
        ]);
        $section = Section::factory()->create(['book_id' => $book->id]);
        $page = Page::factory()->create(['section_id' => $section->id]);

        return [$book, $section, $page, $author];
    }

    public function test_comment_index_includes_nested_replies(): void
    {
        [$book, , , $author] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        $parent = Comment::create([
            'user_id' => $reader->id,
            'book_id' => $book->id,
            'content' => 'Üst yorum',
            'depth' => 0,
        ]);
        Comment::create([
            'user_id' => $author->id,
            'book_id' => $book->id,
            'parent_id' => $parent->id,
            'content' => 'Alt yanıt',
            'depth' => 1,
        ]);

        $response = $this->getJson('/api/comments/book/'.$book->id);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.replies.0.content', 'Alt yanıt');
    }

    public function test_reader_can_post_comment_reply(): void
    {
        [$book, , , $author] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        $parent = Comment::create([
            'user_id' => $author->id,
            'book_id' => $book->id,
            'content' => 'Ana yorum',
            'depth' => 0,
        ]);

        Sanctum::actingAs($reader);

        $this->postJson('/api/comments', [
            'book_id' => $book->id,
            'content' => 'Yanıt metni',
            'parent_id' => $parent->id,
        ])->assertCreated();

        $this->assertDatabaseHas('comments', [
            'book_id' => $book->id,
            'parent_id' => $parent->id,
            'user_id' => $reader->id,
        ]);
    }

    public function test_follow_check_endpoint_reports_status(): void
    {
        $reader = User::factory()->create();
        $author = User::factory()->author()->create();

        Sanctum::actingAs($reader);

        $this->getJson('/api/follows/check/'.$author->id)
            ->assertOk()
            ->assertJsonPath('is_following', false);

        $this->postJson('/api/follows', ['following_id' => $author->id])->assertCreated();

        $this->getJson('/api/follows/check/'.$author->id)
            ->assertOk()
            ->assertJsonPath('is_following', true);
    }

    public function test_rating_mine_returns_user_score(): void
    {
        [$book] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Sanctum::actingAs($reader);

        $this->getJson('/api/ratings/book/'.$book->id.'/mine')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', null);

        $this->postJson('/api/ratings', [
            'book_id' => $book->id,
            'score' => 4,
        ])->assertCreated();

        $this->getJson('/api/ratings/book/'.$book->id.'/mine')
            ->assertOk()
            ->assertJsonPath('data.score', 4);
    }

    public function test_rating_update_changes_existing_score(): void
    {
        [$book] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Sanctum::actingAs($reader);

        $this->postJson('/api/ratings', ['book_id' => $book->id, 'score' => 3])->assertCreated();
        $this->postJson('/api/ratings', ['book_id' => $book->id, 'score' => 5])->assertCreated();

        $this->getJson('/api/ratings/book/'.$book->id.'/mine')
            ->assertJsonPath('data.score', 5);

        $this->assertDatabaseHas('ratings', [
            'book_id' => $book->id,
            'user_id' => $reader->id,
            'score' => 5,
        ]);
        $this->assertDatabaseCount('ratings', 1);
    }

    public function test_rating_index_returns_flat_list_with_average(): void
    {
        [$book] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Sanctum::actingAs($reader);
        $this->postJson('/api/ratings', ['book_id' => $book->id, 'score' => 4])->assertCreated();

        $response = $this->getJson('/api/ratings/book/'.$book->id);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('average_rating', 4)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonCount(1, 'data');

        $this->assertSame(4, $response->json('data.0.score'));
    }
}
