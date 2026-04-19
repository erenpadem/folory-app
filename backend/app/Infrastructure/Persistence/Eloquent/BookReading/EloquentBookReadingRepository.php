<?php

namespace App\Infrastructure\Persistence\Eloquent\BookReading;

use App\Domain\BookReading\Entities\BookReading;
use App\Domain\BookReading\Repositories\BookReadingRepositoryInterface;
use App\Models\BookReading as BookReadingModel;

class EloquentBookReadingRepository implements BookReadingRepositoryInterface
{
    public function findById(int $id): ?BookReading
    {
        $model = BookReadingModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByUserIdAndBookId(int $userId, int $bookId): ?BookReading
    {
        $model = BookReadingModel::where('user_id', $userId)
            ->where('book_id', $bookId)
            ->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function findByUserId(int $userId, int $perPage = 15)
    {
        return BookReadingModel::where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);
    }

    public function create(BookReading $bookReading): BookReading
    {
        $model = BookReadingModel::create([
            'user_id' => $bookReading->getUserId(),
            'book_id' => $bookReading->getBookId(),
            'last_section_id' => $bookReading->getLastSectionId(),
            'last_page_id' => $bookReading->getLastPageId(),
            'progress_percentage' => $bookReading->getProgressPercentage(),
        ]);

        return $this->toEntity($model);
    }

    public function update(BookReading $bookReading): BookReading
    {
        $model = BookReadingModel::findOrFail($bookReading->getId());
        $model->update([
            'last_section_id' => $bookReading->getLastSectionId(),
            'last_page_id' => $bookReading->getLastPageId(),
            'progress_percentage' => $bookReading->getProgressPercentage(),
        ]);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        return BookReadingModel::findOrFail($id)->delete();
    }

    private function toEntity(BookReadingModel $model): BookReading
    {
        return new BookReading(
            $model->id,
            $model->user_id,
            $model->book_id,
            (float) $model->progress_percentage,
            $model->last_section_id,
            $model->last_page_id,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null
        );
    }
}

