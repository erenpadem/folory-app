import { describe, expect, it } from 'vitest';
import {
  BASE_PAGE_CAPACITY,
  getRemainingCapacity,
  isContentOverLimit,
} from './page-content-calculator';

describe('page-content-calculator', () => {
  it('returns full capacity for empty html on server-like env', () => {
    expect(getRemainingCapacity('')).toBe(BASE_PAGE_CAPACITY);
    expect(isContentOverLimit('')).toBe(false);
  });

  it('isOverLimit false for short html', () => {
    const html = '<p>' + 'word '.repeat(50) + '</p>';
    expect(isContentOverLimit(html)).toBe(false);
  });
});
