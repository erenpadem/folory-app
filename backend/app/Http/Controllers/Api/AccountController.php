<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\EmailAddressChangedNotificationMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\OtpService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    public function __construct(
        private OtpService $otpService
    ) {}

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'current_password.required' => 'Mevcut şifrenizi girin.',
            'password.min' => 'Yeni şifre en az 8 karakter olmalıdır.',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mevcut şifre hatalı.'],
            ]);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Şifreniz güncellendi.',
        ]);
    }

    /**
     * Oturum açıkken kayıtlı e-postaya 6 haneli şifre sıfırlama kodu gönderir.
     */
    public function sendPasswordResetLink(Request $request): JsonResponse
    {
        $user = $request->user();

        $code = $this->otpService->issueForEmail($user->email, OtpService::TYPE_PASSWORD_RESET, $user);
        $this->otpService->sendPasswordResetOtp($user->email, $user, $code);

        return response()->json([
            'success' => true,
            'message' => 'Şifre sıfırlama kodu e-posta adresinize gönderildi.',
        ]);
    }

    /**
     * Mevcut şifre ile doğrulayıp yeni adrese 6 haneli OTP gönderir.
     */
    public function requestEmailChange(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
            'new_email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($request->user()->id),
            ],
        ], [
            'new_email.unique' => 'Bu e-posta adresi zaten kullanılıyor.',
        ]);

        $user = $request->user();

        if (strcasecmp($user->email, $request->new_email) === 0) {
            throw ValidationException::withMessages([
                'new_email' => ['Yeni adres mevcut adresinizle aynı olamaz.'],
            ]);
        }

        if (! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Şifre hatalı.'],
            ]);
        }

        $code = $this->otpService->issueForEmail($request->new_email, OtpService::TYPE_EMAIL_CHANGE, $user);
        $this->otpService->sendEmailChangeOtp($request->new_email, $user, $code);

        return response()->json([
            'success' => true,
            'message' => 'Doğrulama kodu yeni e-posta adresinize gönderildi.',
        ]);
    }

    /**
     * Yeni adrese gelen kod ile e-postayı günceller; eski adrese bilgilendirme e-postası gider.
     */
    public function confirmEmailChange(Request $request): JsonResponse
    {
        $request->validate([
            'new_email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (User::where('email', $request->new_email)->where('id', '!=', $user->id)->exists()) {
            throw ValidationException::withMessages([
                'new_email' => ['Bu e-posta adresi artık başka bir hesaba ait. Lütfen tekrar deneyin.'],
            ]);
        }

        $otp = $this->otpService->validateCodeForUser(
            $request->new_email,
            OtpService::TYPE_EMAIL_CHANGE,
            $request->code,
            $user->id
        );

        if (! $otp) {
            throw ValidationException::withMessages([
                'code' => ['Kod geçersiz veya süresi dolmuş.'],
            ]);
        }

        $oldEmail = $user->email;
        $user->email = $request->new_email;
        $user->email_verified_at = now();
        $user->save();

        $this->otpService->markUsed($otp);

        Mail::to($oldEmail)->send(new EmailAddressChangedNotificationMail(
            $user->name,
            $oldEmail,
            $request->new_email
        ));

        return response()->json([
            'success' => true,
            'message' => 'E-posta adresiniz güncellendi.',
            'data' => [
                'user' => [
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
                ],
            ],
        ]);
    }

    public function deactivate(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
            'acknowledge' => 'required|accepted',
        ], [
            'acknowledge.accepted' => 'Devre dışı bırakmayı onaylamanız gerekir.',
        ]);

        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Şifre hatalı.'],
            ]);
        }

        $user->is_active = false;
        $user->save();
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hesabınız devre dışı bırakıldı.',
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
            'acknowledge' => 'required|accepted',
        ], [
            'acknowledge.accepted' => 'Hesap silmeyi onaylamanız gerekir.',
        ]);

        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Şifre hatalı.'],
            ]);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hesabınız silindi.',
        ]);
    }
}
