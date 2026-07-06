/**
 * Comment Tag Parsing and Rendering Utilities
 * Handles parsing of tags in comments (@book, @section, @page, @author)
 */

export interface CommentTag {
  type: 'book' | 'section' | 'page' | 'author' | 'text'
  content: string
  id?: number | string
  href?: string
}

export type CommentTagLinkMap = Record<string, string>

export type CommentTagContext = {
  bookSlug?: string
  tagLinks?: CommentTagLinkMap
}

/**
 * Parse comment content and extract tags
 * Format: @book{id}, @section{id}, @page{id}, @author{id}
 */
export function parseCommentTags(
  content: string,
  context: CommentTagContext = {}
): CommentTag[] {
  const tags: CommentTag[] = []
  let lastIndex = 0

  const tagRegex = /@(book|section|page|author)\{(\d+)\}([^@]*?)(?=@|$)/g
  let match

  while ((match = tagRegex.exec(content)) !== null) {
    const [, type, id, text] = match
    const startIndex = match.index
    const numericId = parseInt(id, 10)

    if (startIndex > lastIndex) {
      const textBefore = content.substring(lastIndex, startIndex)
      if (textBefore.trim()) {
        tags.push({
          type: 'text',
          content: textBefore,
        })
      }
    }

    const tagType = type as 'book' | 'section' | 'page' | 'author'
    const linkKey = `${tagType}:${numericId}`

    tags.push({
      type: tagType,
      id: numericId,
      content: text.trim() || `${type} ${id}`,
      href:
        context.tagLinks?.[linkKey] ??
        getFallbackTagHref(tagType, numericId, context.bookSlug),
    })

    lastIndex = tagRegex.lastIndex
  }

  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex)
    if (remainingText.trim()) {
      tags.push({
        type: 'text',
        content: remainingText,
      })
    }
  }

  if (tags.length === 0) {
    tags.push({
      type: 'text',
      content: content,
    })
  }

  return tags
}

function getFallbackTagHref(
  type: 'book' | 'section' | 'page' | 'author',
  id: number,
  bookSlug?: string
): string | undefined {
  switch (type) {
    case 'book':
      return `/book/${bookSlug ?? id}`
    case 'author':
      return `/profile/${id}`
    case 'section':
      return bookSlug ? `/book/${bookSlug}` : undefined
    case 'page':
      return bookSlug ? `/book/${bookSlug}` : undefined
    default:
      return undefined
  }
}

export function formatCommentWithTags(
  content: string,
  context?: CommentTagContext
): CommentTag[] {
  return parseCommentTags(content, context)
}
