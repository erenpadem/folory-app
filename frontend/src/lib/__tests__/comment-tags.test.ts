import { describe, expect, it } from 'vitest';
import { parseCommentTags } from '@/lib/comment-tags';

describe('parseCommentTags', () => {
  it('returns plain text when no tags', () => {
    const tags = parseCommentTags('Merhaba dünya');
    expect(tags).toHaveLength(1);
    expect(tags[0]).toEqual({ type: 'text', content: 'Merhaba dünya' });
  });

  it('parses @book{id} and trailing text', () => {
    const tags = parseCommentTags('Bak @book{42} harika', { bookSlug: 'deneme' });
    expect(tags.some((t) => t.type === 'book' && t.id === 42)).toBe(true);
    expect(tags.find((t) => t.type === 'book')?.href).toBe('/book/deneme');
  });

  it('uses tag_links from API when provided', () => {
    const tags = parseCommentTags('@author{7} selam', {
      tagLinks: { 'author:7': '/profile/erenpadem' },
    });
    const a = tags.find((t) => t.type === 'author');
    expect(a?.href).toBe('/profile/erenpadem');
  });

  it('parses @author{id} with fallback href', () => {
    const tags = parseCommentTags('@author{7} selam');
    const a = tags.find((t) => t.type === 'author');
    expect(a?.id).toBe(7);
    expect(a?.href).toBe('/profile/7');
  });
});
