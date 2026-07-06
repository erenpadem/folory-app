'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { parseCommentTags, CommentTag } from '@/lib/comment-tags'
import { Book, FileText, User, Hash } from 'lucide-react'

interface CommentContentProps {
  content: string
  bookId?: number
  bookSlug?: string
}

export function CommentContent({ content, bookId, bookSlug }: CommentContentProps) {
  const safeContent = typeof content === 'string' ? content : ''
  const tags = parseCommentTags(safeContent)

  const getTagIcon = (type: CommentTag['type']) => {
    switch (type) {
      case 'book':
        return <Book className="h-3 w-3 mr-1" />
      case 'section':
        return <FileText className="h-3 w-3 mr-1" />
      case 'page':
        return <Hash className="h-3 w-3 mr-1" />
      case 'author':
        return <User className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  const getTagHref = (tag: CommentTag): string => {
    if (!tag.href) return '#'
    
    // For section and page, we need book context
    if (tag.type === 'section' || tag.type === 'page') {
      if (bookSlug) {
        // We'll need to construct the full path based on book structure
        // For now, return a hash link
        return tag.href
      }
      return tag.href
    }
    
    return tag.href
  }

  return (
    <div className="text-sm leading-relaxed">
      {tags.map((tag, index) => {
        if (tag.type === 'text') {
          return <span key={index}>{tag.content}</span>
        }

        return (
          <Link
            key={index}
            href={getTagHref(tag)}
            className="inline-flex items-center"
          >
            <Badge
              variant="secondary"
              className="mx-1 text-xs font-normal hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              {getTagIcon(tag.type)}
              {tag.content}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}

