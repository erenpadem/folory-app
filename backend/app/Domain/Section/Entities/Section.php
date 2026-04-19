<?php

namespace App\Domain\Section\Entities;

class Section
{
    private ?int $id;
    private int $bookId;
    private string $title;
    private int $order;
    private int $totalPage;
    private bool $isVisible;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        int $bookId,
        string $title,
        int $order = 0,
        int $totalPage = 0,
        bool $isVisible = true,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        $this->id = $id;
        $this->bookId = $bookId;
        $this->title = $title;
        $this->order = $order;
        $this->totalPage = $totalPage;
        $this->isVisible = $isVisible;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBookId(): int
    {
        return $this->bookId;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getOrder(): int
    {
        return $this->order;
    }

    public function getTotalPage(): int
    {
        return $this->totalPage;
    }

    public function isVisible(): bool
    {
        return $this->isVisible;
    }

    // Domain Methods
    public function show(): void
    {
        $this->isVisible = true;
    }

    public function hide(): void
    {
        $this->isVisible = false;
    }

    public function updateDetails(string $title, int $order): void
    {
        $this->title = $title;
        $this->order = $order;
    }

    public function updateTotalPage(int $totalPage): void
    {
        $this->totalPage = $totalPage;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }
}

