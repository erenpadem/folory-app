<?php

namespace App\Domain\Follow\Repositories;

use App\Domain\Follow\Entities\Follow;

interface FollowRepositoryInterface
{
    public function findById(int $id): ?Follow;
    public function findByFollowerIdAndFollowingId(int $followerId, int $followingId): ?Follow;
    public function findByFollowerId(int $followerId, int $perPage = 15);
    public function findByFollowingId(int $followingId, int $perPage = 15);
    public function create(Follow $follow): Follow;
    public function delete(int $id): bool;
    public function deleteByFollowerIdAndFollowingId(int $followerId, int $followingId): bool;
    public function getFollowerCount(int $userId): int;
    public function getFollowingCount(int $userId): int;
}

