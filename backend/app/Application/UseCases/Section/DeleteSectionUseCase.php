<?php

namespace App\Application\UseCases\Section;

use App\Domain\Section\Repositories\SectionRepositoryInterface;

class DeleteSectionUseCase
{
    public function __construct(
        private SectionRepositoryInterface $sectionRepository
    ) {}

    public function execute(int $id): bool
    {
        return $this->sectionRepository->delete($id);
    }
}

