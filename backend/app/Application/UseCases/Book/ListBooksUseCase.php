<?php

namespace App\Application\UseCases\Book;

use App\Domain\Book\Repositories\BookRepositoryInterface;

class ListBooksUseCase
{
    public function __construct(
        private BookRepositoryInterface $bookRepository
    ) {}

    public function execute(int $perPage = 15, array $filters = [])
    {
        return $this->bookRepository->paginate($perPage, $filters);
    }
}

