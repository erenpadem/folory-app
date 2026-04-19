<?php

namespace App\Domain\BookReading\Repositories;

use App\Domain\BookReading\Entities\BookReading;

interface BookReadingRepositoryInterface
{
    public function findById(int $id): ?BookReading;
    public function findByUserIdAndBookId(int $userId, int $bookId): ?BookReading;
    public function findByUserId(int $userId, int $perPage = 15);
    public function create(BookReading $bookReading): BookReading;
    public function update(BookReading $bookReading): BookReading;
    public function delete(int $id): bool;
}

