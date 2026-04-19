<?php

namespace Tests\Integration;

use App\Models\Book;
use App\Models\Category;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Çok adımlı HTTP akışları: Feature testlerinden ayrı olarak uçtan uca senaryolar.
 */
class ApiFlowIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_login_and_user_endpoint_with_same_token(): void
    {
        $email = 'flow-'.uniqid('', true).'@example.com';

        $reg = $this->postJson('/api/register', [
            'name' => 'Flow User',
            'email' => $email,
            'password' => 'secret12',
            'password_confirmation' => 'secret12',
        ]);

        $reg->assertCreated();
        $token = $reg->json('data.token');
        $this->assertNotEmpty($token);

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.user.email', $email)
            ->assertJsonPath('data.user.role', 'reader');
    }

    public function test_become_author_then_create_book_flow(): void
    {
        $user = User::factory()->create(['role' => 'reader']);

        Sanctum::actingAs($user);

        $this->postJson('/api/user/become-author')
            ->assertOk()
            ->assertJsonPath('data.role', 'author');

        $category = Category::factory()->create();

        $this->postJson('/api/books', [
            'title' => 'Integration Book '.uniqid(),
            'short_description' => 'Test',
            'category_id' => $category->id,
            'is_draft' => true,
        ])->assertCreated();
    }

    public function test_publish_pipeline_after_sections_and_pages(): void
    {
        $author = User::factory()->author()->create();
        $category = Category::factory()->create();

        Sanctum::actingAs($author);

        $bookRes = $this->postJson('/api/books', [
            'title' => 'Pub Flow '.uniqid(),
            'category_id' => $category->id,
            'is_draft' => true,
        ]);

        $bookRes->assertCreated();
        $bookId = $bookRes->json('id');
        $this->assertIsInt($bookId);

        $sec = $this->postJson("/api/books/{$bookId}/sections", [
            'title' => 'B1',
            'order' => 0,
            'is_visible' => true,
        ]);
        $sec->assertCreated();
        $sectionId = $sec->json('id');

        $this->postJson("/api/sections/{$sectionId}/pages", [
            'content' => 'x',
            'order' => 0,
        ])->assertCreated();

        $this->postJson("/api/books/{$bookId}/publish")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertTrue(Book::find($bookId)->is_published);
    }

    public function test_password_reset_then_login_with_new_password(): void
    {
        $user = User::factory()->create([
            'email' => 'reset-flow@example.com',
            'password' => Hash::make('old-pass-8'),
        ]);

        /** @var OtpService $otp */
        $otp = app(OtpService::class);
        $code = $otp->issueForEmail($user->email, OtpService::TYPE_PASSWORD_RESET, $user);

        $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'code' => $code,
            'password' => 'new-pass-9chars',
            'password_confirmation' => 'new-pass-9chars',
        ])->assertOk();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'new-pass-9chars',
        ])->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_email_verify_then_become_author(): void
    {
        $user = User::factory()->unverified()->create(['role' => 'reader']);

        Sanctum::actingAs($user);

        /** @var OtpService $otp */
        $otp = app(OtpService::class);
        $code = $otp->issueForEmail($user->email, OtpService::TYPE_EMAIL_VERIFY, $user);

        $this->postJson('/api/email/verify-code', ['code' => $code])
            ->assertOk();

        $this->postJson('/api/user/become-author')
            ->assertOk()
            ->assertJsonPath('data.role', 'author');
    }
}
