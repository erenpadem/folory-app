<?php

namespace App\Infrastructure\Persistence\Eloquent\SectionReading;

use App\Domain\SectionReading\Entities\SectionReading;
use App\Domain\SectionReading\Repositories\SectionReadingRepositoryInterface;
use App\Models\SectionReading as SectionReadingModel;

class EloquentSectionReadingRepository implements SectionReadingRepositoryInterface
{
    public function findById(int $id): ?SectionReading
    {
        $model = SectionReadingModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByUserIdAndSectionId(int $userId, int $sectionId): ?SectionReading
    {
        $model = SectionReadingModel::where('user_id', $userId)
            ->where('section_id', $sectionId)
            ->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function findByUserId(int $userId, int $perPage = 15)
    {
        return SectionReadingModel::where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);
    }

    public function create(SectionReading $sectionReading): SectionReading
    {
        $model = SectionReadingModel::create([
            'user_id' => $sectionReading->getUserId(),
            'section_id' => $sectionReading->getSectionId(),
            'last_page_id' => $sectionReading->getLastPageId(),
            'progress_percentage' => $sectionReading->getProgressPercentage(),
        ]);

        return $this->toEntity($model);
    }

    public function update(SectionReading $sectionReading): SectionReading
    {
        $model = SectionReadingModel::findOrFail($sectionReading->getId());
        $model->update([
            'last_page_id' => $sectionReading->getLastPageId(),
            'progress_percentage' => $sectionReading->getProgressPercentage(),
        ]);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        return SectionReadingModel::findOrFail($id)->delete();
    }

    private function toEntity(SectionReadingModel $model): SectionReading
    {
        return new SectionReading(
            $model->id,
            $model->user_id,
            $model->section_id,
            (float) $model->progress_percentage,
            $model->last_page_id,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null
        );
    }
}

