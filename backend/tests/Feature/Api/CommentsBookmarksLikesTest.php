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

class CommentsBookmarksLikesTest extends TestCase
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

        return [$book, $page, $author];
    }

    public function test_guest_can_list_comments_for_book(): void
    {
        [$book, $page, $author] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Comment::create([
            'user_id' => $reader->id,
            'book_id' => $book->id,
            'content' => 'Harika bir kitap!',
            'depth' => 0,
        ]);

        $response = $this->getJson('/api/comments/book/'.$book->id);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_reader_can_post_comment(): void
    {
        [$book, $page, $author] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Sanctum::actingAs($reader);

        $response = $this->postJson('/api/comments', [
            'book_id' => $book->id,
            'content' => 'Yeni yorum',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('comments', [
            'book_id' => $book->id,
            'user_id' => $reader->id,
        ]);
    }

    public function test_user_can_toggle_comment_like(): void
    {
        [$book, $page, $author] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        $comment = Comment::create([
            'user_id' => $author->id,
            'book_id' => $book->id,
            'content' => 'Yorum',
            'depth' => 0,
        ]);

        Sanctum::actingAs($reader);

        $this->postJson('/api/comments/'.$comment->id.'/like')
            ->assertOk()
            ->assertJsonPath('data.liked', true);

        $this->postJson('/api/comments/'.$comment->id.'/like')
            ->assertOk()
            ->assertJsonPath('data.liked', false);
    }

    public function test_user_can_bookmark_page(): void
    {
        [$book, $page, $author] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Sanctum::actingAs($reader);

        $this->postJson('/api/bookmarks', [
            'page_id' => $page->id,
        ])->assertCreated();

        $this->getJson('/api/bookmarks/page/'.$page->id.'/check')
            ->assertOk()
            ->assertJsonPath('is_bookmarked', true);

        $this->getJson('/api/bookmarks')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_user_can_toggle_book_like(): void
    {
        [$book, $page, $author] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Sanctum::actingAs($reader);

        $this->postJson('/api/likes/toggle', [
            'book_id' => $book->id,
        ])->assertOk()
            ->assertJsonPath('is_liked', true);

        $this->getJson('/api/likes/books/'.$book->id.'/check')
            ->assertOk()
            ->assertJsonPath('is_liked', true);

        $this->postJson('/api/likes/toggle', [
            'book_id' => $book->id,
        ])->assertOk()
            ->assertJsonPath('is_liked', false);
    }

    public function test_reader_can_rate_published_book(): void
    {
        [$book, $page, $author] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Sanctum::actingAs($reader);

        $response = $this->postJson('/api/ratings', [
            'book_id' => $book->id,
            'score' => 5,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('ratings', [
            'book_id' => $book->id,
            'user_id' => $reader->id,
            'score' => 5,
        ]);
    }

    public function test_author_cannot_rate_own_book(): void
    {
        [$book, $page, $author] = $this->publishedBookWithPage();

        Sanctum::actingAs($author);

        $this->postJson('/api/ratings', [
            'book_id' => $book->id,
            'score' => 5,
        ])->assertForbidden()
            ->assertJsonPath('message', 'Kendi kitabınıza puan veremezsiniz.');

        $this->assertDatabaseMissing('ratings', [
            'book_id' => $book->id,
            'user_id' => $author->id,
        ]);
    }

    public function test_author_cannot_like_own_book(): void
    {
        [$book, $page, $author] = $this->publishedBookWithPage();

        Sanctum::actingAs($author);

        $this->postJson('/api/likes/toggle', [
            'book_id' => $book->id,
        ])->assertForbidden()
            ->assertJsonPath('message', 'Kendi kitabınızı beğenemezsiniz.');

        $this->assertDatabaseMissing('book_likes', [
            'book_id' => $book->id,
            'user_id' => $author->id,
        ]);
    }
}
