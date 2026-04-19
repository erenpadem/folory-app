<?php

namespace App\Application\UseCases\Section;

use App\Domain\Section\Entities\Section;
use App\Domain\Section\Repositories\SectionRepositoryInterface;

class UpdateSectionUseCase
{
    public function __construct(
        private SectionRepositoryInterface $sectionRepository
    ) {}

    public function execute(int $id, array $data): Section
    {
        $section = $this->sectionRepository->findById($id);
        
        if (!$section) {
            throw new \Exception('Section not found');
        }

        if (isset($data['title']) || isset($data['order'])) {
            $section->updateDetails(
                $data['title'] ?? $section->getTitle(),
                $data['order'] ?? $section->getOrder()
            );
        }

        if (isset($data['is_visible'])) {
            if ($data['is_visible']) {
                $section->show();
            } else {
                $section->hide();
            }
        }

        return $this->sectionRepository->update($section);
    }
}

