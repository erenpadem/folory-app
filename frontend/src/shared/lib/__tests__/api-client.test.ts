import { describe, expect, it } from 'vitest';
import { normalizeApiUrl } from '@/shared/lib/api-client';

describe('normalizeApiUrl', () => {
  it('prepends /api for paths without it', () => {
    expect(normalizeApiUrl('/login')).toBe('/api/login');
    expect(normalizeApiUrl('books')).toBe('/api/books');
  });

  it('leaves /api-prefixed paths unchanged', () => {
    expect(normalizeApiUrl('/api/books')).toBe('/api/books');
  });

  it('does not alter absolute URLs', () => {
    expect(normalizeApiUrl('https://example.com/hook')).toBe('https://example.com/hook');
  });

  it('returns undefined for undefined input', () => {
    expect(normalizeApiUrl(undefined)).toBeUndefined();
  });
});
