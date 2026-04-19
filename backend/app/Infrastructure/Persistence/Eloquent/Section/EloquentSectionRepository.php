<?php

namespace App\Infrastructure\Persistence\Eloquent\Section;

use App\Domain\Section\Entities\Section;
use App\Domain\Section\Repositories\SectionRepositoryInterface;
use App\Models\Section as SectionModel;

class EloquentSectionRepository implements SectionRepositoryInterface
{
    public function findById(int $id): ?Section
    {
        $model = SectionModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByBookId(int $bookId): array
    {
        $models = SectionModel::where('book_id', $bookId)
            ->orderBy('order')
            ->get();
        return $models->map(fn($model) => $this->toEntity($model))->toArray();
    }

    public function create(Section $section): Section
    {
        $model = SectionModel::create([
            'book_id' => $section->getBookId(),
            'title' => $section->getTitle(),
            'order' => $section->getOrder(),
            'total_page' => $section->getTotalPage(),
            'is_visible' => $section->isVisible(),
        ]);

        return $this->toEntity($model);
    }

    public function update(Section $section): Section
    {
        $model = SectionModel::findOrFail($section->getId());
        $model->update([
            'title' => $section->getTitle(),
            'order' => $section->getOrder(),
            'total_page' => $section->getTotalPage(),
            'is_visible' => $section->isVisible(),
        ]);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        return SectionModel::findOrFail($id)->delete();
    }

    public function updateTotalPage(int $id, int $totalPage): void
    {
        SectionModel::where('id', $id)->update(['total_page' => $totalPage]);
    }

    private function toEntity(SectionModel $model): Section
    {
        return new Section(
            $model->id,
            $model->book_id,
            $model->title,
            $model->order,
            $model->total_page,
            $model->is_visible,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null
        );
    }
}

