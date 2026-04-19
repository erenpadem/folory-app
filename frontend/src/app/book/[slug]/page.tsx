'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookEntity } from '@/features/books'
import api from '@/shared/lib/api-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BookHeader } from "@/components/book/BookHeader"
import { BookHero } from "@/components/book/BookHero"
import { BookTabs } from "@/components/book/BookTabs"
import { useAuth } from '@/features/auth'
import { buildLoginUrl, getCurrentReturnTo } from '@/lib/auth-redirect'
import { recordBookViewOnce } from '@/lib/book-view'
import {
  getSessionReading,
  resolveResumePosition,
  type ReadingPosition,
} from '@/lib/book-reading-progress'

export default function BookDetailPage() {
    const { slug } = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const { user, isAuthenticated } = useAuth()
    const [isSaved, setIsSaved] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [activeTab, setActiveTab] = useState('about')
    const [showFullDescription, setShowFullDescription] = useState(false)
    const [book, setBook] = useState<BookEntity | null>(null)
    const [resumePosition, setResumePosition] = useState<ReadingPosition | null>(null)

    // Load book data - always use slug
    const { data: bookData, isLoading, error } = useQuery({
        queryKey: ['book', slug],
        queryFn: async () => {
            // Always use slug for API call
            const response = await api.get(`/api/books/${slug}`);
            return response.data;
        },
        enabled: !!slug,
    })

    useEffect(() => {
        if (bookData?.data) {
            const bookDataItem = bookData.data;
            // Use BookEntity.fromPrimitives for proper entity creation
            const bookEntity = BookEntity.fromPrimitives(bookDataItem);
            setBook(bookEntity);
        }
    }, [bookData])

    useEffect(() => {
        if (!book?.id || !slug) return
        void recordBookViewOnce(
            book.id,
            String(slug),
            queryClient,
            ['book', slug]
        )
    }, [book?.id, slug, queryClient])

    // Must stay above any early return (Rules of Hooks)
    useEffect(() => {
        if (!book?.id || !isAuthenticated || !user) return;
        const checkStatus = async () => {
            try {
                const [savedRes, likedRes] = await Promise.all([
                    api.get(`/api/library/${book.id}/check`),
                    api.get(`/api/likes/books/${book.id}/check`),
                ]);
                setIsSaved(savedRes.data.is_saved);
                setIsLiked(likedRes.data.is_liked);
            } catch {
                // Ignore errors if user not logged in
            }
        };
        void checkStatus();
    }, [book?.id, isAuthenticated, user]);

    useEffect(() => {
        if (!slug) return;
        setResumePosition(getSessionReading(String(slug)));
    }, [slug]);

    useEffect(() => {
        if (!book?.id || !isAuthenticated) return;
        const loadReading = async () => {
            try {
                const res = await api.get(`/api/library/${book.id}/reading`);
                const d = res.data?.data;
                if (d?.last_section_id != null && d?.last_page_id != null) {
                    setResumePosition({
                        sectionId: Number(d.last_section_id),
                        pageId: Number(d.last_page_id),
                    });
                }
            } catch {
                // sessionStorage fallback zaten yüklü
            }
        };
        void loadReading();
    }, [book?.id, isAuthenticated]);

    const resolvedResume =
        book != null
            ? resolveResumePosition(
                  book,
                  resumePosition,
                  user?.id != null ? Number(user.id) : null
              )
            : null;

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
            </div>
        )
    }

    if (error || !book) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center py-12">
                    <p className="text-destructive mb-4">Kitap bulunamadı veya yüklenirken bir hata oluştu</p>
                    <p className="text-muted-foreground text-sm">Lütfen tekrar deneyin</p>
                </div>
            </div>
        )
    }

    const requireAuth = () => {
        if (isAuthenticated && user) return true
        router.push(buildLoginUrl({ returnTo: getCurrentReturnTo(), tab: 'register' }))
        return false
    }

    const handleSave = async () => {
        if (!book || !requireAuth()) return;
        try {
            if (isSaved) {
                await api.delete(`/api/library/${book.id}`);
                setIsSaved(false);
            } else {
                await api.post('/api/library', { book_id: book.id });
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const handleLike = async () => {
        if (!book || !requireAuth()) return;
        try {
            const res = await api.post('/api/likes/toggle', { book_id: book.id });
            // API returns toggled state
            setIsLiked(res.data.is_liked);
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    return (
        <div className="bg-background">
            <BookHeader />

            <BookHero
                book={book}
                isSaved={isSaved}
                isLiked={isLiked}
                onSave={handleSave}
                onLike={handleLike}
                showFullDescription={showFullDescription}
                onToggleDescription={() => setShowFullDescription(!showFullDescription)}
                resumeReading={resolvedResume}
            />

            <BookTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                book={book}
            />
        </div>
    )
}

