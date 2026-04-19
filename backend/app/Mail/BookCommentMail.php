<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookCommentMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $commenterName,
        public string $bookTitle,
        public string $commentContent,
        public string $bookUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kitabınıza Yeni Bir Yorum Yapıldı!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.book-comment',
            with: [
                'commenterName' => $this->commenterName,
                'bookTitle' => $this->bookTitle,
                'commentContent' => $this->commentContent,
                'bookUrl' => $this->bookUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
