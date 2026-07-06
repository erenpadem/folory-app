import { describe, expect, it } from 'vitest'
import { isBookAuthor } from './book-ownership'

describe('isBookAuthor', () => {
  it('returns true when API marks viewer_is_author', () => {
    expect(
      isBookAuthor(
        { authorId: 99, viewerIsAuthor: true },
        { id: 1 }
      )
    ).toBe(true)
  })

  it('matches logged-in user id with book author_id', () => {
    expect(
      isBookAuthor(
        { authorId: 5, viewerIsAuthor: false },
        { id: '5' }
      )
    ).toBe(true)
  })

  it('returns false for other readers', () => {
    expect(
      isBookAuthor(
        { authorId: 5, viewerIsAuthor: false },
        { id: 7 }
      )
    ).toBe(false)
  })
})
