'use client'
import { useState } from 'react'
import { StoryHeader } from "@/components/story/StoryHeader"
import { StoryHero } from "@/components/story/StoryHero"
import { StoryTabs } from "@/components/story/StoryTabs"
import { Story } from "@/types/story"
import { useParams } from 'next/navigation'

type Comment = {
    id: string
    user: string
    avatar: string
    date: string
    text: string
    likes: number
    replies?: Comment[]
    isExpanded?: boolean
}

type Chapter = {
    id: string
    number: number
    title: string
    publishedDate: string
    status: 'read' | 'unread' | 'in-progress'
    wordCount: number
}

type Story = {
    id: string
    slug: string
    title: string
    author: string
    description: string
    cover: string
    genre: string
    likes: number
    chapters: Chapter[]
    rating: number
    status: string
    wordCount: number
    publishedDate: string
    lastUpdated: string
    similarStories: {
        id: string
        slug: string
        title: string
        author: string
        cover: string
    }[]
    comments: Comment[]
    readingProgress?: {
        currentChapter: number
        percentage: number
    }
}

const mockStory: Story = {
    id: "1",
    slug: "karanlik-orman-sirlari",
    title: "Karanlık Ormanın Sırları",
    author: "Ayşe Yılmaz",
    description: "Küçük bir kasabada geçen bu gizem dolu hikaye, ormanda kaybolan bir grup arkadaşın başından geçenleri anlatıyor. Her gece ormandan gelen tuhaf sesler ve giderek artan kaybolma vakaları kasaba halkını korkutuyor. Kahramanımız Elif, bu sırrın peşine düşerken kendini hiç beklemediği bir gerçekle yüz yüze bulacak. Bu hikayede dostluk, ihanet ve doğaüstü olaylar iç içe geçiyor.",
    cover: "/placeholder-story.jpg",
    genre: "Korku/Gerilim",
    likes: 4287,
    chapters: Array.from({ length: 24 }, (_, i) => ({
        id: `ch-${i + 1}`,
        number: i + 1,
        title: `Bölüm ${i + 1}: ${['Gizem Başlıyor', 'Kayıp Çocuk', 'Ormanın Derinlikleri', 'Sır Perdesi'][i % 4] || 'Yeni Macera'}`,
        publishedDate: new Date(Date.now() - (i * 3 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
        status: i < 5 ? 'read' : i === 5 ? 'in-progress' : 'unread',
        wordCount: 3500 + (i * 100)
    })),
    rating: 4.8,
    status: "Devam Ediyor",
    wordCount: 85600,
    publishedDate: "15 Mart 2023",
    lastUpdated: "3 gün önce",
    readingProgress: {
        currentChapter: 6,
        percentage: 45
    },
    similarStories: [
        {
            id: "2",
            slug: "gece-yarisi-cigliklari",
            title: "Gece Yarısı Çığlıkları",
            author: "Mehmet Kaya",
            cover: "/placeholder-story-2.jpg"
        },
        {
            id: "3",
            slug: "kayip-koy",
            title: "Kayıp Köy",
            author: "Deniz Arslan",
            cover: "/placeholder-story-3.jpg"
        },
    ],
    comments: [
        {
            id: "1",
            user: "Eren Yıldız",
            avatar: "/placeholder-avatar-1.jpg",
            date: "2 gün önce",
            text: "Bu hikaye beni gerçekten çok etkiledi. Özellikle 15. bölümdeki olay örgüsü mükemmeldi!",
            likes: 24,
            replies: [
                {
                    id: "1-1",
                    user: "Can Demir",
                    avatar: "/placeholder-avatar-3.jpg",
                    date: "1 gün önce",
                    text: "Kesinlikle katılıyorum! 15. bölüm gerçekten sürükleyiciydi.",
                    likes: 8
                },
                {
                    id: "1-2",
                    user: "Selin Öztürk",
                    avatar: "/placeholder-avatar-2.jpg",
                    date: "12 saat önce",
                    text: "Bence 16. bölüm daha da iyiydi, okudunuz mu?",
                    likes: 5,
                    replies: [
                        {
                            id: "1-2-1",
                            user: "Eren Yıldız",
                            avatar: "/placeholder-avatar-1.jpg",
                            date: "2 saat önce",
                            text: "Henüz okumadım ama şimdi merak ettim!",
                            likes: 2
                        }
                    ]
                }
            ],
            isExpanded: true
        },
        {
            id: "2",
            user: "Mehmet Kaya",
            avatar: "/placeholder-avatar-4.jpg",
            date: "1 hafta önce",
            text: "Yazarın anlatım tarzına hayran kaldım. Merakla yeni bölümleri bekliyorum.",
            likes: 18,
            replies: [],
            isExpanded: false
        },
    ]
}

export default function StoryDetailPage() {
    const { slug } = useParams()
    const [isSaved, setIsSaved] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [activeTab, setActiveTab] = useState('about')
    const [showFullDescription, setShowFullDescription] = useState(false)
    const [story, setStory] = useState<Story>(mockStory)

    return (
        <div className="bg-background">
            <StoryHeader />

            <StoryHero
                story={story}
                isSaved={isSaved}
                isLiked={isLiked}
                onSave={() => setIsSaved(!isSaved)}
                onLike={() => setIsLiked(!isLiked)}
                showFullDescription={showFullDescription}
                onToggleDescription={() => setShowFullDescription(!showFullDescription)}
            />

            <StoryTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                story={story}
            />
        </div>
    )
}