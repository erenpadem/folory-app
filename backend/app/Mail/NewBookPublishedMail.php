<?php

namespace App\Mail;

use App\Services\MjmlViewService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewBookPublishedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $bookDescriptionShort;

    public function __construct(
        public string $authorName,
        public string $bookTitle,
        string $bookDescription,
        public string $bookCover,
        public string $bookUrl
    ) {
        $this->bookDescriptionShort = \Illuminate\Support\Str::limit(strip_tags($bookDescription), 220);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->authorName . ' yeni bir kitap yayınladı: ' . $this->bookTitle,
        );
    }

    public function content(): Content
    {
        $html = app(MjmlViewService::class)->render('emails.mjml.new-book-published', [
            'authorName' => $this->authorName,
            'bookTitle' => $this->bookTitle,
            'bookDescriptionShort' => $this->bookDescriptionShort,
            'bookCover' => $this->bookCover,
            'bookUrl' => $this->bookUrl,
            'appName' => config('folory.name'),
            'brandPrimary' => config('folory.mail_brand_primary'),
        ]);

        return new Content(htmlString: $html);
    }

    public function attachments(): array
    {
        return [];
    }
}
