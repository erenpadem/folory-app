<?php

namespace App\Application\UseCases\Bookmark;

use App\Domain\Bookmark\Repositories\BookmarkRepositoryInterface;

class DeleteBookmarkUseCase
{
    public function __construct(
        private BookmarkRepositoryInterface $bookmarkRepository
    ) {}

    public function execute(int $userId, int $pageId): bool
    {
        return $this->bookmarkRepository->deleteByUserIdAndPageId($userId, $pageId);
    }
}

