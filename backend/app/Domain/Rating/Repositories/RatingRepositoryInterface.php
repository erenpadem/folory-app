<?php

namespace App\Domain\Rating\Repositories;

use App\Domain\Rating\Entities\Rating;

interface RatingRepositoryInterface
{
    public function findById(int $id): ?Rating;
    public function findByBookId(int $bookId, int $perPage = 15);
    public function findByUserIdAndBookId(int $userId, int $bookId): ?Rating;
    public function create(Rating $rating): Rating;
    public function update(Rating $rating): Rating;
    public function delete(int $id): bool;
    public function getAverageRatingByBookId(int $bookId): float;
}

