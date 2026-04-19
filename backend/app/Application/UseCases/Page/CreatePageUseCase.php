<?php

namespace App\Application\UseCases\Page;

use App\Domain\Page\Entities\Page;
use App\Domain\Page\Repositories\PageRepositoryInterface;
use App\Domain\Section\Repositories\SectionRepositoryInterface;

class CreatePageUseCase
{
    public function __construct(
        private PageRepositoryInterface $pageRepository,
        private SectionRepositoryInterface $sectionRepository
    ) {}

    public function execute(int $sectionId, array $data): Page
    {
        $page = new Page(
            null,
            $sectionId,
            $data['content'],
            $data['order'] ?? 0
        );

        $createdPage = $this->pageRepository->create($page);
        
        // Update section total_page count
        $section = $this->sectionRepository->findById($sectionId);
        if ($section) {
            $pages = $this->pageRepository->findBySectionId($sectionId);
            $section->updateTotalPage(count($pages));
            $this->sectionRepository->update($section);
        }

        return $createdPage;
    }
}

