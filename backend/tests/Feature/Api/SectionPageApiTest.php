<?php

namespace Tests\Feature\Api;

use App\Models\Book;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SectionPageApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_author_can_crud_sections_and_pages(): void
    {
        $author = User::factory()->author()->create();
        $book = Book::factory()->draft()->create([
            'author_id' => $author->id,
            'title' => 'Kitap '.uniqid(),
        ]);

        Sanctum::actingAs($author);

        $sectionRes = $this->postJson('/api/books/'.$book->id.'/sections', [
            'title' => 'Bölüm A',
            'order' => 0,
            'is_visible' => true,
        ]);

        $sectionRes->assertCreated();
        $sectionId = $sectionRes->json('id');
        $this->assertIsInt($sectionId);

        $pageRes = $this->postJson('/api/sections/'.$sectionId.'/pages', [
            'content' => '<p>Sayfa içeriği</p>',
            'order' => 0,
        ]);

        $pageRes->assertCreated();
        $pageId = $pageRes->json('id');
        $this->assertIsInt($pageId);

        $this->getJson('/api/sections/'.$sectionId.'/pages')
            ->assertOk();

        $this->putJson('/api/sections/'.$sectionId.'/pages/'.$pageId, [
            'content' => '<p>Güncellendi</p>',
            'order' => 0,
        ])->assertOk();

        $this->deleteJson('/api/sections/'.$sectionId.'/pages/'.$pageId)
            ->assertOk();

        $this->deleteJson('/api/books/'.$book->id.'/sections/'.$sectionId)
            ->assertOk();
    }
}
