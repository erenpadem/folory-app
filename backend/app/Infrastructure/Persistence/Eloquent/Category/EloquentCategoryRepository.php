<?php

namespace App\Infrastructure\Persistence\Eloquent\Category;

use App\Domain\Category\Entities\Category;
use App\Domain\Category\Repositories\CategoryRepositoryInterface;
use App\Models\Category as CategoryModel;

class EloquentCategoryRepository implements CategoryRepositoryInterface
{
    public function findById(int $id): ?Category
    {
        $model = CategoryModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findBySlug(string $slug): ?Category
    {
        $model = CategoryModel::where('slug', $slug)->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function create(Category $category): Category
    {
        $model = CategoryModel::create([
            'name' => $category->getName(),
            'slug' => $category->getSlug(),
            'description' => $category->getDescription(),
            'is_active' => $category->isActive(),
            'order' => $category->getOrder(),
        ]);

        return $this->toEntity($model);
    }

    public function update(Category $category): Category
    {
        $model = CategoryModel::findOrFail($category->getId());
        $model->update([
            'name' => $category->getName(),
            'slug' => $category->getSlug(),
            'description' => $category->getDescription(),
            'is_active' => $category->isActive(),
            'order' => $category->getOrder(),
        ]);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        return CategoryModel::findOrFail($id)->delete();
    }

    public function paginate(int $perPage = 15)
    {
        return CategoryModel::paginate($perPage);
    }

    public function findAllActive(): array
    {
        $models = CategoryModel::where('is_active', true)->orderBy('order')->get();
        return $models->map(fn($model) => $this->toEntity($model))->toArray();
    }

    private function toEntity(CategoryModel $model): Category
    {
        return new Category(
            $model->id,
            $model->name,
            $model->slug,
            $model->is_active,
            $model->order,
            $model->description,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null
        );
    }
}

