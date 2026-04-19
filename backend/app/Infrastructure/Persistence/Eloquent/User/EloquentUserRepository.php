<?php

namespace App\Infrastructure\Persistence\Eloquent\User;

use App\Domain\User\Entities\User;
use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Models\User as UserModel;
use Illuminate\Support\Facades\Hash;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        $model = UserModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $model = UserModel::where('email', $email)->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function findByUsername(string $username): ?User
    {
        $model = UserModel::where('username', $username)->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function create(User $user): User
    {
        $model = UserModel::create([
            'name' => $user->getName(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'password' => Hash::make($user->getPassword()),
            'role' => $user->getRole(),
            'is_verified' => $user->isVerified(),
            'avatar' => $user->getAvatar(),
            'cover_image' => $user->getCoverImage(),
            'bio' => $user->getBio(),
        ]);

        return $this->toEntity($model);
    }

    public function update(User $user): User
    {
        $model = UserModel::findOrFail($user->getId());
        $model->update([
            'name' => $user->getName(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
            'is_verified' => $user->isVerified(),
            'avatar' => $user->getAvatar(),
            'cover_image' => $user->getCoverImage(),
            'bio' => $user->getBio(),
        ]);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        return UserModel::findOrFail($id)->delete();
    }

    public function paginate(int $perPage = 15)
    {
        return UserModel::paginate($perPage);
    }

    public function findByIds(array $ids): array
    {
        $models = UserModel::whereIn('id', $ids)->get();
        return $models->map(fn($model) => $this->toEntity($model))->toArray();
    }

    private function toEntity(UserModel $model): User
    {
        return new User(
            $model->id,
            $model->name,
            $model->username,
            $model->email,
            $model->password,
            $model->role,
            $model->is_verified,
            $model->avatar,
            $model->cover_image,
            $model->bio,
            $model->email_verified_at ? new \DateTime($model->email_verified_at) : null,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null,
            $model->deleted_at ? new \DateTime($model->deleted_at) : null
        );
    }
}

