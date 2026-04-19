<?php

namespace App\Domain\BookReading\Entities;

class BookReading
{
    private ?int $id;
    private int $userId;
    private int $bookId;
    private ?int $lastSectionId;
    private ?int $lastPageId;
    private float $progressPercentage;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        int $userId,
        int $bookId,
        float $progressPercentage = 0.0,
        ?int $lastSectionId = null,
        ?int $lastPageId = null,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        if ($progressPercentage < 0 || $progressPercentage > 100) {
            throw new \InvalidArgumentException('Progress percentage must be between 0 and 100');
        }
        
        $this->id = $id;
        $this->userId = $userId;
        $this->bookId = $bookId;
        $this->lastSectionId = $lastSectionId;
        $this->lastPageId = $lastPageId;
        $this->progressPercentage = $progressPercentage;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getBookId(): int
    {
        return $this->bookId;
    }

    public function getLastSectionId(): ?int
    {
        return $this->lastSectionId;
    }

    public function getLastPageId(): ?int
    {
        return $this->lastPageId;
    }

    public function getProgressPercentage(): float
    {
        return $this->progressPercentage;
    }

    // Domain Methods
    public function updateProgress(float $progressPercentage, ?int $lastSectionId = null, ?int $lastPageId = null): void
    {
        if ($progressPercentage < 0 || $progressPercentage > 100) {
            throw new \InvalidArgumentException('Progress percentage must be between 0 and 100');
        }
        
        $this->progressPercentage = $progressPercentage;
        $this->lastSectionId = $lastSectionId;
        $this->lastPageId = $lastPageId;
    }

    public function isCompleted(): bool
    {
        return $this->progressPercentage >= 100.0;
    }

    public function belongsToUser(int $userId): bool
    {
        return $this->userId === $userId;
    }
}

