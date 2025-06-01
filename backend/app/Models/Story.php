<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Story extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 
        'category_id',
        'title',
        'slug',
        'description',
        'short_description',
        'cover_image',
        'word_count',
        'view_count',
        'rating',
        'status', // ['draft', 'ongoing', 'completed', 'hiatus']
        'is_featured',
        'is_adult',
        'published_at'
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
        'is_adult' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class)->withDefault([
            'name' => 'Anonim Yazar'
        ]);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class);
    }

    public function chapters()
    {
        return $this->hasMany(Chapter::class)->orderBy('chapter_number');
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    // Yeni eklenen ilişkiler
    public function readingProgress()
    {
        return $this->hasMany(ReadingProgress::class);
    }

    public function similarStories()
    {
        return $this->belongsToMany(Story::class, 'similar_stories', 'story_id', 'similar_story_id');
    }

    // Helper metodlar
    public function getAuthorNameAttribute()
    {
        return $this->user->name;
    }

    public function getGenresListAttribute()
    {
        return $this->genres->pluck('name')->join(', ');
    }
}