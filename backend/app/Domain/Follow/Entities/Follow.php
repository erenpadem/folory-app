<?php

namespace App\Domain\Follow\Entities;

class Follow
{
    private ?int $id;
    private int $followerId;
    private int $followingId;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        int $followerId,
        int $followingId,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        if ($followerId === $followingId) {
            throw new \InvalidArgumentException('User cannot follow themselves');
        }
        
        $this->id = $id;
        $this->followerId = $followerId;
        $this->followingId = $followingId;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFollowerId(): int
    {
        return $this->followerId;
    }

    public function getFollowingId(): int
    {
        return $this->followingId;
    }

    // Domain Methods
    public function belongsToFollower(int $userId): bool
    {
        return $this->followerId === $userId;
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

