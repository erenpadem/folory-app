import { describe, expect, it } from 'vitest';
import { pageHasWrittenContent } from './page-content';

describe('pageHasWrittenContent', () => {
  it('returns false for empty or whitespace-only html', () => {
    expect(pageHasWrittenContent('')).toBe(false);
    expect(pageHasWrittenContent('<p></p>')).toBe(false);
    expect(pageHasWrittenContent('<p>&nbsp;</p>')).toBe(false);
  });

  it('returns true when readable text exists', () => {
    expect(pageHasWrittenContent('<p>Merhaba</p>')).toBe(true);
  });
});
