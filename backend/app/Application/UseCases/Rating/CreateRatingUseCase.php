<?php

namespace App\Application\UseCases\Rating;

use App\Domain\Rating\Entities\Rating;
use App\Domain\Rating\Repositories\RatingRepositoryInterface;

class CreateRatingUseCase
{
    public function __construct(
        private RatingRepositoryInterface $ratingRepository
    ) {}

    public function execute(int $userId, int $bookId, int $score): Rating
    {
        // Check if user already rated this book
        $existingRating = $this->ratingRepository->findByUserIdAndBookId($userId, $bookId);
        
        if ($existingRating) {
            $existingRating->updateScore($score);
            return $this->ratingRepository->update($existingRating);
        }

        $rating = new Rating(
            null,
            $userId,
            $bookId,
            $score
        );

        return $this->ratingRepository->create($rating);
    }
}

