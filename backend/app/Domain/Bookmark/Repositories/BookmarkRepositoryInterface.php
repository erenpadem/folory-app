<?php

namespace App\Domain\Bookmark\Repositories;

use App\Domain\Bookmark\Entities\Bookmark;

interface BookmarkRepositoryInterface
{
    public function findById(int $id): ?Bookmark;
    public function findByUserId(int $userId, int $perPage = 15);
    public function findByUserIdAndPageId(int $userId, int $pageId): ?Bookmark;
    public function create(Bookmark $bookmark): Bookmark;
    public function delete(int $id): bool;
    public function deleteByUserIdAndPageId(int $userId, int $pageId): bool;
}

