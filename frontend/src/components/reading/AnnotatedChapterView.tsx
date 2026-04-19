'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { X, StickyNote } from 'lucide-react'
import api from '@/shared/lib/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import toast from 'react-hot-toast'
import type { ScreenFilter } from './ReadingSettings'

interface PageNote {
  id: number
  selected_text: string
  note: string | null
  start_offset: number
  end_offset: number
  color: string
}

interface AnnotatedChapterViewProps {
  content: string
  fontSize: number
  lineHeight: number
  pageId: number
  screenFilter?: ScreenFilter
}

export function AnnotatedChapterView({
  content,
  fontSize,
  lineHeight,
  pageId,
  screenFilter = 'none',
}: AnnotatedChapterViewProps) {
  const { user } = useAuth()
  const contentRef = useRef<HTMLDivElement>(null)
  const [selectedText, setSelectedText] = useState<string>('')
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [hoveredNote, setHoveredNote] = useState<PageNote | null>(null)
  const queryClient = useQueryClient()

  // Fetch existing notes
  const { data: notesData } = useQuery({
    queryKey: ['page-notes', pageId],
    queryFn: async () => {
      if (!user) return { data: [] }
      const response = await api.get(`/api/page-notes/page/${pageId}`)
      return response.data
    },
    enabled: !!user && !!pageId,
  })

  const notes: PageNote[] = notesData?.data || []

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (data: {
      page_id: number
      selected_text: string
      note: string
      start_offset: number
      end_offset: number
    }) => {
      const response = await api.post('/api/page-notes', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Not eklendi')
      setShowNoteDialog(false)
      setSelectedText('')
      setSelectionRange(null)
      setNoteText('')
      queryClient.invalidateQueries({ queryKey: ['page-notes', pageId] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Not eklenirken bir hata oluştu')
    },
  })

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      await api.delete(`/api/page-notes/${noteId}`)
    },
    onSuccess: () => {
      toast.success('Not silindi')
      queryClient.invalidateQueries({ queryKey: ['page-notes', pageId] })
    },
  })

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    if (!contentRef.current || !user) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setSelectedText('')
      setSelectionRange(null)
      return
    }

    const range = selection.getRangeAt(0)
    const selectedText = range.toString().trim()

    if (selectedText.length === 0) {
      setSelectedText('')
      setSelectionRange(null)
      return
    }

    // Calculate offsets relative to the content div
    const contentElement = contentRef.current
    const preSelectionRange = range.cloneRange()
    preSelectionRange.selectNodeContents(contentElement)
    preSelectionRange.setEnd(range.startContainer, range.startOffset)
    const startOffset = preSelectionRange.toString().length

    const postSelectionRange = range.cloneRange()
    postSelectionRange.selectNodeContents(contentElement)
    postSelectionRange.setEnd(range.endContainer, range.endOffset)
    const endOffset = postSelectionRange.toString().length

    setSelectedText(selectedText)
    setSelectionRange({ start: startOffset, end: endOffset })
    setShowNoteDialog(true)
  }, [user])

  // Apply notes to content
  const applyNotesToContent = useCallback(() => {
    if (!contentRef.current || notes.length === 0) return

    const contentElement = contentRef.current
    const textContent = contentElement.textContent || ''
    
    // Sort notes by start offset (descending) to avoid offset issues when inserting
    const sortedNotes = [...notes].sort((a, b) => b.start_offset - a.start_offset)
    
    // Create a map of note highlights
    const noteMap = new Map<number, PageNote>()
    sortedNotes.forEach(note => {
      noteMap.set(note.start_offset, note)
    })

    // We'll use CSS to highlight instead of modifying HTML
    // This is safer and preserves the original content
  }, [notes])

  useEffect(() => {
    if (!contentRef.current) return

    const element = contentRef.current
    element.addEventListener('mouseup', handleTextSelection)

    return () => {
      element.removeEventListener('mouseup', handleTextSelection)
    }
  }, [handleTextSelection])

  // Apply screen filter styles
  const getFilterStyles = () => {
    switch (screenFilter) {
      case 'blue-light':
        return {
          filter: 'brightness(0.9) contrast(1.1)',
          backgroundColor: 'rgba(135, 206, 250, 0.05)',
        }
      case 'night':
        return {
          filter: 'brightness(0.7) contrast(1.2)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          color: '#e5e5e5',
        }
      case 'sepia':
        return {
          filter: 'sepia(0.3)',
          backgroundColor: '#f4e4bc',
        }
      default:
        return {}
    }
  }

  // Render content with note highlights
  const renderContentWithNotes = () => {
    if (notes.length === 0) {
      return content
    }

    // Create a map of notes by their position
    const notePositions = new Map<number, PageNote>()
    notes.forEach(note => {
      notePositions.set(note.start_offset, note)
    })

    // We'll use a simpler approach: wrap the content and use CSS for highlighting
    // The actual highlighting will be done via CSS classes based on note positions
    return content
  }

  const handleSaveNote = () => {
    if (!selectionRange || !selectedText.trim()) return

    createNoteMutation.mutate({
      page_id: pageId,
      selected_text: selectedText,
      note: noteText.trim() || null,
      start_offset: selectionRange.start,
      end_offset: selectionRange.end,
    })
  }

  // Get filter class name
  const getFilterClassName = () => {
    switch (screenFilter) {
      case 'blue-light':
        return 'reading-filter-blue-light'
      case 'night':
        return 'reading-filter-night'
      case 'sepia':
        return 'reading-filter-sepia'
      default:
        return ''
    }
  }

  return (
    <div className="relative">
      {/* Screen Filter Overlay */}
      {screenFilter !== 'none' && (
        <div
          className={cn(
            'fixed inset-0 pointer-events-none z-0 transition-all duration-300',
            getFilterClassName()
          )}
          style={getFilterStyles()}
        />
      )}

      {/* Content with Notes */}
      <article
        ref={contentRef}
        className={cn(
          'prose prose-lg dark:prose-invert max-w-none mb-12 relative z-10',
          'prose-headings:font-serif prose-p:font-sans',
          'prose-img:rounded-lg prose-img:shadow-md',
          '[&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-900 [&_mark]:px-1 [&_mark]:rounded',
          '[&_mark]:cursor-pointer [&_mark]:transition-all',
          '[&_mark:hover]:bg-yellow-300 [&_mark:hover]:dark:bg-yellow-800'
        )}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
        }}
        dangerouslySetInnerHTML={{ __html: renderContentWithNotes() }}
      />

      {/* Note Dialog */}
      <Popover open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Not Ekle</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowNoteDialog(false)
                  setSelectedText('')
                  setSelectionRange(null)
                  setNoteText('')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Seçilen metin: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
              </p>
              <Textarea
                placeholder="Notunuzu yazın (isteğe bağlı)..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowNoteDialog(false)
                  setSelectedText('')
                  setSelectionRange(null)
                  setNoteText('')
                }}
              >
                İptal
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNote}
                disabled={createNoteMutation.isPending}
              >
                {createNoteMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Note Tooltip */}
      {hoveredNote && (
        <div className="fixed z-50 bg-popover border rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Seçilen Metin:</p>
              <p className="text-sm text-muted-foreground mb-2">
                "{hoveredNote.selected_text.substring(0, 100)}{hoveredNote.selected_text.length > 100 ? '...' : ''}"
              </p>
              {hoveredNote.note && (
                <>
                  <p className="text-sm font-medium mb-1">Notunuz:</p>
                  <p className="text-sm">{hoveredNote.note}</p>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteNoteMutation.mutate(hoveredNote.id)}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .reading-filter-blue-light {
          background: linear-gradient(180deg, rgba(135, 206, 250, 0.1) 0%, rgba(135, 206, 250, 0.05) 100%);
        }
        .reading-filter-night {
          background: rgba(0, 0, 0, 0.4);
          color: #e5e5e5;
        }
        .reading-filter-sepia {
          background: #f4e4bc;
        }
      `}</style>
    </div>
  )
}

