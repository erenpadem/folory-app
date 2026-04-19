<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Book as BookModel;
use App\Models\Comment as CommentModel;
use App\Domain\Comment\Entities\Comment;
use App\Domain\Book\Entities\Book;
use App\Mail\CommentReplyMail;
use App\Mail\NewBookPublishedMail;
use App\Mail\BookRatingMail;
use App\Mail\BookCommentMail;
use App\Mail\CommentLikeMail;
use App\Domain\Rating\Entities\Rating;
use App\Models\Rating as RatingModel;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send notification when someone replies to a comment
     */
    public function notifyCommentReply(Comment $reply, Comment $parentComment): void
    {
        try {
            // Don't notify if user is replying to their own comment
            if ($reply->getUserId() === $parentComment->getUserId()) {
                return;
            }

            $parentUser = User::find($parentComment->getUserId());
            if (!$parentUser) {
                return;
            }

            $bookModel = BookModel::find($parentComment->getBookId());
            if (!$bookModel) {
                return;
            }

            $replier = User::find($reply->getUserId());
            if (!$replier) {
                return;
            }

            // Create notification
            Notification::create([
                'user_id' => $parentUser->id,
                'type' => 'comment_reply',
                'notifiable_type' => CommentModel::class,
                'notifiable_id' => $reply->getId(),
                'data' => [
                    'replier_name' => $replier->name,
                    'replier_id' => $replier->id,
                    'book_id' => $bookModel->id,
                    'book_title' => $bookModel->title,
                    'comment_id' => $parentComment->getId(),
                    'reply_id' => $reply->getId(),
                    'comment_content' => $parentComment->getContent(),
                    'reply_content' => $reply->getContent(),
                ],
            ]);

            // Send email notification
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            Mail::to($parentUser->email)->send(
                new CommentReplyMail(
                    $replier->name,
                    $bookModel->title,
                    $parentComment->getContent(),
                    $reply->getContent(),
                    "{$frontendUrl}/book/{$bookModel->id}"
                )
            );
        } catch (\Exception $e) {
            Log::error('Failed to send comment reply notification: ' . $e->getMessage());
        }
    }

    /**
     * Send notification when a followed author publishes a new book
     */
    public function notifyNewBookPublished(Book $book): void
    {
        try {
            $author = User::find($book->getAuthorId());
            if (!$author) {
                return;
            }

            // Get all followers of the author
            $followers = $author->followers;

            if ($followers->isEmpty()) {
                return;
            }

            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $bookUrl = "{$frontendUrl}/book/{$book->getId()}";

            foreach ($followers as $follower) {
                // Create notification
                Notification::create([
                    'user_id' => $follower->id,
                    'type' => 'new_book',
                    'notifiable_type' => BookModel::class,
                    'notifiable_id' => $book->getId(),
                    'data' => [
                        'author_id' => $author->id,
                        'author_name' => $author->name,
                        'book_id' => $book->getId(),
                        'book_title' => $book->getTitle(),
                        'book_description' => $book->getShortDescription(),
                        'book_cover' => $book->getCover(),
                    ],
                ]);

                // Send email notification
                Mail::to($follower->email)->send(
                    new NewBookPublishedMail(
                        $author->name,
                        $book->getTitle(),
                        $book->getShortDescription() ?? '',
                        $book->getCover() ?? '',
                        $bookUrl
                    )
                );
            }
        } catch (\Exception $e) {
            Log::error('Failed to send new book published notification: ' . $e->getMessage());
        }
    }

    /**
     * Send notification when someone rates an author's book
     */
    public function notifyBookRating(Rating $rating): void
    {
        try {
            $bookModel = BookModel::find($rating->getBookId());
            if (!$bookModel) {
                return;
            }

            $author = User::find($bookModel->author_id);
            if (!$author || !$author->isAuthor()) {
                return;
            }

            // Don't notify if user is rating their own book
            if ($rating->getUserId() === $author->id) {
                return;
            }

            $rater = User::find($rating->getUserId());
            if (!$rater) {
                return;
            }

            // Create notification
            Notification::create([
                'user_id' => $author->id,
                'type' => 'book_rating',
                'notifiable_type' => RatingModel::class,
                'notifiable_id' => $rating->getId(),
                'data' => [
                    'rater_name' => $rater->name,
                    'rater_id' => $rater->id,
                    'book_id' => $bookModel->id,
                    'book_title' => $bookModel->title,
                    'score' => $rating->getScore(),
                    'rating_id' => $rating->getId(),
                ],
            ]);

            // Send email notification
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            Mail::to($author->email)->send(
                new BookRatingMail(
                    $rater->name,
                    $bookModel->title,
                    $rating->getScore(),
                    "{$frontendUrl}/book/" . ($bookModel->slug ? $bookModel->slug : $bookModel->id)
                )
            );
        } catch (\Exception $e) {
            Log::error('Failed to send book rating notification: ' . $e->getMessage());
        }
    }

    /**
     * Send notification when someone comments on an author's book (top-level comment)
     */
    public function notifyBookComment(Comment $comment): void
    {
        try {
            // Only notify for top-level comments (not replies)
            if ($comment->getParentId() !== null) {
                return;
            }

            $bookModel = BookModel::find($comment->getBookId());
            if (!$bookModel) {
                return;
            }

            $author = User::find($bookModel->author_id);
            if (!$author || !$author->isAuthor()) {
                return;
            }

            // Don't notify if user is commenting on their own book
            if ($comment->getUserId() === $author->id) {
                return;
            }

            $commenter = User::find($comment->getUserId());
            if (!$commenter) {
                return;
            }

            // Create notification
            Notification::create([
                'user_id' => $author->id,
                'type' => 'book_comment',
                'notifiable_type' => CommentModel::class,
                'notifiable_id' => $comment->getId(),
                'data' => [
                    'commenter_name' => $commenter->name,
                    'commenter_id' => $commenter->id,
                    'book_id' => $bookModel->id,
                    'book_title' => $bookModel->title,
                    'comment_id' => $comment->getId(),
                    'comment_content' => $comment->getContent(),
                ],
            ]);

            // Send email notification
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            Mail::to($author->email)->send(
                new BookCommentMail(
                    $commenter->name,
                    $bookModel->title,
                    $comment->getContent(),
                    "{$frontendUrl}/book/" . ($bookModel->slug ? $bookModel->slug : $bookModel->id)
                )
            );
        } catch (\Exception $e) {
            Log::error('Failed to send book comment notification: ' . $e->getMessage());
        }
    }

    /**
     * Send notification when someone likes a comment
     */
    public function notifyCommentLike(int $commentId, int $likerId): void
    {
        try {
            $commentModel = CommentModel::with(['user', 'book'])->find($commentId);
            if (!$commentModel) {
                return;
            }

            $commentOwner = $commentModel->user;
            if (!$commentOwner) {
                return;
            }

            // Don't notify if user is liking their own comment
            if ($likerId === $commentOwner->id) {
                return;
            }

            $liker = User::find($likerId);
            if (!$liker) {
                return;
            }

            $bookModel = $commentModel->book;
            if (!$bookModel) {
                return;
            }

            // Create notification
            Notification::create([
                'user_id' => $commentOwner->id,
                'type' => 'comment_like',
                'notifiable_type' => CommentModel::class,
                'notifiable_id' => $commentId,
                'data' => [
                    'liker_name' => $liker->name,
                    'liker_id' => $liker->id,
                    'book_id' => $bookModel->id,
                    'book_title' => $bookModel->title,
                    'comment_id' => $commentId,
                    'comment_content' => $commentModel->content,
                ],
            ]);

            // Send email notification
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            Mail::to($commentOwner->email)->send(
                new CommentLikeMail(
                    $liker->name,
                    $bookModel->title,
                    $commentModel->content,
                    "{$frontendUrl}/book/" . ($bookModel->slug ? $bookModel->slug : $bookModel->id)
                )
            );
        } catch (\Exception $e) {
            Log::error('Failed to send comment like notification: ' . $e->getMessage());
        }
    }
    /**
     * Send notification when someone is mentioned in a comment
     */
    public function notifyMention(Comment $comment, int $mentionedUserId): void
    {
        try {
            $user = User::find($mentionedUserId);
            if (!$user) {
                return;
            }

            // Don't notify if user is mentioning themselves (though unlikely via UI)
            if ($comment->getUserId() === $mentionedUserId) {
                return;
            }

            $commenter = User::find($comment->getUserId());
            if (!$commenter) {
                return;
            }

            $bookModel = BookModel::find($comment->getBookId());
            if (!$bookModel) {
                return;
            }

            // Create notification
            Notification::create([
                'user_id' => $user->id,
                'type' => 'mention',
                'notifiable_type' => CommentModel::class,
                'notifiable_id' => $comment->getId(),
                'data' => [
                    'mentioner_name' => $commenter->name,
                    'mentioner_id' => $commenter->id,
                    'book_id' => $bookModel->id,
                    'book_title' => $bookModel->title,
                    'comment_id' => $comment->getId(),
                    'comment_content' => $comment->getContent(),
                ],
            ]);

            // Optional: Send email
            // Skipping mail creation for now as I can't create Mail classes easily
            // But notification will appear in app
        } catch (\Exception $e) {
            Log::error('Failed to send mention notification: ' . $e->getMessage());
        }
    }
}

