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

/**
 * Parse comment content and extract tags
 * Format: @book{id}, @section{id}, @page{id}, @author{id}
 */
export function parseCommentTags(content: string): CommentTag[] {
  const tags: CommentTag[] = []
  let lastIndex = 0

  // Regex to match @type{id} or @type{id}text
  const tagRegex = /@(book|section|page|author)\{(\d+)\}([^@]*?)(?=@|$)/g
  let match

  while ((match = tagRegex.exec(content)) !== null) {
    const [fullMatch, type, id, text] = match
    const startIndex = match.index

    // Add text before tag
    if (startIndex > lastIndex) {
      const textBefore = content.substring(lastIndex, startIndex)
      if (textBefore.trim()) {
        tags.push({
          type: 'text',
          content: textBefore,
        })
      }
    }

    // Add tag
    tags.push({
      type: type as 'book' | 'section' | 'page' | 'author',
      id: parseInt(id),
      content: text.trim() || `${type} ${id}`,
      href: getTagHref(type as 'book' | 'section' | 'page' | 'author', parseInt(id)),
    })

    lastIndex = tagRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex)
    if (remainingText.trim()) {
      tags.push({
        type: 'text',
        content: remainingText,
      })
    }
  }

  // If no tags found, return entire content as text
  if (tags.length === 0) {
    tags.push({
      type: 'text',
      content: content,
    })
  }

  return tags
}

/**
 * Get href for a tag based on type and id
 */
function getTagHref(
  type: 'book' | 'section' | 'page' | 'author',
  id: number
): string {
  switch (type) {
    case 'book':
      return `/book/${id}`
    case 'section':
      // Section links need book context, so we'll need to handle this differently
      return `#section-${id}`
    case 'page':
      // Page links need book and section context
      return `#page-${id}`
    case 'author':
      return `/profile/${id}`
    default:
      return '#'
  }
}

/**
 * Format comment content with tags for display
 * This creates a format that can be easily rendered
 */
export function formatCommentWithTags(content: string): CommentTag[] {
  return parseCommentTags(content)
}

