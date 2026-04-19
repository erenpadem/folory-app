<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\User;
use App\Models\Category;
use App\Models\Section;
use App\Models\Page;
use App\Models\Comment;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $authors = User::where('role', 'author')->get();
        if ($authors->isEmpty()) {
            $this->command->error('Author users not found. Please run UserSeeder first.');
            return;
        }

        $categories = Category::all();
        if ($categories->isEmpty()) {
            $this->command->error('Categories not found. Please run CategorySeeder first.');
            return;
        }

        // Book covers from Unsplash (free images)
        $bookCovers = [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1512820790803-83ca750da394?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
        ];

        $books = [
            [
                'title' => 'Karanlık Ormanın Sırları',
                'short_description' => 'Küçük bir kasabada geçen bu gizem dolu hikaye, ormanda kaybolan bir grup arkadaşın başından geçenleri anlatıyor. Her adımda yeni bir sır ortaya çıkıyor ve gerçekler sandıklarından çok daha korkunç.',
                'cover' => $bookCovers[0],
                'category_id' => $categories->where('name', 'Korku')->first()->id,
                'is_adult' => false,
                'is_draft' => false,
                'is_published' => true,
                'read_count' => 1247,
            ],
            [
                'title' => 'Zamanın Ötesinde',
                'short_description' => 'Gelecekten gelen bir zaman yolcusunun maceraları ve zamanın sırlarını keşfetme hikayesi. Geçmiş, şimdi ve gelecek arasındaki sınırlar bulanıklaşıyor.',
                'cover' => $bookCovers[1],
                'category_id' => $categories->where('name', 'Bilim Kurgu')->first()->id,
                'is_adult' => false,
                'is_draft' => false,
                'is_published' => true,
                'read_count' => 892,
            ],
            [
                'title' => 'Aşkın Rengi',
                'short_description' => 'İki farklı dünyadan gelen insanların buluşması ve aşkın gücüyle aşılması gereken engeller. Bazen sevgi, tüm farklılıkları aşmanın tek yoludur.',
                'cover' => $bookCovers[2],
                'category_id' => $categories->where('name', 'Romantik')->first()->id,
                'is_adult' => false,
                'is_draft' => true,
                'is_published' => false,
                'read_count' => 0,
            ],
            [
                'title' => 'Kayıp Şehir',
                'short_description' => 'Antik bir şehrin sırlarını keşfetmek için çıkılan macera dolu yolculuk. Her yeni keşif, daha büyük bir gizemi ortaya çıkarıyor.',
                'cover' => $bookCovers[3],
                'category_id' => $categories->where('name', 'Macera')->first()->id,
                'is_adult' => false,
                'is_draft' => false,
                'is_published' => true,
                'read_count' => 567,
            ],
            [
                'title' => 'Gece Yarısı Çanları',
                'short_description' => 'Eski bir manastırda geçen korku dolu bir hikaye. Gece yarısı çalan çanların ardında yatan sırlar, kimsenin tahmin edemeyeceği kadar korkunç.',
                'cover' => $bookCovers[4],
                'category_id' => $categories->where('name', 'Korku')->first()->id,
                'is_adult' => true,
                'is_draft' => false,
                'is_published' => true,
                'read_count' => 2341,
            ],
            [
                'title' => 'Yıldızlar Arasında',
                'short_description' => 'Uzayın derinliklerinde geçen bir bilim kurgu macerası. İnsanlığın geleceği, yeni gezegenlerde aranıyor.',
                'cover' => $bookCovers[5],
                'category_id' => $categories->where('name', 'Bilim Kurgu')->first()->id,
                'is_adult' => false,
                'is_draft' => false,
                'is_published' => true,
                'read_count' => 1456,
            ],
            [
                'title' => 'Kalbin Sesi',
                'short_description' => 'İki kalbin buluşması ve aşkın en saf halini anlatan romantik bir hikaye. Bazen hayat, beklenmedik anlarda en güzel sürprizleri sunar.',
                'cover' => $bookCovers[6],
                'category_id' => $categories->where('name', 'Romantik')->first()->id,
                'is_adult' => false,
                'is_draft' => false,
                'is_published' => true,
                'read_count' => 987,
            ],
            [
                'title' => 'Son Durak',
                'short_description' => 'Gerilim dolu bir tren yolculuğu. Her yolcu, kendi sırrını taşıyor ve son durak, hiç kimsenin tahmin edemeyeceği bir sonu getiriyor.',
                'cover' => $bookCovers[7],
                'category_id' => $categories->where('name', 'Gerilim')->first()->id,
                'is_adult' => false,
                'is_draft' => false,
                'is_published' => true,
                'read_count' => 1789,
            ],
        ];

        foreach ($books as $index => $bookData) {
            // Distribute books among authors
            $author = $authors->random();

            $book = Book::create([
                'author_id' => $author->id,
                'category_id' => $bookData['category_id'],
                'title' => $bookData['title'],
                'short_description' => $bookData['short_description'],
                'cover' => $bookData['cover'],
                'read_count' => $bookData['read_count'],
                'total_page' => 0, // Will be calculated from pages
                'is_adult' => $bookData['is_adult'],
                'is_draft' => $bookData['is_draft'],
                'is_published' => $bookData['is_published'],
            ]);

            // Create sections and pages for this book
            $sectionTitles = [
                'Başlangıç',
                'Gelişme',
                'Dönüm Noktası',
                'Sonuç',
            ];

            $sectionCount = rand(2, 4);
            $totalPages = 0;

            for ($i = 0; $i < $sectionCount; $i++) {
                $section = Section::create([
                    'book_id' => $book->id,
                    'title' => $sectionTitles[$i] ?? "Bölüm " . ($i + 1),
                    'order' => $i,
                    'total_page' => 0, // Will be calculated from pages
                    'is_visible' => true,
                ]);

                // Create pages for this section
                $pageCount = rand(3, 8);
                for ($j = 0; $j < $pageCount; $j++) {
                    $pageContent = $this->generatePageContent($j + 1, $section->title, $book->title);
                    Page::create([
                        'section_id' => $section->id,
                        'content' => $pageContent,
                        'order' => $j,
                    ]);
                }

                // Update section total_page
                $section->update(['total_page' => $pageCount]);
                $totalPages += $pageCount;
            }

            // Update book total_page
            $book->update(['total_page' => $totalPages]);

            // Create comments for this book (nested comments)
            $this->createCommentsForBook($book, $authors);

            $this->command->info("Created book: {$book->title} by {$author->name} with {$sectionCount} sections and {$totalPages} pages");
        }
    }

    private function createCommentsForBook(Book $book, $authors)
    {
        $allUsers = User::all();
        $commentTemplates = [
            "Harika bir kitap! Çok beğendim.",
            "Bu kitabı okurken çok etkilendim. Yazarın anlatımı muhteşem.",
            "Bence bu kitap çok güzel bir hikaye anlatıyor. Kesinlikle okunmalı.",
            "Karakterler çok iyi geliştirilmiş. Başarılar!",
            "Kitabın sonunu merak ediyorum. Devamını bekliyorum.",
            "Çok güzel bir eser. Yazarı tebrik ederim.",
            "Bu kitabı arkadaşlarıma da önereceğim.",
            "Hikaye çok akıcı. Bir solukta okudum.",
        ];

        // Create top-level comments (3-5 per book)
        $topLevelCount = rand(3, 5);
        $topLevelComments = [];

        for ($i = 0; $i < $topLevelCount; $i++) {
            $commenter = $allUsers->random();
            $comment = Comment::create([
                'user_id' => $commenter->id,
                'book_id' => $book->id,
                'parent_id' => null,
                'content' => $commentTemplates[array_rand($commentTemplates)],
                'depth' => 0,
                'mentions' => null,
                'sections' => null,
                'pages' => null,
                'authors' => null,
            ]);
            $topLevelComments[] = $comment;

            // Create nested replies (1-3 per top-level comment)
            $replyCount = rand(1, 3);
            for ($j = 0; $j < $replyCount; $j++) {
                $replier = $allUsers->random();
                $replyTemplates = [
                    "Katılıyorum! Çok güzel bir yorum.",
                    "Aynen öyle! Ben de aynı şeyi düşünüyorum.",
                    "Teşekkürler! Çok haklısınız.",
                    "Evet, kesinlikle. Çok doğru bir tespit.",
                    "Harika bir yorum! Ben de aynı fikirdeyim.",
                ];

                Comment::create([
                    'user_id' => $replier->id,
                    'book_id' => $book->id,
                    'parent_id' => $comment->id,
                    'content' => $replyTemplates[array_rand($replyTemplates)],
                    'depth' => 1,
                    'mentions' => [$commenter->id], // Mention the parent comment author
                    'sections' => null,
                    'pages' => null,
                    'authors' => null,
                ]);
            }
        }

        $this->command->info("Created " . count($topLevelComments) . " top-level comments with nested replies for book: {$book->title}");
    }

    private function generatePageContent($pageNumber, $sectionTitle, $bookTitle): string
    {
        $templates = [
            "<p>Bu, <strong>{$bookTitle}</strong> kitabının <strong>{$sectionTitle}</strong> bölümünün {$pageNumber}. sayfasıdır. İçerik burada yer alacak.</p>",
            "<h2>{$sectionTitle} - Sayfa {$pageNumber}</h2><p>Bu sayfada <strong>{$bookTitle}</strong> hikayesinin devamı anlatılmaktadır. Olay örgüsü burada gelişmeye devam ediyor.</p>",
            "<p>Sayfa {$pageNumber} içeriği burada bulunmaktadır. <strong>{$bookTitle}</strong> kitabının <strong>{$sectionTitle}</strong> bölümünde detaylı açıklamalar ve olay örgüsü bu bölümde yer alır.</p>",
            "<p>Bu sayfada karakterlerin gelişimi ve hikayenin ilerleyişi anlatılmaktadır. <strong>{$sectionTitle}</strong> bölümü, <strong>{$bookTitle}</strong> kitabının önemli bir parçasıdır.</p>",
        ];

        return $templates[array_rand($templates)];
    }
}
