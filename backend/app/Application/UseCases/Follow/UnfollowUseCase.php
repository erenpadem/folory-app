<?php

namespace App\Application\UseCases\Follow;

use App\Domain\Follow\Repositories\FollowRepositoryInterface;

class UnfollowUseCase
{
    public function __construct(
        private FollowRepositoryInterface $followRepository
    ) {}

    public function execute(int $followerId, int $followingId): bool
    {
        return $this->followRepository->deleteByFollowerIdAndFollowingId($followerId, $followingId);
    }
}

