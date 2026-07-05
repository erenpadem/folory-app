<?php

namespace Tests\Feature\Api;

use App\Models\Book;
use App\Models\Category;
use App\Models\Page;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookApiTest extends TestCase
{
    use RefreshDatabase;

    private function actingAuthor(): User
    {
        return User::factory()->author()->create();
    }

    public function test_guest_can_list_published_books(): void
    {
        $author = $this->actingAuthor();
        Book::factory()->published()->create([
            'author_id' => $author->id,
            'title' => 'Public Book '.uniqid(),
        ]);

        $response = $this->getJson('/api/books');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_guest_cannot_see_unpublished_book_by_id(): void
    {
        $author = $this->actingAuthor();
        $book = Book::factory()->draft()->create([
            'author_id' => $author->id,
            'title' => 'Secret '.uniqid(),
        ]);

        $response = $this->getJson('/api/books/'.$book->id);

        $response->assertNotFound();
    }

    public function test_author_can_create_update_and_publish_book(): void
    {
        $author = $this->actingAuthor();
        $category = Category::factory()->create();

        Sanctum::actingAs($author);

        $create = $this->postJson('/api/books', [
            'title' => 'Yeni kitap '.uniqid(),
            'short_description' => 'Açıklama',
            'category_id' => $category->id,
            'is_draft' => true,
        ]);

        $create->assertCreated();
        $bookId = $create->json('id');

        $this->assertIsInt($bookId);

        $update = $this->putJson('/api/books/'.$bookId, [
            'title' => 'Güncel başlık',
            'short_description' => 'Güncel açıklama',
            'category_id' => $category->id,
        ]);

        $update->assertOk()
            ->assertJsonPath('title', 'Güncel başlık');

        $book = Book::findOrFail($bookId);
        $section = Section::factory()->create([
            'book_id' => $book->id,
            'title' => 'Bölüm 1',
            'order' => 0,
        ]);
        Page::factory()->create([
            'section_id' => $section->id,
            'content' => 'İçerik',
            'order' => 0,
        ]);

        $publish = $this->postJson('/api/books/'.$bookId.'/publish');

        $publish->assertOk()
            ->assertJsonPath('success', true);

        $this->assertTrue($book->fresh()->is_published);
    }

    public function test_author_can_view_own_draft(): void
    {
        $author = $this->actingAuthor();
        $book = Book::factory()->draft()->create([
            'author_id' => $author->id,
            'title' => 'Taslak '.uniqid(),
        ]);

        Sanctum::actingAs($author);

        $response = $this->getJson('/api/books/'.$book->slug);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $book->id);
    }

    public function test_author_can_delete_own_book(): void
    {
        $author = $this->actingAuthor();
        $book = Book::factory()->draft()->create([
            'author_id' => $author->id,
            'title' => 'Silinecek '.uniqid(),
        ]);

        Sanctum::actingAs($author);

        $response = $this->deleteJson('/api/books/'.$book->id);

        $response->assertOk();
        $this->assertDatabaseMissing('books', ['id' => $book->id]);
    }

    public function test_record_view_increments_for_published_book(): void
    {
        $author = $this->actingAuthor();
        $book = Book::factory()->published()->create([
            'author_id' => $author->id,
            'title' => 'Okuma '.uniqid(),
            'read_count' => 0,
        ]);

        $response = $this->postJson('/api/books/'.$book->slug.'/view');

        $response->assertOk();
        $this->assertSame(1, $book->fresh()->read_count);
    }

    public function test_author_can_save_draft_creates_book_with_sections_and_pages(): void
    {
        $author = $this->actingAuthor();
        $category = Category::factory()->create();

        Sanctum::actingAs($author);

        $title = 'Taslak API '.uniqid();
        $response = $this->postJson('/api/books/draft', [
            'title' => $title,
            'category_id' => $category->id,
            'sections' => [
                [
                    'title' => 'Bölüm 1',
                    'order' => 0,
                    'is_visible' => true,
                    'pages' => [
                        ['content' => '<p>taslak içerik</p>', 'order' => 0],
                    ],
                ],
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', $title);

        $sections = $response->json('data.sections');
        $this->assertIsArray($sections);
        $this->assertNotEmpty($sections);
        $this->assertNotEmpty($sections[0]['pages']);
        $this->assertStringContainsString('taslak içerik', (string) $sections[0]['pages'][0]['content']);
    }

    public function test_author_can_save_draft_by_id_updates_section_and_page(): void
    {
        $author = $this->actingAuthor();
        $category = Category::factory()->create();
        $book = Book::factory()->draft()->create([
            'author_id' => $author->id,
            'category_id' => $category->id,
            'title' => 'Mevcut '.uniqid(),
        ]);
        $section = Section::factory()->create([
            'book_id' => $book->id,
            'title' => 'Eski bölüm',
            'order' => 0,
        ]);
        $page = Page::factory()->create([
            'section_id' => $section->id,
            'content' => 'eski',
            'order' => 0,
        ]);

        Sanctum::actingAs($author);

        $response = $this->postJson('/api/books/draft/'.$book->id, [
            'title' => $book->title,
            'category_id' => $category->id,
            'sections' => [
                [
                    'id' => $section->id,
                    'title' => 'Güncel bölüm',
                    'order' => 0,
                    'is_visible' => true,
                    'pages' => [
                        [
                            'id' => $page->id,
                            'content' => '<p>güncel</p>',
                            'order' => 0,
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSame('Güncel bölüm', $section->fresh()->title);
        $this->assertStringContainsString('güncel', (string) $page->fresh()->content);
    }

    public function test_save_draft_removes_sections_omitted_from_payload(): void
    {
        $author = $this->actingAuthor();
        $category = Category::factory()->create();
        $book = Book::factory()->draft()->create([
            'author_id' => $author->id,
            'category_id' => $category->id,
            'title' => 'Silinen bölüm '.uniqid(),
        ]);
        $keep = Section::factory()->create([
            'book_id' => $book->id,
            'title' => 'Kalacak',
            'order' => 0,
        ]);
        $remove = Section::factory()->create([
            'book_id' => $book->id,
            'title' => 'Silinecek',
            'order' => 1,
        ]);
        Page::factory()->create([
            'section_id' => $keep->id,
            'content' => '<p>a</p>',
            'order' => 0,
        ]);
        Page::factory()->create([
            'section_id' => $remove->id,
            'content' => '<p>b</p>',
            'order' => 0,
        ]);

        Sanctum::actingAs($author);

        $response = $this->postJson('/api/books/draft/'.$book->id, [
            'title' => $book->title,
            'category_id' => $category->id,
            'sections' => [
                [
                    'id' => $keep->id,
                    'title' => 'Kalacak',
                    'order' => 0,
                    'is_visible' => true,
                    'pages' => [
                        [
                            'id' => $keep->pages()->first()->id,
                            'content' => '<p>a</p>',
                            'order' => 0,
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertDatabaseMissing('sections', ['id' => $remove->id]);
        $this->assertDatabaseHas('sections', ['id' => $keep->id]);
        $response->assertJsonCount(1, 'data.sections');
    }

    public function test_save_draft_empty_sections_array_prunes_all_sections(): void
    {
        $author = $this->actingAuthor();
        $category = Category::factory()->create();
        $book = Book::factory()->draft()->create([
            'author_id' => $author->id,
            'category_id' => $category->id,
            'title' => 'Boş bölüm '.uniqid(),
        ]);
        $section = Section::factory()->create([
            'book_id' => $book->id,
            'title' => 'Tek',
            'order' => 0,
        ]);
        Page::factory()->create([
            'section_id' => $section->id,
            'content' => '<p>x</p>',
            'order' => 0,
        ]);

        Sanctum::actingAs($author);

        $response = $this->postJson('/api/books/draft/'.$book->id, [
            'title' => $book->title,
            'category_id' => $category->id,
            'sections' => [],
        ]);

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertDatabaseMissing('sections', ['id' => $section->id]);
        $response->assertJsonCount(0, 'data.sections');
    }

    public function test_non_owner_cannot_update_or_delete_book(): void
    {
        $owner = $this->actingAuthor();
        $intruder = $this->actingAuthor();
        $category = Category::factory()->create();
        $book = Book::factory()->draft()->create([
            'author_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Korunan '.uniqid(),
        ]);

        Sanctum::actingAs($intruder);

        $this->putJson('/api/books/'.$book->id, [
            'title' => 'Çalıntı başlık',
            'category_id' => $category->id,
        ])->assertForbidden();

        $this->deleteJson('/api/books/'.$book->id)->assertForbidden();

        $this->assertSame($book->title, $book->fresh()->title);
    }
}
