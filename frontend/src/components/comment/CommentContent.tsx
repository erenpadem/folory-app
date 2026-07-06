'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  parseCommentTags,
  type CommentTag,
  type CommentTagLinkMap,
} from '@/lib/comment-tags'
import { Book, FileText, User, Hash } from 'lucide-react'

interface CommentContentProps {
  content: string
  bookId?: number
  bookSlug?: string
  tagLinks?: CommentTagLinkMap
}

export function CommentContent({
  content,
  bookSlug,
  tagLinks,
}: CommentContentProps) {
  const safeContent = typeof content === 'string' ? content : ''
  const tags = parseCommentTags(safeContent, { bookSlug, tagLinks })

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

  return (
    <div className="text-sm leading-relaxed">
      {tags.map((tag, index) => {
        if (tag.type === 'text') {
          return <span key={index}>{tag.content}</span>
        }

        if (!tag.href) {
          return (
            <Badge
              key={index}
              variant="secondary"
              className="mx-1 text-xs font-normal"
            >
              {getTagIcon(tag.type)}
              {tag.content}
            </Badge>
          )
        }

        return (
          <Link key={index} href={tag.href} className="inline-flex items-center">
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
