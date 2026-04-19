import { describe, expect, it, vi, afterEach } from 'vitest';
import { buildLoginUrl, getCurrentReturnTo } from '@/lib/auth-redirect';

describe('buildLoginUrl', () => {
  it('returns base path without query', () => {
    expect(buildLoginUrl()).toBe('/auth/login');
  });

  it('adds returnTo and register tab', () => {
    expect(buildLoginUrl({ returnTo: '/explore', tab: 'register' })).toBe(
      '/auth/login?returnTo=%2Fexplore&tab=register'
    );
  });
});

describe('getCurrentReturnTo', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns pathname and search from window.location', () => {
    vi.stubGlobal('window', {
      location: { pathname: '/book/1', search: '?x=1' },
    });
    expect(getCurrentReturnTo()).toBe('/book/1?x=1');
  });
});
