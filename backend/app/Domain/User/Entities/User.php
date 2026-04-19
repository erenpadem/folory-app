<?php

namespace App\Domain\User\Entities;

class User
{
    private ?int $id;
    private string $name;
    private string $username;
    private string $email;
    private string $password;
    private ?string $avatar;
    private ?string $coverImage;
    private ?string $bio;
    private string $role;
    private bool $isVerified;
    private ?\DateTime $emailVerifiedAt;
    private ?\DateTime $createdAt;
    private ?\DateTime $updatedAt;
    private ?\DateTime $deletedAt;

    public function __construct(
        ?int $id,
        string $name,
        string $username,
        string $email,
        string $password,
        string $role = 'reader',
        bool $isVerified = false,
        ?string $avatar = null,
        ?string $coverImage = null,
        ?string $bio = null,
        ?\DateTime $emailVerifiedAt = null,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null,
        ?\DateTime $deletedAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->username = $username;
        $this->email = $email;
        $this->password = $password;
        $this->role = $role;
        $this->isVerified = $isVerified;
        $this->avatar = $avatar;
        $this->coverImage = $coverImage;
        $this->bio = $bio;
        $this->emailVerifiedAt = $emailVerifiedAt;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->deletedAt = $deletedAt;
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

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function getCoverImage(): ?string
    {
        return $this->coverImage;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function getEmailVerifiedAt(): ?\DateTime
    {
        return $this->emailVerifiedAt;
    }

    // Domain Methods
    public function isAuthor(): bool
    {
        return $this->role === 'author';
    }

    public function isReader(): bool
    {
        return $this->role === 'reader';
    }

    public function verify(): void
    {
        $this->isVerified = true;
    }

    public function verifyEmail(): void
    {
        $this->emailVerifiedAt = new \DateTime();
    }

    public function updateProfile(string $name, ?string $avatar, ?string $coverImage, ?string $bio): void
    {
        $this->name = $name;
        $this->avatar = $avatar;
        $this->coverImage = $coverImage;
        $this->bio = $bio;
    }

    public function changeRole(string $role): void
    {
        if (!in_array($role, ['author', 'reader'])) {
            throw new \InvalidArgumentException('Invalid role');
        }
        $this->role = $role;
    }
}

