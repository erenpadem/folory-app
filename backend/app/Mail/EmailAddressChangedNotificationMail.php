<?php

namespace App\Mail;

use App\Services\MjmlViewService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailAddressChangedNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $oldEmail,
        public string $newEmail
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: config('app.name').' — E-posta adresiniz değiştirildi',
        );
    }

    public function content(): Content
    {
        $html = app(MjmlViewService::class)->render('emails.mjml.email-address-changed', [
            'userName' => $this->userName,
            'oldEmail' => $this->oldEmail,
            'newEmail' => $this->newEmail,
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
