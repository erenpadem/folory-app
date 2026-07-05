<?php

namespace Tests\Feature\Api;

use App\Models\Book;
use App\Models\Category;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_logout_invalidates_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
        ]);
    }

    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create(['bio' => null]);
        Sanctum::actingAs($user);

        $this->putJson('/api/user/profile', [
            'name' => 'Yeni İsim',
            'bio' => 'Kısa bio',
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.name', 'Yeni İsim')
            ->assertJsonPath('data.user.bio', 'Kısa bio');
    }

    public function test_get_user_by_username_returns_public_profile(): void
    {
        $author = User::factory()->author()->create([
            'username' => 'testauthor'.uniqid(),
        ]);
        Book::factory()->published()->count(2)->create(['author_id' => $author->id]);

        $this->getJson('/api/users/username/'.$author->username)
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.username', $author->username)
            ->assertJsonPath('data.books_published_count', 2);
    }

    public function test_get_user_by_id_returns_404_for_unknown(): void
    {
        $this->getJson('/api/users/99999')
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_author_dashboard_stats_include_book_counts(): void
    {
        $author = User::factory()->author()->create();
        Book::factory()->published()->create(['author_id' => $author->id]);
        Book::factory()->draft()->create(['author_id' => $author->id]);

        Sanctum::actingAs($author);

        $this->getJson('/api/dashboard/stats')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.stats.total_books', 2)
            ->assertJsonPath('data.stats.published_books', 1)
            ->assertJsonPath('data.stats.draft_books', 1);
    }

    public function test_similar_books_endpoint_returns_books(): void
    {
        $category = Category::factory()->create();
        $author = User::factory()->author()->create();
        $book = Book::factory()->published()->create([
            'author_id' => $author->id,
            'category_id' => $category->id,
        ]);
        Book::factory()->published()->create([
            'author_id' => $author->id,
            'category_id' => $category->id,
        ]);

        $this->getJson('/api/books/'.$book->slug.'/similar')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_authenticated_user_can_create_category(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $name = 'Kategori '.uniqid();

        $this->postJson('/api/categories', [
            'name' => $name,
            'is_active' => true,
        ])->assertCreated();
    }

    public function test_author_can_reorder_sections(): void
    {
        $author = User::factory()->author()->create();
        $book = Book::factory()->draft()->create(['author_id' => $author->id]);
        $sectionA = Section::factory()->create(['book_id' => $book->id, 'order' => 0, 'title' => 'A']);
        $sectionB = Section::factory()->create(['book_id' => $book->id, 'order' => 1, 'title' => 'B']);

        Sanctum::actingAs($author);

        $this->postJson('/api/books/'.$book->id.'/sections/reorder', [
            'sections' => [
                ['id' => $sectionA->id, 'order' => 1],
                ['id' => $sectionB->id, 'order' => 0],
            ],
        ])->assertOk();

        $this->assertSame(1, $sectionA->fresh()->order);
        $this->assertSame(0, $sectionB->fresh()->order);
    }
}
