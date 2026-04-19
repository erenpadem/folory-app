'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Book, User, FileText, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/shared/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'

interface MentionTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  bookId?: number
  className?: string
}

interface MentionSuggestion {
  id: number
  type: 'book' | 'author' | 'section' | 'page'
  display: string
  title?: string
  name?: string
  avatar?: string
  cover?: string
  slug?: string
}

export function MentionTextarea({
  value,
  onChange,
  placeholder = 'Yorumunuzu yazın... @ ile kitap, yazar, bölüm veya sayfa etiketleyebilirsiniz',
  bookId,
  className,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionStart, setMentionStart] = useState(-1)

  // Fetch autocomplete suggestions
  const { data: suggestionsData, isLoading } = useQuery({
    queryKey: ['mention-suggestions', mentionQuery, bookId],
    queryFn: async () => {
      const params: any = { q: mentionQuery }
      if (bookId) params.book_id = bookId
      const response = await api.get('/api/autocomplete/mentions', { params })
      return response.data
    },
    enabled: showSuggestions && mentionQuery.length > 0,
  })

  // Combine all suggestions
  const suggestions: MentionSuggestion[] = suggestionsData?.data
    ? [
        ...(suggestionsData.data.books || []),
        ...(suggestionsData.data.authors || []),
        ...(suggestionsData.data.sections || []),
        ...(suggestionsData.data.pages || []),
      ]
    : []

  // Handle text change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart || 0
    onChange(newValue)
    setCursorPosition(cursorPos)

    // Check for @ mention
    const textBeforeCursor = newValue.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      // Check if there's a space after @ (meaning mention ended)
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
        setShowSuggestions(false)
        setMentionQuery('')
        setMentionStart(-1)
        return
      }

      // Extract query
      const query = textAfterAt.trim()
      setMentionQuery(query)
      setMentionStart(lastAtIndex)
      setShowSuggestions(true)
      setSelectedIndex(0)
    } else {
      setShowSuggestions(false)
      setMentionQuery('')
      setMentionStart(-1)
    }
  }

  // Insert mention into text
  const insertMention = (suggestion: MentionSuggestion) => {
    if (mentionStart === -1) return

    const textBefore = value.substring(0, mentionStart)
    const textAfter = value.substring(cursorPosition)
    const mentionText = `@${suggestion.type}{${suggestion.id}}${suggestion.display} `
    const newValue = textBefore + mentionText + textAfter

    onChange(newValue)
    setShowSuggestions(false)
    setMentionQuery('')
    setMentionStart(-1)

    // Focus textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = textBefore.length + mentionText.length
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (suggestions[selectedIndex]) {
        insertMention(suggestions[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setMentionQuery('')
      setMentionStart(-1)
    }
  }

  const getSuggestionIcon = (type: MentionSuggestion['type']) => {
    switch (type) {
      case 'book':
        return <Book className="h-4 w-4" />
      case 'author':
        return <User className="h-4 w-4" />
      case 'section':
        return <FileText className="h-4 w-4" />
      case 'page':
        return <Hash className="h-4 w-4" />
    }
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn('min-h-[100px]', className)}
      />

      {/* Suggestions Popover */}
      {showSuggestions && (
        <div className="absolute z-50 mt-1 w-full max-w-md bg-popover border rounded-md shadow-lg">
          <ScrollArea className="h-[200px]">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Yükleniyor...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Sonuç bulunamadı
              </div>
            ) : (
              <div className="p-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${suggestion.id}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors',
                      index === selectedIndex
                        ? 'bg-accent'
                        : 'hover:bg-accent/50'
                    )}
                    onClick={() => insertMention(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex-shrink-0 text-muted-foreground">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    {suggestion.type === 'author' && suggestion.avatar && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={suggestion.avatar} />
                        <AvatarFallback className={getAvatarColor(suggestion.display || '')}>
                          {getInitials(suggestion.display || '')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {suggestion.type === 'book' && suggestion.cover && (
                      <img
                        src={suggestion.cover}
                        alt={suggestion.title}
                        className="h-6 w-4 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {suggestion.display}
                      </p>
                      {suggestion.type === 'page' && suggestion.title && (
                        <p className="text-xs text-muted-foreground truncate">
                          {suggestion.title}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

