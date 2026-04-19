<?php

namespace App\Services;

use App\Mail\EmailChangeOtpMail;
use App\Mail\EmailVerificationOtpMail;
use App\Mail\PasswordResetOtpMail;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    public const TYPE_PASSWORD_RESET = 'password_reset';

    public const TYPE_EMAIL_VERIFY = 'email_verify';

    public const TYPE_EMAIL_CHANGE = 'email_change';

    public function issueForEmail(string $email, string $type, ?User $user = null): string
    {
        $code = str_pad((string) random_int(0, 999_999), 6, '0', STR_PAD_LEFT);

        OtpCode::query()
            ->where('email', $email)
            ->where('type', $type)
            ->whereNull('used_at')
            ->delete();

        OtpCode::query()->create([
            'user_id' => $user?->id,
            'email' => $email,
            'type' => $type,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(15),
        ]);

        return $code;
    }

    /**
     * Geçerli OTP kaydını bulur; tüketmez (şifre güncellemesi başarılı olunca markUsed çağrılmalı).
     */
    public function validateCode(string $email, string $type, string $code): ?OtpCode
    {
        $otp = OtpCode::query()
            ->where('email', $email)
            ->where('type', $type)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $otp || ! Hash::check($code, $otp->code_hash)) {
            return null;
        }

        return $otp;
    }

    /**
     * E-posta değişikliği: OTP yeni adrese gider; kayıt kullanıcıya bağlı olmalıdır.
     */
    public function validateCodeForUser(string $email, string $type, string $code, int $userId): ?OtpCode
    {
        $otp = OtpCode::query()
            ->where('email', $email)
            ->where('type', $type)
            ->where('user_id', $userId)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $otp || ! Hash::check($code, $otp->code_hash)) {
            return null;
        }

        return $otp;
    }

    public function markUsed(OtpCode $otp): void
    {
        $otp->forceFill(['used_at' => now()])->save();
    }

    public function sendPasswordResetOtp(string $email, User $user, string $plainCode): void
    {
        Mail::to($email)->send(new PasswordResetOtpMail($user->name, $plainCode));
    }

    public function sendEmailVerificationOtp(User $user, string $plainCode): void
    {
        Mail::to($user->email)->send(new EmailVerificationOtpMail($user->name, $plainCode));
    }

    public function sendEmailChangeOtp(string $newEmail, User $user, string $plainCode): void
    {
        Mail::to($newEmail)->send(new EmailChangeOtpMail($user->name, $plainCode));
    }
}
