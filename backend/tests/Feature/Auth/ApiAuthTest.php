<?php

namespace Tests\Feature\Auth;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_reader_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Reader',
            'email' => 'reader@example.com',
            'password' => 'secret12',
            'password_confirmation' => 'secret12',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'reader');

        $this->assertDatabaseHas('users', [
            'email' => 'reader@example.com',
            'role' => 'reader',
        ]);
    }

    public function test_login_returns_user_payload_and_token(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'u@example.com',
            'password' => bcrypt('right'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'u@example.com',
            'password' => 'wrong-pass',
        ]);

        $response->assertUnauthorized();
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->inactive()->create([
            'email' => 'inactive@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'inactive@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(403);
    }

    public function test_reader_cannot_create_book_without_author_role(): void
    {
        $reader = User::factory()->reader()->create();
        $category = Category::factory()->create();

        Sanctum::actingAs($reader);

        // Geçerli gövde: doğrulama geçsin, controller’daki yazar rolü kontrolü çalışsın.
        $response = $this->postJson('/api/books', [
            'title' => 'My Book',
            'category_id' => $category->id,
            'is_draft' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Kitap işlemleri için önce yazar hesabına geçin (POST /api/user/become-author).']);
    }

    public function test_become_author_requires_verified_email(): void
    {
        $user = User::factory()->unverified()->create(['role' => 'reader']);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/user/become-author');

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Yazar olmak için önce e-posta adresinizi doğrulamanız gerekir.']);
    }

    public function test_verified_user_can_become_author(): void
    {
        $user = User::factory()->create(['role' => 'reader']);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/user/become-author');

        $response->assertOk()
            ->assertJsonPath('data.role', 'author');

        $this->assertSame('author', $user->fresh()->role);
    }

    public function test_author_payload_includes_role(): void
    {
        $author = User::factory()->author()->create();

        Sanctum::actingAs($author);

        $response = $this->getJson('/api/user');

        $response->assertOk()
            ->assertJsonPath('data.user.role', 'author');
    }
}
