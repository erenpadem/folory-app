<?php

namespace App\Application\UseCases\Category;

use App\Domain\Category\Repositories\CategoryRepositoryInterface;

class ListCategoriesUseCase
{
    public function __construct(
        private CategoryRepositoryInterface $categoryRepository
    ) {}

    public function execute(bool $activeOnly = false): array
    {
        if ($activeOnly) {
            return $this->categoryRepository->findAllActive();
        }
        
        return $this->categoryRepository->paginate(100)->items();
    }
}

