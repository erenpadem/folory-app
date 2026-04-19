<?php

namespace App\Application\UseCases\Section;

use App\Domain\Section\Entities\Section;
use App\Domain\Section\Repositories\SectionRepositoryInterface;

class GetSectionUseCase
{
    public function __construct(
        private SectionRepositoryInterface $sectionRepository
    ) {}

    public function execute(int $id): ?Section
    {
        return $this->sectionRepository->findById($id);
    }
}

