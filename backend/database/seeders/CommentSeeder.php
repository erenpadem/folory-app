<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Book;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    private $comments = [
        'Harika bir kitap! Çok beğendim.',
        'Yazarın anlatım tarzına hayran kaldım. Merakla devamını bekliyorum.',
        'Bu hikaye beni gerçekten çok etkiledi. Özellikle karakter gelişimi mükemmeldi!',
        'Çok sürükleyici bir hikaye. Bir solukta okudum.',
        'Yazarın hayal gücüne hayran kaldım. Kesinlikle tavsiye ederim.',
        'Bazı bölümler biraz yavaş ilerliyor ama genel olarak güzel.',
        'Sonunu tahmin edememiştim. Çok şaşırdım!',
        'Karakterler çok gerçekçi. Kendimi hikayenin içinde hissettim.',
    ];

    public function run(): void
    {
        $books = Book::where('is_published', true)->get();
        $users = User::where('role', 'reader')->get();
        
        if ($users->isEmpty()) {
            $this->command->warn('No reader users found. Creating comments with author user.');
            $users = User::all();
        }
        
        foreach ($books as $book) {
            // Create 3-8 comments per book
            $commentCount = rand(3, 8);
            
            for ($i = 0; $i < $commentCount; $i++) {
                $user = $users->random();
                $content = $this->comments[array_rand($this->comments)];
                
                $comment = Comment::create([
                    'user_id' => $user->id,
                    'book_id' => $book->id,
                    'parent_id' => null,
                    'content' => $content,
                    'depth' => 0,
                    'mentions' => null,
                    'sections' => null,
                ]);
                
                // Create 0-2 replies for some comments
                if (rand(0, 1) && $i > 0) {
                    $replyCount = rand(0, 2);
                    for ($j = 0; $j < $replyCount; $j++) {
                        $replyUser = $users->random();
                        Comment::create([
                            'user_id' => $replyUser->id,
                            'book_id' => $book->id,
                            'parent_id' => $comment->id,
                            'content' => 'Kesinlikle katılıyorum! ' . $this->comments[array_rand($this->comments)],
                            'depth' => 1,
                            'mentions' => null,
                            'sections' => null,
                        ]);
                    }
                }
            }
        }
    }
}

