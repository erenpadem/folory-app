<?php

namespace App\Application\UseCases\Page;

use App\Domain\Page\Entities\Page;
use App\Domain\Page\Repositories\PageRepositoryInterface;

class GetPageUseCase
{
    public function __construct(
        private PageRepositoryInterface $pageRepository
    ) {}

    public function execute(int $id): ?Page
    {
        return $this->pageRepository->findById($id);
    }
}

