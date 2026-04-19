<?php

namespace App\Application\UseCases\Category;

use App\Domain\Category\Entities\Category;
use App\Domain\Category\Repositories\CategoryRepositoryInterface;
use Illuminate\Support\Str;

class CreateCategoryUseCase
{
    public function __construct(
        private CategoryRepositoryInterface $categoryRepository
    ) {}

    public function execute(array $data): Category
    {
        $category = new Category(
            null,
            $data['name'],
            $data['slug'] ?? Str::slug($data['name']),
            $data['is_active'] ?? true,
            $data['order'] ?? 0,
            $data['description'] ?? null
        );

        return $this->categoryRepository->create($category);
    }
}

