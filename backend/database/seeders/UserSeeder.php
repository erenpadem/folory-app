<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create main author user
        $author = User::create([
            'name' => 'Eren Padem',
            'username' => 'erenpadem',
            'email' => 'erenpadem@fo-lory.com',
            'password' => Hash::make('erensunucu'),
            'role' => 'author',
            'is_verified' => true,
            'email_verified_at' => now(),
            'bio' => 'Yazar ve içerik üreticisi. Fantastik ve bilim kurgu türlerinde eserler yazıyorum.',
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=ErenPadem&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
        ]);

        // Create some reader users with avatars
        $readers = [
            [
                'name' => 'Ayşe Yılmaz',
                'username' => 'ayseyilmaz',
                'email' => 'ayse@example.com',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'is_verified' => true,
                'email_verified_at' => now(),
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=AyseYilmaz&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
            ],
            [
                'name' => 'Mehmet Kaya',
                'username' => 'mehmetkaya',
                'email' => 'mehmet@example.com',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'is_verified' => false,
                'email_verified_at' => now(),
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=MehmetKaya&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
            ],
            [
                'name' => 'Deniz Arslan',
                'username' => 'denizarslan',
                'email' => 'deniz@example.com',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'is_verified' => true,
                'email_verified_at' => now(),
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=DenizArslan&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
            ],
            [
                'name' => 'Zeynep Demir',
                'username' => 'zeynepdemir',
                'email' => 'zeynep@example.com',
                'password' => Hash::make('password'),
                'role' => 'author',
                'is_verified' => true,
                'email_verified_at' => now(),
                'bio' => 'Genç yazar. Modern edebiyat ve kısa hikayeler üzerine çalışıyorum.',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZeynepDemir&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
            ],
            [
                'name' => 'Can Öztürk',
                'username' => 'canozturk',
                'email' => 'can@example.com',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'is_verified' => true,
                'email_verified_at' => now(),
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=CanOzturk&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
            ],
        ];

        foreach ($readers as $reader) {
            User::create($reader);
        }
    }
}
