<?php

namespace App\Domain\Category\Entities;

class Category
{
    private ?int $id;
    private string $name;
    private string $slug;
    private ?string $description;
    private bool $isActive;
    private int $order;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        string $name,
        string $slug,
        bool $isActive = true,
        int $order = 0,
        ?string $description = null,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->slug = $slug;
        $this->description = $description;
        $this->isActive = $isActive;
        $this->order = $order;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getOrder(): int
    {
        return $this->order;
    }

    // Domain Methods
    public function activate(): void
    {
        $this->isActive = true;
    }

    public function deactivate(): void
    {
        $this->isActive = false;
    }

    public function updateDetails(string $name, string $slug, ?string $description, int $order): void
    {
        $this->name = $name;
        $this->slug = $slug;
        $this->description = $description;
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

