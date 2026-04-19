<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CommentReplyMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $replierName,
        public string $bookTitle,
        public string $commentContent,
        public string $replyContent,
        public string $bookUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->replierName . ' yorumunuza cevap verdi',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.comment-reply',
            with: [
                'replierName' => $this->replierName,
                'bookTitle' => $this->bookTitle,
                'commentContent' => $this->commentContent,
                'replyContent' => $this->replyContent,
                'bookUrl' => $this->bookUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
