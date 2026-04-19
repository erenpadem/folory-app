<?php

namespace App\Application\UseCases\Book;

use App\Domain\Book\Entities\Book;
use App\Domain\Book\Repositories\BookRepositoryInterface;

class CreateBookUseCase
{
    public function __construct(
        private BookRepositoryInterface $bookRepository
    ) {}

    public function execute(array $data): Book
    {
        $book = new Book(
            null,
            (int) $data['author_id'],
            (string) ($data['title'] ?? ''),
            $data['is_draft'] ?? true,
            $data['is_published'] ?? false,
            $data['is_adult'] ?? false,
            $data['category_id'] ?? null,
            $data['short_description'] ?? null,
            $data['cover'] ?? null,
            0,
            0
        );

        return $this->bookRepository->create($book);
    }
}

