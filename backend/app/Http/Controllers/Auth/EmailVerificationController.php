<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EmailVerificationController extends Controller
{
    public function __construct(
        private OtpService $otpService
    ) {}

    /**
     * E-posta doğrulama kodu gönderir (6 hane).
     */
    public function sendCode(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'message' => 'E-posta adresiniz zaten doğrulanmış.',
            ]);
        }

        $code = $this->otpService->issueForEmail($user->email, OtpService::TYPE_EMAIL_VERIFY, $user);
        $this->otpService->sendEmailVerificationOtp($user, $code);

        return response()->json([
            'success' => true,
            'message' => 'Doğrulama kodu e-posta adresinize gönderildi.',
        ]);
    }

    /**
     * Gönderilen kodu doğrular ve e-postayı onaylar.
     */
    public function confirmCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ], [
            'code.size' => 'Kod 6 haneli olmalıdır.',
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'message' => 'E-posta adresiniz zaten doğrulanmış.',
            ]);
        }

        $otp = $this->otpService->validateCode(
            $user->email,
            OtpService::TYPE_EMAIL_VERIFY,
            $request->code
        );

        if (! $otp) {
            throw ValidationException::withMessages([
                'code' => ['Kod geçersiz veya süresi dolmuş.'],
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        $this->otpService->markUsed($otp);

        return response()->json([
            'success' => true,
            'message' => 'E-posta adresiniz doğrulandı.',
        ]);
    }
}
