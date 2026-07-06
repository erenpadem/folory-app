import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fetchBookComments } from './book-comments-api'

vi.mock('@/shared/lib/api-client', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '@/shared/lib/api-client'

describe('fetchBookComments', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  it('unwraps Laravel collection shape to comments array', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [{ id: 1, content: 'Merhaba' }],
        meta: { total: 1 },
      },
    })

    const result = await fetchBookComments(42)
    expect(result.comments).toHaveLength(1)
    expect(result.total).toBe(1)
  })

  it('unwraps nested resource collection data', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: { data: [{ id: 2, content: 'Nested' }] },
        meta: { total: 1 },
      },
    })

    const result = await fetchBookComments(7)
    expect(result.comments).toHaveLength(1)
    expect(result.comments[0].id).toBe(2)
  })
})
