<?php 


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Draft extends Model
{
    use HasFactory;

    protected $fillable = [
        'page_id',
        'content',
    ];

    /**
     * İlişkiler
     */

    // Draft bir sayfaya aittir
    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
