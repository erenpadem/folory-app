<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PasswordOtpController extends Controller
{
    public function __construct(
        private OtpService $otpService
    ) {}

    /**
     * Şifre sıfırlama için 6 haneli kod gönderir (e-posta).
     */
    public function sendCode(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $code = $this->otpService->issueForEmail($user->email, OtpService::TYPE_PASSWORD_RESET, $user);
            $this->otpService->sendPasswordResetOtp($user->email, $user, $code);
        }

        return response()->json([
            'success' => true,
            'message' => 'İşlem geçerliyse e-posta adresinize 6 haneli kod gönderildi.',
        ]);
    }

    /**
     * Kod + yeni şifre ile sıfırlama (token yerine OTP).
     */
    public function resetWithCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'code.size' => 'Kod 6 haneli olmalıdır.',
            'password.min' => 'Yeni şifre en az 8 karakter olmalıdır.',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Bu e-posta adresiyle kayıt bulunamadı.'],
            ]);
        }

        $otp = $this->otpService->validateCode(
            $request->email,
            OtpService::TYPE_PASSWORD_RESET,
            $request->code
        );

        if (! $otp) {
            throw ValidationException::withMessages([
                'code' => ['Kod geçersiz veya süresi dolmuş.'],
            ]);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        $this->otpService->markUsed($otp);
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Şifreniz güncellendi. Yeniden giriş yapabilirsiniz.',
        ]);
    }
}
