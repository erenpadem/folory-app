<?php

namespace App\Domain\Badge\Entities;

class Badge
{
    private ?int $id;
    private string $name;
    private string $slug;
    private ?string $description;
    private ?string $icon;
    private string $type;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?int $id,
        string $name,
        string $slug,
        string $type = 'achievement',
        ?string $description = null,
        ?string $icon = null,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        if (!in_array($type, ['achievement', 'honor'])) {
            throw new \InvalidArgumentException('Badge type must be achievement or honor');
        }
        
        $this->id = $id;
        $this->name = $name;
        $this->slug = $slug;
        $this->description = $description;
        $this->icon = $icon;
        $this->type = $type;
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

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function getType(): string
    {
        return $this->type;
    }

    // Domain Methods
    public function isAchievement(): bool
    {
        return $this->type === 'achievement';
    }

    public function isHonor(): bool
    {
        return $this->type === 'honor';
    }
}

