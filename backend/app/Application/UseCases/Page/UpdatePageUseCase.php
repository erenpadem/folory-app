<?php

namespace App\Application\UseCases\Page;

use App\Domain\Page\Entities\Page;
use App\Domain\Page\Repositories\PageRepositoryInterface;

class UpdatePageUseCase
{
    public function __construct(
        private PageRepositoryInterface $pageRepository
    ) {}

    public function execute(int $id, array $data): Page
    {
        $page = $this->pageRepository->findById($id);
        
        if (!$page) {
            throw new \Exception('Page not found');
        }

        if (isset($data['content'])) {
            $page->updateContent($data['content']);
        }

        if (isset($data['order'])) {
            $page->updateOrder($data['order']);
        }

        return $this->pageRepository->update($page);
    }
}

