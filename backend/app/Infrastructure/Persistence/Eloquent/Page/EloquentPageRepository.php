<?php

namespace App\Infrastructure\Persistence\Eloquent\Page;

use App\Domain\Page\Entities\Page;
use App\Domain\Page\Repositories\PageRepositoryInterface;
use App\Models\Page as PageModel;
use Illuminate\Support\Facades\DB;

class EloquentPageRepository implements PageRepositoryInterface
{
    public function findById(int $id): ?Page
    {
        $model = PageModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findBySectionId(int $sectionId): array
    {
        $models = PageModel::where('section_id', $sectionId)
            ->orderBy('order')
            ->get();
        return $models->map(fn($model) => $this->toEntity($model))->toArray();
    }

    public function create(Page $page): Page
    {
        // Unique (section_id, order): idempotent create for draft+publish retries
        $model = PageModel::updateOrCreate(
            [
                'section_id' => $page->getSectionId(),
                'order' => $page->getOrder(),
            ],
            [
                'content' => $page->getContent(),
            ]
        );

        return $this->toEntity($model);
    }

    public function update(Page $page): Page
    {
        $model = PageModel::findOrFail($page->getId());
        $sectionId = $model->section_id;
        $newOrder = $page->getOrder();
        $oldOrder = (int) $model->order;

        DB::transaction(function () use ($model, $page, $sectionId, $newOrder, $oldOrder) {
            if ($newOrder !== $oldOrder) {
                $other = PageModel::query()
                    ->where('section_id', $sectionId)
                    ->where('order', $newOrder)
                    ->where('id', '!=', $model->id)
                    ->lockForUpdate()
                    ->first();

                if ($other) {
                    $temp = $this->nextFreeOrderBelowZero($sectionId);
                    $model->update(['order' => $temp]);
                    $other->update(['order' => $oldOrder]);
                }
            }

            $model->refresh();
            $model->update([
                'content' => $page->getContent(),
                'order' => $newOrder,
            ]);
        });

        return $this->toEntity($model->fresh());
    }

    /**
     * Reserve a temporary order slot outside normal 0..n-1 range so we can swap
     * without violating unique (section_id, order).
     */
    private function nextFreeOrderBelowZero(int $sectionId): int
    {
        $candidate = -1;
        while (
            PageModel::query()
                ->where('section_id', $sectionId)
                ->where('order', $candidate)
                ->exists()
        ) {
            $candidate--;
        }

        return $candidate;
    }

    public function delete(int $id): bool
    {
        return PageModel::findOrFail($id)->delete();
    }

    public function deleteBySectionId(int $sectionId): bool
    {
        return PageModel::where('section_id', $sectionId)->delete();
    }

    private function toEntity(PageModel $model): Page
    {
        return new Page(
            $model->id,
            $model->section_id,
            $model->content,
            $model->order,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null
        );
    }
}

