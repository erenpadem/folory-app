<?php

namespace App\Domain\Category\Repositories;

use App\Domain\Category\Entities\Category;

interface CategoryRepositoryInterface
{
    public function findById(int $id): ?Category;
    public function findBySlug(string $slug): ?Category;
    public function create(Category $category): Category;
    public function update(Category $category): Category;
    public function delete(int $id): bool;
    public function paginate(int $perPage = 15);
    public function findAllActive(): array;
}

