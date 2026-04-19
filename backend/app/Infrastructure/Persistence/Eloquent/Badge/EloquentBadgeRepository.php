<?php

namespace App\Infrastructure\Persistence\Eloquent\Badge;

use App\Domain\Badge\Entities\Badge;
use App\Domain\Badge\Repositories\BadgeRepositoryInterface;
use App\Models\Badge as BadgeModel;
use App\Models\User;

class EloquentBadgeRepository implements BadgeRepositoryInterface
{
    public function findById(int $id): ?Badge
    {
        $model = BadgeModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findBySlug(string $slug): ?Badge
    {
        $model = BadgeModel::where('slug', $slug)->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function create(Badge $badge): Badge
    {
        $model = BadgeModel::create([
            'name' => $badge->getName(),
            'slug' => $badge->getSlug(),
            'description' => $badge->getDescription(),
            'icon' => $badge->getIcon(),
            'type' => $badge->getType(),
        ]);

        return $this->toEntity($model);
    }

    public function update(Badge $badge): Badge
    {
        $model = BadgeModel::findOrFail($badge->getId());
        $model->update([
            'name' => $badge->getName(),
            'slug' => $badge->getSlug(),
            'description' => $badge->getDescription(),
            'icon' => $badge->getIcon(),
            'type' => $badge->getType(),
        ]);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        return BadgeModel::findOrFail($id)->delete();
    }

    public function findAll(): array
    {
        $models = BadgeModel::all();
        return $models->map(fn($model) => $this->toEntity($model))->toArray();
    }

    public function assignToUser(int $badgeId, int $userId): bool
    {
        $user = User::findOrFail($userId);
        $badge = BadgeModel::findOrFail($badgeId);
        
        if (!$user->badges()->where('badge_id', $badgeId)->exists()) {
            $user->badges()->attach($badgeId);
            return true;
        }
        
        return false;
    }

    public function removeFromUser(int $badgeId, int $userId): bool
    {
        $user = User::findOrFail($userId);
        $user->badges()->detach($badgeId);
        return true;
    }

    public function getUserBadges(int $userId): array
    {
        $user = User::findOrFail($userId);
        $badges = $user->badges;
        return $badges->map(fn($badge) => $this->toEntity($badge))->toArray();
    }

    private function toEntity(BadgeModel $model): Badge
    {
        return new Badge(
            $model->id,
            $model->name,
            $model->slug,
            $model->type,
            $model->description,
            $model->icon,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null
        );
    }
}

