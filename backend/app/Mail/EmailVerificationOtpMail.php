<?php

namespace App\Mail;

use App\Services\MjmlViewService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $otpCode
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: config('app.name').' — E-posta doğrulama kodu',
        );
    }

    public function content(): Content
    {
        $html = app(MjmlViewService::class)->render('emails.mjml.email-verification', [
            'userName' => $this->userName,
            'otp_code' => $this->otpCode,
            'appName' => config('folory.name'),
            'frontendUrl' => config('folory.frontend_url'),
            'brandPrimary' => config('folory.mail_brand_primary'),
            'brandAccent' => config('folory.mail_brand_accent'),
        ]);

        return new Content(htmlString: $html);
    }

    public function attachments(): array
    {
        return [];
    }
}
