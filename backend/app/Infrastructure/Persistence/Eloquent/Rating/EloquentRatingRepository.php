<?php

namespace App\Infrastructure\Persistence\Eloquent\Rating;

use App\Domain\Rating\Entities\Rating;
use App\Domain\Rating\Repositories\RatingRepositoryInterface;
use App\Models\Rating as RatingModel;

class EloquentRatingRepository implements RatingRepositoryInterface
{
    public function findById(int $id): ?Rating
    {
        $model = RatingModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByBookId(int $bookId, int $perPage = 15)
    {
        return RatingModel::with('user')
            ->where('book_id', $bookId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function findByUserIdAndBookId(int $userId, int $bookId): ?Rating
    {
        $model = RatingModel::where('user_id', $userId)
            ->where('book_id', $bookId)
            ->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function create(Rating $rating): Rating
    {
        $model = RatingModel::create([
            'user_id' => $rating->getUserId(),
            'book_id' => $rating->getBookId(),
            'score' => $rating->getScore(),
        ]);

        return $this->toEntity($model);
    }

    public function update(Rating $rating): Rating
    {
        $model = RatingModel::findOrFail($rating->getId());
        $model->update([
            'score' => $rating->getScore(),
        ]);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        return RatingModel::findOrFail($id)->delete();
    }

    public function getAverageRatingByBookId(int $bookId): float
    {
        return (float) RatingModel::where('book_id', $bookId)->avg('score') ?? 0.0;
    }

    public function toEntity(RatingModel $model): Rating
    {
        return new Rating(
            $model->id,
            $model->user_id,
            $model->book_id,
            $model->score,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null
        );
    }
}

