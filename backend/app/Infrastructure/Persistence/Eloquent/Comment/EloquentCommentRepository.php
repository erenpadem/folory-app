<?php

namespace App\Infrastructure\Persistence\Eloquent\Comment;

use App\Domain\Comment\Entities\Comment;
use App\Domain\Comment\Repositories\CommentRepositoryInterface;
use App\Models\Comment as CommentModel;

class EloquentCommentRepository implements CommentRepositoryInterface
{
    public function findById(int $id): ?Comment
    {
        $model = CommentModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByBookId(int $bookId, int $perPage = 15)
    {
        return CommentModel::where('book_id', $bookId)
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function findByUserId(int $userId, int $perPage = 15)
    {
        return CommentModel::where('user_id', $userId)
            ->with(['book', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function findByParentId(int $parentId): array
    {
        $models = CommentModel::where('parent_id', $parentId)
            ->orderBy('created_at', 'asc')
            ->get();
        return $models->map(fn($model) => $this->toEntity($model))->toArray();
    }

    public function create(Comment $comment): Comment
    {
        $model = CommentModel::create([
            'user_id' => $comment->getUserId(),
            'book_id' => $comment->getBookId(),
            'parent_id' => $comment->getParentId(),
            'content' => $comment->getContent(),
            'depth' => $comment->getDepth(),
            'mentions' => $comment->getMentions(),
            'sections' => $comment->getSections(),
        ]);

        return $this->toEntity($model);
    }

    public function update(Comment $comment): Comment
    {
        $model = CommentModel::findOrFail($comment->getId());
        $model->update([
            'content' => $comment->getContent(),
            'mentions' => $comment->getMentions(),
            'sections' => $comment->getSections(),
            'pages' => $comment->getPages(),
            'authors' => $comment->getAuthors(),
        ]);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        return CommentModel::findOrFail($id)->delete();
    }

    public function deleteByBookId(int $bookId): bool
    {
        return CommentModel::where('book_id', $bookId)->delete();
    }

    private function toEntity(CommentModel $model): Comment
    {
        return new Comment(
            $model->id,
            $model->user_id,
            $model->book_id,
            $model->content,
            $model->parent_id,
            $model->depth,
            $model->mentions,
            $model->sections,
            $model->pages,
            $model->authors,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null
        );
    }
}

