<?php

namespace App\Application\UseCases\Book;

use App\Domain\Book\Entities\Book;
use App\Domain\Book\Repositories\BookRepositoryInterface;

class UpdateBookUseCase
{
    public function __construct(
        private BookRepositoryInterface $bookRepository
    ) {}

    public function execute(int $id, array $data): Book
    {
        $book = $this->bookRepository->findById($id);
        
        if (!$book) {
            throw new \Exception('Book not found');
        }

        $book->updateDetails(
            $data['title'] ?? $book->getTitle(),
            $data['short_description'] ?? $book->getShortDescription(),
            $data['cover'] ?? $book->getCover(),
            $data['category_id'] ?? $book->getCategoryId(),
            $data['is_adult'] ?? $book->isAdult()
        );

        if (isset($data['is_published']) && $data['is_published']) {
            $book->publish();
        } elseif (isset($data['is_draft']) && $data['is_draft']) {
            $book->markAsDraft();
        }

        return $this->bookRepository->update($book);
    }
}

