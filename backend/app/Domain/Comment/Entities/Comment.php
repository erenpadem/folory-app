<?php

namespace App\Domain\Comment\Entities;

class Comment
{
    private ?int $id;
    private int $userId;
    private int $bookId;
    private ?int $parentId;
    private string $content;
    private int $depth;
    private ?array $mentions;
    private ?array $sections;
    private ?array $pages;
    private ?array $authors;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        int $userId,
        int $bookId,
        string $content,
        ?int $parentId = null,
        int $depth = 0,
        ?array $mentions = null,
        ?array $sections = null,
        ?array $pages = null,
        ?array $authors = null,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->bookId = $bookId;
        $this->parentId = $parentId;
        $this->content = $content;
        $this->depth = $depth;
        $this->mentions = $mentions;
        $this->sections = $sections;
        $this->pages = $pages;
        $this->authors = $authors;
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

    public function getParentId(): ?int
    {
        return $this->parentId;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getDepth(): int
    {
        return $this->depth;
    }

    public function getMentions(): ?array
    {
        return $this->mentions;
    }

    public function getSections(): ?array
    {
        return $this->sections;
    }

    public function getPages(): ?array
    {
        return $this->pages;
    }

    public function getAuthors(): ?array
    {
        return $this->authors;
    }

    // Domain Methods
    public function isReply(): bool
    {
        return $this->parentId !== null;
    }

    public function updateContent(string $content): void
    {
        $this->content = $content;
    }

    public function addMention(int $userId): void
    {
        if ($this->mentions === null) {
            $this->mentions = [];
        }
        if (!in_array($userId, $this->mentions)) {
            $this->mentions[] = $userId;
        }
    }

    public function addSection(int $sectionId): void
    {
        if ($this->sections === null) {
            $this->sections = [];
        }
        if (!in_array($sectionId, $this->sections)) {
            $this->sections[] = $sectionId;
        }
    }

    public function addPage(int $pageId): void
    {
        if ($this->pages === null) {
            $this->pages = [];
        }
        if (!in_array($pageId, $this->pages)) {
            $this->pages[] = $pageId;
        }
    }

    public function addAuthor(int $authorId): void
    {
        if ($this->authors === null) {
            $this->authors = [];
        }
        if (!in_array($authorId, $this->authors)) {
            $this->authors[] = $authorId;
        }
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

