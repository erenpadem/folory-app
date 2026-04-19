// stores/story-editor.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Chapter, ChapterFormData, Story, StoryFormData, Comment } from '@/types/story'
import api from '@/lib/api'

// Re-export Story type for other components to use
export type { Story } from '@/types/story'

interface StoryEditorState {
  storyInfo: StoryFormData
  chapters: Chapter[]
  comments: Comment[]
  activeTab: 'about' | 'chapters' | 'comments'
  activeChapterId: string | null
  isSaving: boolean
  isPublishing: boolean
  errors: Record<string, string>
  lastSavedAt: string | null
}

interface StoryEditorActions {
  // Tab management
  setActiveTab: (tab: 'about' | 'chapters' | 'comments') => void
  
  // Story operations
  updateStoryInfo: (updates: Partial<StoryFormData>) => void
  loadStory: (story: Story) => void
  reset: () => void
  
  // Chapter operations
  addChapter: () => Chapter
  updateChapter: (id: string, updates: Partial<ChapterFormData>) => void
  deleteChapter: (id: string) => void
  reorderChapters: (startIndex: number, endIndex: number) => void
  setActiveChapter: (id: string | null) => void
  
  // Comment operations
  addComment: (comment: Comment) => void
  addReply: (commentId: string, reply: Comment) => void
  
  // Status management
  setSaving: (isSaving: boolean) => void
  setPublishing: (isPublishing: boolean) => void
  setErrors: (errors: Record<string, string>) => void
  clearErrors: () => void
  
  // Validation
  validateStory: () => boolean
  validateChapter: (chapterId: string) => boolean
  
  // API operations
  saveDraft: () => Promise<Story | undefined>
  publishStory: () => Promise<Story | undefined>
  autoSave: () => Promise<void>
}

const initialState: StoryEditorState = {
  storyInfo: {
    id: '',
    title: '',
    description: '',
    short_description: '',
    cover_image: null,
    category_id: '',
    genre_ids: [],
    tags: [],
    status: 'draft',
    is_adult: false,
    content_rating: 'general',
    comments_count: 0
  },
  chapters: [],
  comments: [],
  activeTab: 'about',
  activeChapterId: null,
  isSaving: false,
  isPublishing: false,
  errors: {},
  lastSavedAt: null
}

export const useStoryEditorStore = create<StoryEditorState & StoryEditorActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Action implementations
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      updateStoryInfo: (updates) => {
        set(state => ({
          storyInfo: { 
            ...state.storyInfo, 
            ...updates,
            content_rating: updates.is_adult && state.storyInfo.content_rating === 'general' 
              ? 'teen' 
              : updates.content_rating || state.storyInfo.content_rating
          }
        }))
      },
      
      loadStory: (story) => {
        set({
          storyInfo: {
            id: story.id,
            title: story.title,
            description: story.description,
            short_description: story.short_description,
            cover_image: story.cover_image,
            category_id: story.category_id,
            genre_ids: story.genre_ids,
            tags: story.tags,
            status: story.status,
            is_adult: story.is_adult,
            content_rating: story.content_rating,
            comments_count: story.comments_count
          },
          chapters: story.chapters || [],
          comments: story.comments || []
        })
      },
      
      reset: () => set(initialState),
      
      addChapter: () => {
        const newChapter: Chapter = {
          id: `ch-${Date.now()}`,
          story_id: get().storyInfo.id || '',
          title: `Bölüm ${get().chapters.length + 1}`,
          content: '',
          position: get().chapters.length + 1,
          status: 'draft',
          word_count: 0,
          reading_time: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        set(state => ({
          chapters: [...state.chapters, newChapter],
          activeChapterId: newChapter.id
        }))
        
        return newChapter
      },
      
      updateChapter: (id, updates) => {
        set(state => ({
          chapters: state.chapters.map(chapter => {
            if (chapter.id === id) {
              const newContent = updates.content ?? chapter.content
              const wordCount = newContent ? newContent.split(/\s+/).filter(Boolean).length : 0
              
              return { 
                ...chapter, 
                ...updates,
                word_count: wordCount,
                reading_time: Math.ceil(wordCount / 200),
                updated_at: new Date().toISOString()
              }
            }
            return chapter
          })
        }))
      },
      
      deleteChapter: (id) => {
        set(state => ({
          chapters: state.chapters.filter(chapter => chapter.id !== id),
          activeChapterId: state.activeChapterId === id ? null : state.activeChapterId
        }))
      },
      
      reorderChapters: (startIndex, endIndex) => {
        const result = Array.from(get().chapters)
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)
        
        set({
          chapters: result.map((chapter, index) => ({
            ...chapter,
            position: index + 1
          }))
        })
      },
      
      setActiveChapter: (id) => set({ activeChapterId: id }),
      
      addComment: (comment) => set(state => ({
        comments: [...state.comments, comment],
        storyInfo: {
          ...state.storyInfo,
          comments_count: (state.storyInfo.comments_count || 0) + 1
        }
      })),
      
      addReply: (commentId, reply) => set(state => ({
        comments: state.comments.map(comment => 
          comment.id === commentId
            ? { ...comment, replies: [...(comment.replies || []), reply] }
            : comment
        )
      })),
      
      setSaving: (isSaving) => set({ isSaving }),
      setPublishing: (isPublishing) => set({ isPublishing }),
      setErrors: (errors) => set({ errors }),
      clearErrors: () => set({ errors: {} }),
      
      validateStory: () => {
        const { storyInfo } = get()
        const errors: Record<string, string> = {}
        
        if (!storyInfo.title.trim()) errors.title = 'Başlık gereklidir'
        if (!storyInfo.description.trim()) errors.description = 'Açıklama gereklidir'
        if (!storyInfo.category_id) errors.category_id = 'Kategori seçmelisiniz'
        
        set({ errors })
        return Object.keys(errors).length === 0
      },
      
      validateChapter: (chapterId) => {
        const chapter = get().chapters.find(c => c.id === chapterId)
        const errors: Record<string, string> = {}
        
        if (!chapter?.title.trim()) errors.title = 'Bölüm başlığı gereklidir'
        if (!chapter?.content.trim()) errors.content = 'İçerik gereklidir'
        
        set({ errors })
        return Object.keys(errors).length === 0
      },
      
      saveDraft: async () => {
        try {
          get().setSaving(true)
          const { storyInfo, chapters } = get()
          
          const response = await api.put(`/stories/${storyInfo.id}`, {
            ...storyInfo,
            chapters
          })
          
          set({ lastSavedAt: new Date().toISOString() })
          return response.data
        } finally {
          get().setSaving(false)
        }
      },
      
      publishStory: async () => {
        try {
          get().setPublishing(true)
          const { storyInfo, chapters } = get()
          
          const response = await api.put(`/stories/${storyInfo.id}/publish`, {
            ...storyInfo,
            status: 'published',
            chapters
          })
          
          set({ 
            storyInfo: { ...storyInfo, status: 'published' },
            lastSavedAt: new Date().toISOString() 
          })
          
          return response.data
        } finally {
          get().setPublishing(false)
        }
      },
      
      autoSave: async () => {
        if (get().isSaving || get().isPublishing) return
        
        try {
          get().setSaving(true)
          await get().saveDraft()
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          get().setSaving(false)
        }
      }
    }),
    {
      name: 'story-editor-storage',
      partialize: (state) => ({
        storyInfo: state.storyInfo,
        chapters: state.chapters,
        comments: state.comments,
        activeTab: state.activeTab,
        lastSavedAt: state.lastSavedAt
      })
    }
  )
)