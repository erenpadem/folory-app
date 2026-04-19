<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookRatingMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $raterName,
        public string $bookTitle,
        public int $score,
        public string $bookUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kitabınıza ' . $this->score . ' Yıldız Puan Verildi!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.book-rating',
            with: [
                'raterName' => $this->raterName,
                'bookTitle' => $this->bookTitle,
                'score' => $this->score,
                'bookUrl' => $this->bookUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
