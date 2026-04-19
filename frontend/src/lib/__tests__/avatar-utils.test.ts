import { describe, expect, it } from 'vitest';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';

describe('getInitials', () => {
  it('returns ? for empty input', () => {
    expect(getInitials(null)).toBe('?');
    expect(getInitials(undefined)).toBe('?');
  });

  it('returns single letter for one word', () => {
    expect(getInitials('Mehmet')).toBe('M');
  });

  it('returns first and last word initials', () => {
    expect(getInitials('Eren Padem')).toBe('EP');
    expect(getInitials('Ayşe Yılmaz Demir')).toBe('AD');
  });
});

describe('getAvatarColor', () => {
  it('returns gray for empty name', () => {
    expect(getAvatarColor(null)).toBe('bg-gray-500');
  });

  it('returns a tailwind bg class for any name', () => {
    const c = getAvatarColor('Test User');
    expect(c).toMatch(/^bg-/);
  });
});
