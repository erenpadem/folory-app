<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Services\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordOtpTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_returns_generic_success_even_if_email_unknown(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nobody@example.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_reset_password_with_valid_otp_updates_password_and_revokes_tokens(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'password' => bcrypt('old-password'),
        ]);

        $user->createToken('api');

        /** @var OtpService $otp */
        $otp = app(OtpService::class);
        $code = $otp->issueForEmail($user->email, OtpService::TYPE_PASSWORD_RESET, $user);

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'code' => $code,
            'password' => 'new-secret-8',
            'password_confirmation' => 'new-secret-8',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertTrue(Hash::check('new-secret-8', $user->fresh()->password));

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    public function test_reset_password_rejects_invalid_code(): void
    {
        $user = User::factory()->create(['email' => 'bad@example.com']);

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'code' => '000000',
            'password' => 'new-secret-8',
            'password_confirmation' => 'new-secret-8',
        ]);

        $response->assertStatus(422);
    }
}
