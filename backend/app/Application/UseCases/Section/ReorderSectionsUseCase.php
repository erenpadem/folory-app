<?php

namespace App\Application\UseCases\Section;

use App\Domain\Section\Repositories\SectionRepositoryInterface;

class ReorderSectionsUseCase
{
    public function __construct(
        private SectionRepositoryInterface $sectionRepository
    ) {}

    public function execute(int $bookId, array $sectionOrders): void
    {
        foreach ($sectionOrders as $sectionId => $order) {
            $section = $this->sectionRepository->findById((int) $sectionId);
            if ($section && $section->getBookId() === $bookId) {
                $section->updateDetails($section->getTitle(), (int) $order);
                $this->sectionRepository->update($section);
            }
        }
    }
}

