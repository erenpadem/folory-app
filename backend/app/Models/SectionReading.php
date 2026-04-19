<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SectionReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'section_id',
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

    // Section ilişkisi
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    // Son okunan page
    public function lastPage()
    {
        return $this->belongsTo(Page::class, 'last_page_id');
    }
}
