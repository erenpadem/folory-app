<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Hash;

class OAuthController extends Controller
{
    private function uniqueUsernameFromEmail(string $email): string
    {
        $base = Str::slug(Str::before($email, '@')) ?: 'user';
        $username = $base;
        $suffix = 0;
        while (User::where('username', $username)->exists()) {
            $suffix++;
            $username = $base.$suffix;
        }

        return $username;
    }

    /**
     * Redirect to Google OAuth provider
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->stateless()
            ->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Find or create user
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user && ! $user->is_active) {
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                return redirect("{$frontendUrl}/auth/login?error=" . urlencode('Bu hesap devre dışı bırakılmış.'));
            }

            if (!$user) {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'username' => $this->uniqueUsernameFromEmail($googleUser->getEmail()),
                    'email' => $googleUser->getEmail(),
                    'password' => Hash::make(Str::random(32)), // Random password for OAuth users
                    'avatar' => $googleUser->getAvatar(),
                    'is_verified' => true, // Google verified emails are trusted
                    'email_verified_at' => now(),
                ]);
            } else {
                // Update avatar if changed
                if ($googleUser->getAvatar() && $user->avatar !== $googleUser->getAvatar()) {
                    $user->update(['avatar' => $googleUser->getAvatar()]);
                }
                if (! $user->email_verified_at) {
                    $user->forceFill(['email_verified_at' => now()])->save();
                }
            }

            // Generate token
            $token = $user->createToken('api_token')->plainTextToken;

            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect("{$frontendUrl}/auth/callback?token={$token}&provider=google");

        } catch (\Exception $e) {
            \Log::error('Google OAuth Error: ' . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect("{$frontendUrl}/auth/login?error=" . urlencode('Google ile giriş başarısız. Lütfen tekrar deneyin.'));
        }
    }

    /**
     * Redirect to Apple OAuth provider
     */
    public function redirectToApple()
    {
        try {
            return Socialite::driver('apple')
                ->scopes(['name', 'email'])
                ->stateless()
                ->redirect();
        } catch (\Exception $e) {
            \Log::error('Apple OAuth Redirect Error: ' . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect("{$frontendUrl}/auth/login?error=" . urlencode('Apple ile giriş yapılamıyor. Lütfen tekrar deneyin.'));
        }
    }

    /**
     * Handle Apple OAuth callback
     */
    public function handleAppleCallback(Request $request)
    {
        try {
            $appleUser = Socialite::driver('apple')->stateless()->user();

            // Apple provides name only on first login, so we need to handle it
            $name = $appleUser->getName();
            if (!$name) {
                $name = $appleUser->getNickname();
            }
            if (!$name) {
                $name = 'Apple Kullanıcısı';
            }
            $email = $appleUser->getEmail();

            if (!$email) {
                throw new \Exception('Apple\'dan e-posta adresi alınamadı.');
            }

            // Find or create user
            $user = User::where('email', $email)->first();

            if ($user && ! $user->is_active) {
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                return redirect("{$frontendUrl}/auth/login?error=" . urlencode('Bu hesap devre dışı bırakılmış.'));
            }

            if (!$user) {
                // Create new user
                $user = User::create([
                    'name' => $name,
                    'username' => $this->uniqueUsernameFromEmail($email),
                    'email' => $email,
                    'password' => Hash::make(Str::random(32)), // Random password for OAuth users
                    'is_verified' => true, // Apple verified emails are trusted
                    'email_verified_at' => now(),
                ]);
            } else {
                // Update name if not set
                if (!$user->name || $user->name === 'Apple Kullanıcısı') {
                    $user->update(['name' => $name]);
                }
                if (! $user->email_verified_at) {
                    $user->forceFill(['email_verified_at' => now()])->save();
                }
            }

            // Generate token
            $token = $user->createToken('api_token')->plainTextToken;

            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect("{$frontendUrl}/auth/callback?token={$token}&provider=apple");

        } catch (\Exception $e) {
            \Log::error('Apple OAuth Error: ' . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect("{$frontendUrl}/auth/login?error=" . urlencode('Apple ile giriş başarısız. Lütfen tekrar deneyin.'));
        }
    }
}

