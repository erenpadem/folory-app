<?php

namespace App\Http\Resources;

use App\Models\Book as BookModel;
use App\Models\Comment as CommentModel;
use App\Models\User as UserModel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    /** @var array<int, array<string, mixed>|null> */
    private static array $userCache = [];

    /** @var array<int, array<string, mixed>|null> */
    private static array $bookCache = [];

    public function toArray(Request $request): array
    {
        $book = $this->resolveBook();
        $user = $this->resolveUser();

        // Get likes count and check if current user liked it
        $likesCount = 0;
        $isLiked = false;
        try {
            $commentId = $this->resource->getId();
            if ($commentId) {
                $model = CommentModel::find($commentId);
                if ($model) {
                    $likesCount = $model->likesCount();
                    if (auth()->check()) {
                        $isLiked = $model->isLikedBy((int) auth()->id());
                    }
                }
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to load comment likes: '.$e->getMessage());
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

    /**
     * @return array<string, mixed>|null
     */
    private function resolveUser(): ?array
    {
        $userId = (int) $this->resource->getUserId();
        if ($userId <= 0) {
            return null;
        }

        if (array_key_exists($userId, self::$userCache)) {
            return self::$userCache[$userId];
        }

        $userModel = UserModel::query()->find($userId);
        if (! $userModel) {
            self::$userCache[$userId] = null;

            return null;
        }

        self::$userCache[$userId] = [
            'id' => $userModel->id,
            'name' => $userModel->name,
            'username' => $userModel->username,
            'avatar' => $userModel->avatar,
        ];

        return self::$userCache[$userId];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function resolveBook(): ?array
    {
        $bookId = (int) $this->resource->getBookId();
        if ($bookId <= 0) {
            return null;
        }

        if (array_key_exists($bookId, self::$bookCache)) {
            return self::$bookCache[$bookId];
        }

        $bookModel = BookModel::query()->find($bookId);
        if (! $bookModel) {
            self::$bookCache[$bookId] = null;

            return null;
        }

        self::$bookCache[$bookId] = [
            'id' => $bookModel->id,
            'title' => $bookModel->title,
            'slug' => $bookModel->slug ?: null,
        ];

        return self::$bookCache[$bookId];
    }
}

