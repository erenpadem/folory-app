<?php

namespace App\Application\UseCases\Section;

use App\Domain\Section\Repositories\SectionRepositoryInterface;

class ListSectionsUseCase
{
    public function __construct(
        private SectionRepositoryInterface $sectionRepository
    ) {}

    public function execute(int $bookId): array
    {
        return $this->sectionRepository->findByBookId($bookId);
    }
}

