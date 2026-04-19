<?php

namespace App\Domain\Bookmark\Entities;

class Bookmark
{
    private ?int $id;
    private int $userId;
    private int $pageId;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        int $userId,
        int $pageId,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->pageId = $pageId;
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

    public function getPageId(): int
    {
        return $this->pageId;
    }

    // Domain Methods
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

