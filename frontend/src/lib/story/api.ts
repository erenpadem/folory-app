import { Story } from "@/types/story";

// lib/api.ts
export async function fetchUserStories(): Promise<Story[]> {
    // Gerçek uygulamada burada API çağrısı yapılır
    return [
      {
        id: '1',
        title: 'Karanlık Ormanın Sırları',
        coverImage: '/placeholder-cover.jpg',
        genre: 'Korku',
        chaptersCount: 12,
        wordCount: 45600,
        isPublished: true,
        updatedAt: '2023-10-15T14:30:00Z'
      },
      {
        id: '2',
        title: 'Kayıp Şehir',
        genre: 'Macera',
        chaptersCount: 5,
        wordCount: 12400,
        isPublished: false,
        updatedAt: '2023-11-02T09:15:00Z'
      },
      {
        id: '3',
        title: 'Sonsuz Evren',
        coverImage: '/placeholder-cover-2.jpg',
        genre: 'Bilim Kurgu',
        chaptersCount: 8,
        wordCount: 32100,
        isPublished: true,
        updatedAt: '2023-09-20T16:45:00Z'
      }
    ]
  }