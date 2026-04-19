<?php

namespace App\Infrastructure\Persistence\Eloquent\Draft;

use App\Domain\Draft\Entities\Draft;
use App\Domain\Draft\Repositories\DraftRepositoryInterface;
use App\Models\Draft as DraftModel;

class EloquentDraftRepository implements DraftRepositoryInterface
{
    public function findById(int $id): ?Draft
    {
        $model = DraftModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByPageId(int $pageId): ?Draft
    {
        $model = DraftModel::where('page_id', $pageId)->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function create(Draft $draft): Draft
    {
        $model = DraftModel::create([
            'page_id' => $draft->getPageId(),
            'content' => $draft->getContent(),
        ]);

        return $this->toEntity($model);
    }

    public function update(Draft $draft): Draft
    {
        $model = DraftModel::findOrFail($draft->getId());
        $model->update([
            'content' => $draft->getContent(),
        ]);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        return DraftModel::findOrFail($id)->delete();
    }

    public function deleteByPageId(int $pageId): bool
    {
        return DraftModel::where('page_id', $pageId)->delete();
    }

    private function toEntity(DraftModel $model): Draft
    {
        return new Draft(
            $model->id,
            $model->page_id,
            $model->content,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null
        );
    }
}

