<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id',
        'parent_id',
        'content',
        'depth',
        'mentions',
        'sections',
        'pages',
        'authors',
    ];

    protected $casts = [
        'depth' => 'integer',
        'mentions' => 'array',
        'sections' => 'array',
        'pages' => 'array',
        'authors' => 'array',
    ];

    /**
     * İlişkiler
     */

    // Yorumun sahibi kullanıcı
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Yorumun ait olduğu kitap
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    // Nested comments (replies)
    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    // Comment likes
    public function likes()
    {
        return $this->belongsToMany(User::class, 'comment_likes')->withTimestamps();
    }

    public function likesCount(): int
    {
        return $this->likes()->count();
    }

    public function isLikedBy(int $userId): bool
    {
        return $this->likes()->where('user_id', $userId)->exists();
    }
}
