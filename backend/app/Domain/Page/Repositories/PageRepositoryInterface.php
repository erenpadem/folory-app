<?php

namespace App\Domain\Page\Repositories;

use App\Domain\Page\Entities\Page;

interface PageRepositoryInterface
{
    public function findById(int $id): ?Page;
    public function findBySectionId(int $sectionId): array;
    public function create(Page $page): Page;
    public function update(Page $page): Page;
    public function delete(int $id): bool;
    public function deleteBySectionId(int $sectionId): bool;
}

