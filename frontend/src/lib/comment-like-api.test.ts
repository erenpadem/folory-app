import { describe, expect, it, vi, beforeEach } from 'vitest'
import { toggleCommentLike } from './comment-like-api'

vi.mock('@/shared/lib/api-client', () => ({
  default: {
    post: vi.fn(),
  },
}))

import api from '@/shared/lib/api-client'

describe('toggleCommentLike', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
  })

  it('parses nested data payload', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, data: { liked: true, likes_count: 3 } },
    })

    await expect(toggleCommentLike(12)).resolves.toEqual({
      liked: true,
      likes_count: 3,
    })
  })
})
