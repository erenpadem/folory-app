<?php

namespace App\Application\UseCases\Book;

use App\Domain\Book\Entities\Book;
use App\Domain\Book\Repositories\BookRepositoryInterface;
use App\Domain\Section\Repositories\SectionRepositoryInterface;
use App\Domain\Page\Repositories\PageRepositoryInterface;

class PublishBookUseCase
{
    public function __construct(
        private BookRepositoryInterface $bookRepository,
        private SectionRepositoryInterface $sectionRepository,
        private PageRepositoryInterface $pageRepository
    ) {}

    public function execute(int $bookId): Book
    {
        $book = $this->bookRepository->findById($bookId);
        
        if (!$book) {
            throw new \Exception('Book not found');
        }

        // Check if book has sections and pages
        $sections = $this->sectionRepository->findByBookId($bookId);
        if (empty($sections)) {
            throw new \Exception('Book must have at least one section before publishing');
        }

        $totalPages = 0;
        foreach ($sections as $section) {
            $pages = $this->pageRepository->findBySectionId($section->getId());
            if (empty($pages)) {
                throw new \Exception('All sections must have at least one page before publishing');
            }
            $totalPages += count($pages);
        }

        // Update book total_page
        $book->updateTotalPage($totalPages);
        
        // Mark as not draft and publish
        $book->publish();
        
        return $this->bookRepository->update($book);
    }
}

