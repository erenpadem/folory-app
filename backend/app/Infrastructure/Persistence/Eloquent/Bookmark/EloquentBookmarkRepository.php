<?php

namespace App\Infrastructure\Persistence\Eloquent\Bookmark;

use App\Domain\Bookmark\Entities\Bookmark;
use App\Domain\Bookmark\Repositories\BookmarkRepositoryInterface;
use App\Models\Bookmark as BookmarkModel;

class EloquentBookmarkRepository implements BookmarkRepositoryInterface
{
    public function findById(int $id): ?Bookmark
    {
        $model = BookmarkModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByUserId(int $userId, int $perPage = 15)
    {
        return BookmarkModel::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function findByUserIdAndPageId(int $userId, int $pageId): ?Bookmark
    {
        $model = BookmarkModel::where('user_id', $userId)
            ->where('page_id', $pageId)
            ->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function create(Bookmark $bookmark): Bookmark
    {
        $model = BookmarkModel::create([
            'user_id' => $bookmark->getUserId(),
            'page_id' => $bookmark->getPageId(),
        ]);

        return $this->toEntity($model);
    }

    public function delete(int $id): bool
    {
        return BookmarkModel::findOrFail($id)->delete();
    }

    public function deleteByUserIdAndPageId(int $userId, int $pageId): bool
    {
        return BookmarkModel::where('user_id', $userId)
            ->where('page_id', $pageId)
            ->delete();
    }

    private function toEntity(BookmarkModel $model): Bookmark
    {
        return new Bookmark(
            $model->id,
            $model->user_id,
            $model->page_id,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null
        );
    }
}

