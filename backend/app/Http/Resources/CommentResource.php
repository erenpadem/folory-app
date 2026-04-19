<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Load book and user relationships if available
        $book = null;
        $user = null;
        try {
            if ($this->resource->getId()) {
                $model = \App\Models\Comment::with(['book', 'user'])->find($this->resource->getId());
                if ($model) {
                    $book = $model->book ? [
                        'id' => $model->book->id,
                        'title' => $model->book->title,
                        'slug' => $model->book->slug ? $model->book->slug : null,
                    ] : null;
                    $user = $model->user ? [
                        'id' => $model->user->id,
                        'name' => $model->user->name,
                        'avatar' => $model->user->avatar,
                    ] : null;
                }
            }
        } catch (\Exception $e) {
            // If relationships fail to load, continue without them
            \Log::warning('Failed to load comment relationships: ' . $e->getMessage());
        }

        // Get likes count and check if current user liked it
        $likesCount = 0;
        $isLiked = false;
        try {
            if ($this->resource->getId()) {
                $model = \App\Models\Comment::find($this->resource->getId());
                if ($model) {
                    $likesCount = $model->likesCount();
                    // Check if authenticated user liked it
                    if (auth()->check()) {
                        $isLiked = $model->isLikedBy(auth()->id());
                    }
                }
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to load comment likes: ' . $e->getMessage());
        }

        return [
            'id' => $this->resource->getId(),
            'user_id' => $this->resource->getUserId(),
            'book_id' => $this->resource->getBookId(),
            'parent_id' => $this->resource->getParentId(),
            'content' => $this->resource->getContent(),
            'depth' => $this->resource->getDepth(),
            'mentions' => $this->resource->getMentions(),
            'sections' => $this->resource->getSections(),
            'pages' => $this->resource->getPages(),
            'authors' => $this->resource->getAuthors(),
            'book' => $book,
            'user' => $user,
            'likes_count' => $likesCount,
            'is_liked' => $isLiked,
            'created_at' => $this->resource->getCreatedAt() ? $this->resource->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->resource->getUpdatedAt() ? $this->resource->getUpdatedAt()->format('Y-m-d H:i:s') : null,
        ];
    }
}

