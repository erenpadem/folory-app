<?php

namespace App\Domain\Badge\Repositories;

use App\Domain\Badge\Entities\Badge;

interface BadgeRepositoryInterface
{
    public function findById(int $id): ?Badge;
    public function findBySlug(string $slug): ?Badge;
    public function create(Badge $badge): Badge;
    public function update(Badge $badge): Badge;
    public function delete(int $id): bool;
    public function findAll(): array;
    public function assignToUser(int $badgeId, int $userId): bool;
    public function removeFromUser(int $badgeId, int $userId): bool;
    public function getUserBadges(int $userId): array;
}

