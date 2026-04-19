<?php

namespace App\Application\UseCases\Follow;

use App\Domain\Follow\Entities\Follow;
use App\Domain\Follow\Repositories\FollowRepositoryInterface;

class CreateFollowUseCase
{
    public function __construct(
        private FollowRepositoryInterface $followRepository
    ) {}

    public function execute(int $followerId, int $followingId): Follow
    {
        // Check if already following
        $existing = $this->followRepository->findByFollowerIdAndFollowingId($followerId, $followingId);
        
        if ($existing) {
            return $existing;
        }

        $follow = new Follow(
            null,
            $followerId,
            $followingId
        );

        return $this->followRepository->create($follow);
    }
}

