<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id',
        'last_section_id',
        'last_page_id',
        'progress_percentage',
    ];

    protected $casts = [
        'progress_percentage' => 'float',
    ];

    /**
     * İlişkiler
     */

    // Kullanıcı ilişkisi
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Kitap ilişkisi
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    // Son okunan section
    public function lastSection()
    {
        return $this->belongsTo(Section::class, 'last_section_id');
    }

    // Son okunan page
    public function lastPage()
    {
        return $this->belongsTo(Page::class, 'last_page_id');
    }
}
