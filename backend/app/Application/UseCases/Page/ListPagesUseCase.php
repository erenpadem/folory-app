<?php

namespace App\Application\UseCases\Page;

use App\Domain\Page\Repositories\PageRepositoryInterface;

class ListPagesUseCase
{
    public function __construct(
        private PageRepositoryInterface $pageRepository
    ) {}

    public function execute(int $sectionId): array
    {
        return $this->pageRepository->findBySectionId($sectionId);
    }
}

