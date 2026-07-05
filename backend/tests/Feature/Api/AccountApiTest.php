<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Services\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_change_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-pass-8'),
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/user/change-password', [
            'current_password' => 'old-pass-8',
            'password' => 'new-pass-9chars',
            'password_confirmation' => 'new-pass-9chars',
        ])->assertOk()
            ->assertJsonPath('success', true);

        $this->assertTrue(Hash::check('new-pass-9chars', $user->fresh()->password));
    }

    public function test_change_password_rejects_wrong_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('correct-pass'),
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/user/change-password', [
            'current_password' => 'wrong-pass',
            'password' => 'new-pass-9chars',
            'password_confirmation' => 'new-pass-9chars',
        ])->assertStatus(422);
    }

    public function test_user_can_confirm_email_change_with_otp(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'old@example.com',
            'password' => Hash::make('secret12'),
        ]);

        Sanctum::actingAs($user);

        /** @var OtpService $otp */
        $otp = app(OtpService::class);
        $newEmail = 'new-'.uniqid().'@example.com';
        $code = $otp->issueForEmail($newEmail, OtpService::TYPE_EMAIL_CHANGE, $user);

        $this->postJson('/api/user/change-email/confirm', [
            'new_email' => $newEmail,
            'code' => $code,
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', $newEmail);

        $this->assertSame($newEmail, $user->fresh()->email);
    }

    public function test_user_can_deactivate_account(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret12'),
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/user/deactivate', [
                'password' => 'secret12',
                'acknowledge' => true,
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertFalse($user->fresh()->is_active);
    }

    public function test_user_can_delete_account(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret12'),
        ]);
        $userId = $user->id;
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->deleteJson('/api/user/account', [
                'password' => 'secret12',
                'acknowledge' => true,
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('users', ['id' => $userId]);
    }
}
