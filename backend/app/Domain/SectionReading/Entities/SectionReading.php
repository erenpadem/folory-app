<?php

namespace App\Domain\SectionReading\Entities;

class SectionReading
{
    private ?int $id;
    private int $userId;
    private int $sectionId;
    private ?int $lastPageId;
    private float $progressPercentage;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        int $userId,
        int $sectionId,
        float $progressPercentage = 0.0,
        ?int $lastPageId = null,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        if ($progressPercentage < 0 || $progressPercentage > 100) {
            throw new \InvalidArgumentException('Progress percentage must be between 0 and 100');
        }
        
        $this->id = $id;
        $this->userId = $userId;
        $this->sectionId = $sectionId;
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

    public function getSectionId(): int
    {
        return $this->sectionId;
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
    public function updateProgress(float $progressPercentage, ?int $lastPageId = null): void
    {
        if ($progressPercentage < 0 || $progressPercentage > 100) {
            throw new \InvalidArgumentException('Progress percentage must be between 0 and 100');
        }
        
        $this->progressPercentage = $progressPercentage;
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

