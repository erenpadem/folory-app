<?php

namespace App\Domain\Comment\Repositories;

use App\Domain\Comment\Entities\Comment;

interface CommentRepositoryInterface
{
    public function findById(int $id): ?Comment;
    public function findByBookId(int $bookId, int $perPage = 15);
    public function findByUserId(int $userId, int $perPage = 15);
    public function findByParentId(int $parentId): array;
    public function create(Comment $comment): Comment;
    public function update(Comment $comment): Comment;
    public function delete(int $id): bool;
    public function deleteByBookId(int $bookId): bool;
}

