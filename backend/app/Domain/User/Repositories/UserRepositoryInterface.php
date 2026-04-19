<?php

namespace App\Domain\User\Repositories;

use App\Domain\User\Entities\User;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function findByEmail(string $email): ?User;
    public function findByUsername(string $username): ?User;
    public function create(User $user): User;
    public function update(User $user): User;
    public function delete(int $id): bool;
    public function paginate(int $perPage = 15);
    public function findByIds(array $ids): array;
}

