<?php

namespace App\Application\UseCases\Section;

use App\Domain\Section\Entities\Section;
use App\Domain\Section\Repositories\SectionRepositoryInterface;

class CreateSectionUseCase
{
    public function __construct(
        private SectionRepositoryInterface $sectionRepository
    ) {}

    public function execute(int $bookId, array $data): Section
    {
        $section = new Section(
            null,
            $bookId,
            $data['title'],
            $data['order'] ?? 0,
            0,
            $data['is_visible'] ?? true
        );

        return $this->sectionRepository->create($section);
    }
}

