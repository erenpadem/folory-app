<?php

namespace App\Application\UseCases\User;

use App\Domain\User\Entities\User;
use App\Domain\User\Repositories\UserRepositoryInterface;

class GetUserUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    public function execute(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }
}

