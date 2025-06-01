<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    protected $fillable = [
        'story_id', 'chapter_number', 'title', 
        'slug', 'content', 'word_count', 'is_draft'
    ];

    public function story()
    {
        return $this->belongsTo(Story::class);
    }
}