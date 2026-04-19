<?php

namespace App\Application\UseCases\Book;

use App\Domain\Book\Repositories\BookRepositoryInterface;

class DeleteBookUseCase
{
    public function __construct(
        private BookRepositoryInterface $bookRepository
    ) {}

    public function execute(int $id): bool
    {
        return $this->bookRepository->delete($id);
    }
}

