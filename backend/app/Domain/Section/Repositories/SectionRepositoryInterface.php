<?php

namespace App\Domain\Section\Repositories;

use App\Domain\Section\Entities\Section;

interface SectionRepositoryInterface
{
    public function findById(int $id): ?Section;
    public function findByBookId(int $bookId): array;
    public function create(Section $section): Section;
    public function update(Section $section): Section;
    public function delete(int $id): bool;
    public function updateTotalPage(int $id, int $totalPage): void;
}

