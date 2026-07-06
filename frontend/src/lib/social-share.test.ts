import { describe, expect, it } from 'vitest'
import { buildBookSharePayload } from './social-share'

describe('buildBookSharePayload', () => {
  it('builds url, title and description from book data', () => {
    const payload = buildBookSharePayload(
      {
        id: 1,
        slug: 'deneme',
        title: 'deneme',
        shortDescription: 'Kısa açıklama',
        cover: 'https://cdn.example/cover.jpg',
      },
      'https://beta.fo-lory.com'
    )

    expect(payload.url).toBe('https://beta.fo-lory.com/book/deneme')
    expect(payload.title).toBe('deneme')
    expect(payload.description).toBe('Kısa açıklama')
    expect(payload.imageUrl).toBe('https://cdn.example/cover.jpg')
  })

  it('falls back to brand description when short description is empty', () => {
    const payload = buildBookSharePayload(
      {
        id: 2,
        title: 'Kitap',
        shortDescription: null,
        cover: null,
      },
      'https://fo-lory.com'
    )

    expect(payload.description).toContain('Kitap')
    expect(payload.description).toContain("Fo-lory'da okuyun")
  })
})
