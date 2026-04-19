<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Services\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_verification_code_requires_authentication(): void
    {
        $response = $this->postJson('/api/email/verification-notification');

        $response->assertUnauthorized();
    }

    public function test_send_verification_code_succeeds_for_unverified_user(): void
    {
        $user = User::factory()->unverified()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/email/verification-notification');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_verify_code_confirms_email(): void
    {
        $user = User::factory()->unverified()->create();

        Sanctum::actingAs($user);

        /** @var OtpService $otp */
        $otp = app(OtpService::class);
        $code = $otp->issueForEmail($user->email, OtpService::TYPE_EMAIL_VERIFY, $user);

        $response = $this->postJson('/api/email/verify-code', [
            'code' => $code,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertNotNull($user->fresh()->email_verified_at);
    }
}
