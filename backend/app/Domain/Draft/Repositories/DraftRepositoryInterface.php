<?php

namespace App\Domain\Draft\Repositories;

use App\Domain\Draft\Entities\Draft;

interface DraftRepositoryInterface
{
    public function findById(int $id): ?Draft;
    public function findByPageId(int $pageId): ?Draft;
    public function create(Draft $draft): Draft;
    public function update(Draft $draft): Draft;
    public function delete(int $id): bool;
    public function deleteByPageId(int $pageId): bool;
}

