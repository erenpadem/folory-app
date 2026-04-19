<?php

namespace App\Application\UseCases\Book;

use App\Domain\Book\Entities\Book;
use App\Domain\Book\Repositories\BookRepositoryInterface;

class GetBookUseCase
{
    public function __construct(
        private BookRepositoryInterface $bookRepository
    ) {}

    public function execute(int $id): ?Book
    {
        return $this->bookRepository->findById($id);
    }

    public function executeBySlug(string $slug): ?Book
    {
        return $this->bookRepository->findBySlug($slug);
    }
}

