<?php

namespace App\Domain\Page\Entities;

class Page
{
    private ?int $id;
    private int $sectionId;
    private string $content;
    private int $order;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        int $sectionId,
        string $content,
        int $order = 0,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        $this->id = $id;
        $this->sectionId = $sectionId;
        $this->content = $content;
        $this->order = $order;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSectionId(): int
    {
        return $this->sectionId;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getOrder(): int
    {
        return $this->order;
    }

    // Domain Methods
    public function updateContent(string $content): void
    {
        $this->content = $content;
    }

    public function updateOrder(int $order): void
    {
        $this->order = $order;
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

