<?php

namespace Tests\Feature\Api;

use App\Models\Book;
use App\Models\Comment;
use App\Models\Comment as CommentModel;
use App\Models\Notification;
use App\Models\Page;
use App\Models\PageNote;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SocialApiTest extends TestCase
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

    public function test_user_can_manage_notifications(): void
    {
        $user = User::factory()->create();
        [$book] = array_slice($this->publishedBookWithPage(), 0, 1);
        $comment = Comment::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'content' => 'Parent',
            'depth' => 0,
        ]);

        Notification::create([
            'user_id' => $user->id,
            'type' => 'comment_reply',
            'notifiable_type' => CommentModel::class,
            'notifiable_id' => $comment->id,
            'data' => ['message' => 'Test'],
        ]);
        Notification::create([
            'user_id' => $user->id,
            'type' => 'system',
            'notifiable_type' => CommentModel::class,
            'notifiable_id' => $comment->id,
            'data' => ['message' => 'Unread'],
        ]);

        Sanctum::actingAs($user);

        $list = $this->getJson('/api/notifications');
        $list->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.count', 2);

        $notificationId = $list->json('data.0.id');

        $this->postJson('/api/notifications/'.$notificationId.'/read')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->postJson('/api/notifications/mark-all-read')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->deleteJson('/api/notifications/'.$notificationId)
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_user_can_crud_page_notes(): void
    {
        [, , $page] = array_slice($this->publishedBookWithPage(), 0, 3);
        $reader = User::factory()->create();

        Sanctum::actingAs($reader);

        $create = $this->postJson('/api/page-notes', [
            'page_id' => $page->id,
            'selected_text' => 'highlighted text',
            'note' => 'My note',
            'start_offset' => 0,
            'end_offset' => 16,
            'color' => 'yellow',
        ]);

        $create->assertCreated()
            ->assertJsonPath('success', true);

        $noteId = $create->json('data.id');

        $this->getJson('/api/page-notes/page/'.$page->id)
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->putJson('/api/page-notes/'.$noteId, [
            'note' => 'Updated note',
            'color' => 'blue',
        ])->assertOk()
            ->assertJsonPath('data.note', 'Updated note');

        $this->deleteJson('/api/page-notes/'.$noteId)
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_quotes_endpoint_returns_user_highlights(): void
    {
        [$book, , $page, $author] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        PageNote::create([
            'user_id' => $reader->id,
            'page_id' => $page->id,
            'selected_text' => 'Quote text',
            'note' => null,
            'start_offset' => 0,
            'end_offset' => 10,
            'color' => 'yellow',
        ]);

        $this->getJson('/api/quotes?user_id='.$reader->id)
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/quotes')
            ->assertStatus(422);
    }

    public function test_quotes_hides_unpublished_books_from_other_viewers(): void
    {
        $author = User::factory()->author()->create();
        $book = Book::factory()->draft()->create(['author_id' => $author->id]);
        $section = Section::factory()->create(['book_id' => $book->id]);
        $page = Page::factory()->create(['section_id' => $section->id]);

        PageNote::create([
            'user_id' => $author->id,
            'page_id' => $page->id,
            'selected_text' => 'Draft quote',
            'start_offset' => 0,
            'end_offset' => 11,
            'color' => 'yellow',
        ]);

        $other = User::factory()->create();
        Sanctum::actingAs($other);

        $this->getJson('/api/quotes?user_id='.$author->id)
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_autocomplete_mentions_returns_authors(): void
    {
        $author = User::factory()->author()->create(['name' => 'Eren Test Author']);
        [$book] = array_slice($this->publishedBookWithPage(), 0, 1);

        $response = $this->getJson('/api/autocomplete/mentions?q=Eren&book_id='.$book->id);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['authors', 'books', 'sections', 'pages']]);

        $authors = $response->json('data.authors');
        $this->assertNotEmpty($authors);
    }

    public function test_user_comments_endpoint_returns_paginated_comments(): void
    {
        [$book, , , $author] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Comment::create([
            'user_id' => $reader->id,
            'book_id' => $book->id,
            'content' => 'User comment',
            'depth' => 0,
        ]);

        $this->getJson('/api/users/'.$reader->id.'/comments')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data', 'meta']);
    }
}
