<?php

namespace App\Application\UseCases\Comment;

use App\Domain\Comment\Entities\Comment;
use App\Domain\Comment\Repositories\CommentRepositoryInterface;

class CreateCommentUseCase
{
    public function __construct(
        private CommentRepositoryInterface $commentRepository
    ) {}

    public function execute(int $userId, int $bookId, string $content, ?int $parentId = null): Comment
    {
        $depth = 0;
        if ($parentId) {
            $parent = $this->commentRepository->findById($parentId);
            if ($parent) {
                $depth = $parent->getDepth() + 1;
            }
        }

        $comment = new Comment(
            null,
            $userId,
            $bookId,
            $content,
            $parentId,
            $depth
        );

        return $this->commentRepository->create($comment);
    }
}

