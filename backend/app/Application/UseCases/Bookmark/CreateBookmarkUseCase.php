<?php

namespace App\Application\UseCases\Bookmark;

use App\Domain\Bookmark\Entities\Bookmark;
use App\Domain\Bookmark\Repositories\BookmarkRepositoryInterface;

class CreateBookmarkUseCase
{
    public function __construct(
        private BookmarkRepositoryInterface $bookmarkRepository
    ) {}

    public function execute(int $userId, int $pageId): Bookmark
    {
        // Check if bookmark already exists
        $existing = $this->bookmarkRepository->findByUserIdAndPageId($userId, $pageId);
        
        if ($existing) {
            return $existing;
        }

        $bookmark = new Bookmark(
            null,
            $userId,
            $pageId
        );

        return $this->bookmarkRepository->create($bookmark);
    }
}

