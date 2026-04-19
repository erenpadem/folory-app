<?php

namespace App\Domain\Book\Entities;

class Book
{
    private ?int $id;
    private int $authorId;
    private ?int $categoryId;
    private string $title;
    private string $slug;
    private ?string $shortDescription;
    private ?string $cover;
    private int $readCount;
    private int $totalPage;
    private bool $isAdult;
    private bool $isDraft;
    private bool $isPublished;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        int $authorId,
        string $title,
        bool $isDraft = true,
        bool $isPublished = false,
        bool $isAdult = false,
        ?int $categoryId = null,
        ?string $shortDescription = null,
        ?string $cover = null,
        int $readCount = 0,
        int $totalPage = 0,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null,
        ?string $slug = null
    ) {
        $this->id = $id;
        $this->authorId = $authorId;
        $this->categoryId = $categoryId;
        $this->title = $title;
        $this->slug = $slug ?? \Illuminate\Support\Str::slug($title);
        $this->shortDescription = $shortDescription;
        $this->cover = $cover;
        $this->readCount = $readCount;
        $this->totalPage = $totalPage;
        $this->isAdult = $isAdult;
        $this->isDraft = $isDraft;
        $this->isPublished = $isPublished;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAuthorId(): int
    {
        return $this->authorId;
    }

    public function getCategoryId(): ?int
    {
        return $this->categoryId;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function getShortDescription(): ?string
    {
        return $this->shortDescription;
    }

    public function getCover(): ?string
    {
        return $this->cover;
    }

    public function getReadCount(): int
    {
        return $this->readCount;
    }

    public function getTotalPage(): int
    {
        return $this->totalPage;
    }

    public function isAdult(): bool
    {
        return $this->isAdult;
    }

    public function isDraft(): bool
    {
        return $this->isDraft;
    }

    public function isPublished(): bool
    {
        return $this->isPublished;
    }

    // Domain Methods
    public function publish(): void
    {
        $this->isPublished = true;
        $this->isDraft = false;
    }

    public function unpublish(): void
    {
        $this->isPublished = false;
    }

    public function markAsDraft(): void
    {
        $this->isDraft = true;
        $this->isPublished = false;
    }

    public function incrementReadCount(): void
    {
        $this->readCount++;
    }

    public function updateTotalPage(int $totalPage): void
    {
        $this->totalPage = $totalPage;
    }

    public function updateDetails(string $title, ?string $shortDescription, ?string $cover, ?int $categoryId, bool $isAdult): void
    {
        $this->title = $title;
        $this->shortDescription = $shortDescription;
        $this->cover = $cover;
        $this->categoryId = $categoryId;
        $this->isAdult = $isAdult;
    }

    public function belongsToAuthor(int $userId): bool
    {
        return $this->authorId === $userId;
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

