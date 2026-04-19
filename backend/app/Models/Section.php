<?php 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'title',
        'order',
        'total_page',
        'is_visible',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
    ];

    // 🔹 Kitap ilişkisi
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    // 🔹 Sayfalar
    public function pages()
    {
        return $this->hasMany(Page::class);
    }

    // 🔹 Yorumlar
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    // 🔹 Okuma takibi (section bazlı)
    public function readings()
    {
        return $this->hasMany(SectionReading::class);
    }

    // 🔹 Scope: görünür olanlar
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    // 🔹 Helper: kullanıcı için ilerleme yüzdesi
    public function readingProgressFor(User $user)
    {
        $reading = $this->readings()->where('user_id', $user->id)->first();
        if (!$reading || $this->total_page === 0) {
            return 0;
        }
        return round(($reading->current_page / $this->total_page) * 100, 2);
    }
}
