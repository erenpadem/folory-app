<?php

namespace Database\Seeders;

use App\Models\Rating;
use App\Models\Book;
use App\Models\User;
use Illuminate\Database\Seeder;

class RatingSeeder extends Seeder
{
    public function run(): void
    {
        $books = Book::where('is_published', true)->get();
        $users = User::where('role', 'reader')->get();
        
        if ($users->isEmpty()) {
            $this->command->warn('No reader users found. Creating ratings with all users.');
            $users = User::all();
        }
        
        foreach ($books as $book) {
            // Create 5-15 ratings per book
            $ratingCount = rand(5, 15);
            $ratedUsers = $users->random(min($ratingCount, $users->count()));
            
            foreach ($ratedUsers as $user) {
                // Random score between 3-5 (mostly positive ratings)
                $score = rand(3, 5);
                
                Rating::create([
                    'user_id' => $user->id,
                    'book_id' => $book->id,
                    'score' => $score,
                ]);
            }
        }
    }
}

