<?php

namespace App\Domain\Draft\Entities;

class Draft
{
    private ?int $id;
    private int $pageId;
    private string $content;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        int $pageId,
        string $content,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        $this->id = $id;
        $this->pageId = $pageId;
        $this->content = $content;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPageId(): int
    {
        return $this->pageId;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    // Domain Methods
    public function updateContent(string $content): void
    {
        $this->content = $content;
    }
}

