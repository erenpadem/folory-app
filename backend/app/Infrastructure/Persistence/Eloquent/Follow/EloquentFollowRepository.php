<?php

namespace App\Infrastructure\Persistence\Eloquent\Follow;

use App\Domain\Follow\Entities\Follow;
use App\Domain\Follow\Repositories\FollowRepositoryInterface;
use App\Models\Follow as FollowModel;

class EloquentFollowRepository implements FollowRepositoryInterface
{
    public function findById(int $id): ?Follow
    {
        $model = FollowModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByFollowerIdAndFollowingId(int $followerId, int $followingId): ?Follow
    {
        $model = FollowModel::where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function findByFollowerId(int $followerId, int $perPage = 15)
    {
        return FollowModel::where('follower_id', $followerId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function findByFollowingId(int $followingId, int $perPage = 15)
    {
        return FollowModel::where('following_id', $followingId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function create(Follow $follow): Follow
    {
        $model = FollowModel::create([
            'follower_id' => $follow->getFollowerId(),
            'following_id' => $follow->getFollowingId(),
        ]);

        return $this->toEntity($model);
    }

    public function delete(int $id): bool
    {
        return FollowModel::findOrFail($id)->delete();
    }

    public function deleteByFollowerIdAndFollowingId(int $followerId, int $followingId): bool
    {
        return FollowModel::where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->delete();
    }

    public function getFollowerCount(int $userId): int
    {
        return FollowModel::where('following_id', $userId)->count();
    }

    public function getFollowingCount(int $userId): int
    {
        return FollowModel::where('follower_id', $userId)->count();
    }

    private function toEntity(FollowModel $model): Follow
    {
        return new Follow(
            $model->id,
            $model->follower_id,
            $model->following_id,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null
        );
    }
}

