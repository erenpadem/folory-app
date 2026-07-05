<?php

namespace Tests\Feature\Api;

use App\Models\Book;
use App\Models\Page;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LibraryApiTest extends TestCase
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

        return [$book, $section, $page];
    }

    public function test_reader_can_add_book_to_library_and_list(): void
    {
        [$book] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Sanctum::actingAs($reader);

        $this->postJson('/api/library', ['book_id' => $book->id])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->getJson('/api/library')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);

        $this->getJson('/api/library/'.$book->id.'/check')
            ->assertOk()
            ->assertJsonPath('is_saved', true);
    }

    public function test_reader_can_remove_book_from_library(): void
    {
        [$book] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Sanctum::actingAs($reader);

        $this->postJson('/api/library', ['book_id' => $book->id])->assertOk();

        $this->deleteJson('/api/library/'.$book->id)
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->getJson('/api/library/'.$book->id.'/check')
            ->assertOk()
            ->assertJsonPath('is_saved', false);
    }

    public function test_reader_can_update_and_read_progress(): void
    {
        [$book, $section, $page] = $this->publishedBookWithPage();
        $reader = User::factory()->create();

        Sanctum::actingAs($reader);

        $this->patchJson('/api/library/'.$book->id.'/progress', [
            'last_section_id' => $section->id,
            'last_page_id' => $page->id,
            'progress_percentage' => 42,
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.progress_percentage', 42);

        $this->getJson('/api/library/'.$book->id.'/reading')
            ->assertOk()
            ->assertJsonPath('data.last_section_id', $section->id)
            ->assertJsonPath('data.last_page_id', $page->id)
            ->assertJsonPath('data.progress_percentage', 42);
    }

    public function test_progress_rejects_section_from_another_book(): void
    {
        [$book, , $page] = $this->publishedBookWithPage();
        $otherBook = Book::factory()->published()->create([
            'author_id' => User::factory()->author()->create()->id,
        ]);
        $otherSection = Section::factory()->create(['book_id' => $otherBook->id]);

        $reader = User::factory()->create();
        Sanctum::actingAs($reader);

        $this->patchJson('/api/library/'.$book->id.'/progress', [
            'last_section_id' => $otherSection->id,
            'last_page_id' => $page->id,
            'progress_percentage' => 10,
        ])->assertStatus(422);
    }
}
