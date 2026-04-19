<?php

namespace App\Domain\Book\Repositories;

use App\Domain\Book\Entities\Book;

interface BookRepositoryInterface
{
    public function findById(int $id): ?Book;
    public function findBySlug(string $slug): ?Book;
    public function findByAuthorId(int $authorId, int $perPage = 15);
    public function create(Book $book): Book;
    public function update(Book $book): Book;
    public function delete(int $id): bool;
    public function paginate(int $perPage = 15, array $filters = []);
    public function findPublished(int $perPage = 15);
    public function findByCategoryId(int $categoryId, int $perPage = 15);
    public function incrementReadCount(int $id): void;
}

