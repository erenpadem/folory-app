<?php

namespace App\Application\UseCases\Page;

use App\Domain\Page\Repositories\PageRepositoryInterface;
use App\Domain\Section\Repositories\SectionRepositoryInterface;

class DeletePageUseCase
{
    public function __construct(
        private PageRepositoryInterface $pageRepository,
        private SectionRepositoryInterface $sectionRepository
    ) {}

    public function execute(int $id): bool
    {
        $page = $this->pageRepository->findById($id);
        if (!$page) {
            return false;
        }

        $sectionId = $page->getSectionId();
        $deleted = $this->pageRepository->delete($id);
        
        if ($deleted) {
            // Update section total_page count
            $section = $this->sectionRepository->findById($sectionId);
            if ($section) {
                $pages = $this->pageRepository->findBySectionId($sectionId);
                $section->updateTotalPage(count($pages));
                $this->sectionRepository->update($section);
            }
        }

        return $deleted;
    }
}

