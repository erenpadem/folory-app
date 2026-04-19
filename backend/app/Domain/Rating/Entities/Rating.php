<?php

namespace App\Domain\Rating\Entities;

class Rating
{
    private ?int $id;
    private int $userId;
    private int $bookId;
    private int $score;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        int $userId,
        int $bookId,
        int $score,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        if ($score < 1 || $score > 5) {
            throw new \InvalidArgumentException('Rating score must be between 1 and 5');
        }
        
        $this->id = $id;
        $this->userId = $userId;
        $this->bookId = $bookId;
        $this->score = $score;
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

    public function getScore(): int
    {
        return $this->score;
    }

    // Domain Methods
    public function updateScore(int $score): void
    {
        if ($score < 1 || $score > 5) {
            throw new \InvalidArgumentException('Rating score must be between 1 and 5');
        }
        $this->score = $score;
    }

    public function belongsToUser(int $userId): bool
    {
        return $this->userId === $userId;
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

