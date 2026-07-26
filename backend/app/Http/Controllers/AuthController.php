<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * @return array<string, mixed>
     */
    private function userPayload(User $user): array
    {
        $stats = $user->bookStats();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'cover_image' => $user->cover_image,
            'bio' => $user->bio,
            'phone' => $user->phone,
            'is_active' => $user->is_active,
            'books_total_count' => $stats['total'],
            'books_published_count' => $stats['published'],
            'books_draft_count' => $stats['draft'],
        ];
    }

    public function register(Request $request)
    {
        try {
            $fields = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6|confirmed',
            ], [
                'name.required' => 'Ad alanı zorunludur.',
                'name.string' => 'Ad geçerli bir metin olmalıdır.',
                'name.max' => 'Ad en fazla 255 karakter olabilir.',
                'email.required' => 'E-posta alanı zorunludur.',
                'email.email' => 'Geçerli bir e-posta adresi giriniz.',
                'email.unique' => 'Bu e-posta adresi zaten kullanılıyor.',
                'password.required' => 'Şifre alanı zorunludur.',
                'password.string' => 'Şifre geçerli bir metin olmalıdır.',
                'password.min' => 'Şifre en az 6 karakter olmalıdır.',
                'password.confirmed' => 'Şifre onayı eşleşmiyor.',
            ]);

            $baseUsername = Str::slug(Str::before($fields['email'], '@')) ?: 'user';
            $username = $baseUsername;
            $suffix = 0;
            while (User::where('username', $username)->exists()) {
                $suffix++;
                $username = $baseUsername . $suffix;
            }

            $user = User::create([
                'name' => $fields['name'],
                'username' => $username,
                'email' => $fields['email'],
                'password' => Hash::make($fields['password']),
                'role' => 'reader',
                'email_verified_at' => config('folory.auto_verify_emails') ? now() : null,
            ]);

            $token = $user->createToken('api_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $this->userPayload($user),
                    'token' => $token,
                ],
                'message' => 'Kayıt başarılı.',
            ], 201);
        } catch (ValidationException $e) {
            $errors = $e->errors();
            $firstMessage = collect($errors)->flatten()->first();

            return response()->json([
                'success' => false,
                'message' => $firstMessage ?: 'Doğrulama hatası.',
                'errors' => $errors,
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Kayıt sırasında bir hata oluştu: '.$e->getMessage(),
            ], 500);
        }
    }

    public function user(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $this->userPayload($user),
            ],
        ]);
    }

    /**
     * Oturum açmış kullanıcının profilini günceller (isim, kullanıcı adı, bio, avatar, kapak, telefon).
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'username' => [
                    'sometimes',
                    'string',
                    'min:3',
                    'max:20',
                    'regex:/^[a-z0-9_]+$/',
                    Rule::unique('users', 'username')->ignore($user->id),
                ],
                'bio' => 'nullable|string|max:160',
                'avatar' => 'nullable|string',
                'cover_image' => 'nullable|string',
                'phone' => 'nullable|string|max:32',
            ], [
                'username.regex' => 'Kullanıcı adı yalnızca küçük harf, rakam ve alt çizgi içerebilir.',
                'username.unique' => 'Bu kullanıcı adı zaten alınmış.',
            ]);

            $user->fill($validated);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Profil güncellendi.',
                'data' => [
                    'user' => $this->userPayload($user->fresh()),
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Doğrulama hatası.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Profil güncellenirken bir hata oluştu.',
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $fields = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ], [
                'email.required' => 'E-posta alanı zorunludur.',
                'email.email' => 'Geçerli bir e-posta adresi giriniz.',
                'password.required' => 'Şifre alanı zorunludur.',
                'password.string' => 'Şifre geçerli bir metin olmalıdır.',
            ]);

            $user = User::where('email', $fields['email'])->first();

            if (! $user || ! Hash::check($fields['password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'E-posta veya şifre hatalı.',
                ], 401);
            }

            if (! $user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bu hesap devre dışı bırakılmış. Destek ile iletişime geçebilirsiniz.',
                ], 403);
            }

            $token = $user->createToken('api_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $this->userPayload($user),
                    'token' => $token,
                ],
                'message' => 'Giriş başarılı.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Doğrulama hatası.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Giriş sırasında bir hata oluştu: ' . $e->getMessage(),
            ], 500);
        }
    }


    /**
     * E-posta doğrulandıktan sonra okuyucu hesabını yazar hesabına yükseltir.
     */
    public function becomeAuthor(Request $request)
    {
        $user = $request->user();

        if (! $user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Yazar olmak için önce e-posta adresinizi doğrulamanız gerekir.',
            ], 422);
        }

        if ($user->role === 'author') {
            return response()->json([
                'success' => true,
                'message' => 'Hesabınız zaten yazar olarak kayıtlı.',
                'data' => ['role' => $user->role],
            ]);
        }

        $user->role = 'author';
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Tebrikler! Artık kitap oluşturabilirsiniz.',
            'data' => ['role' => $user->role],
        ]);
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json([
                'success' => true,
                'message' => 'Çıkış başarılı.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Çıkış sırasında bir hata oluştu.',
            ], 500);
        }
    }
}
