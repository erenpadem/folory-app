import { describe, expect, it } from 'vitest'
import { commentAuthorAvatar, commentAuthorLabel } from './comment-user-display'

describe('commentAuthorLabel', () => {
  it('prefers display name then username', () => {
    expect(commentAuthorLabel({ name: 'Eren Padem', username: 'erenpadem' })).toBe('Eren Padem')
    expect(commentAuthorLabel({ name: '', username: 'erenpadem' })).toBe('erenpadem')
    expect(commentAuthorLabel(null)).toBe('Kullanıcı')
  })
})

describe('commentAuthorAvatar', () => {
  it('resolves relative avatar paths against API base', () => {
    const url = commentAuthorAvatar({ avatar: '/storage/avatars/a.jpg' })
    expect(url).toContain('/storage/avatars/a.jpg')
  })

  it('passes through data URLs', () => {
    const data = 'data:image/png;base64,abc'
    expect(commentAuthorAvatar({ avatar: data })).toBe(data)
  })
})
