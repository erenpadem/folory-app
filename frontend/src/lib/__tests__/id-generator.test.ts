import { describe, expect, it } from 'vitest';
import { generateTempId } from '@/lib/id-generator';

describe('generateTempId', () => {
  it('returns negative integers', () => {
    const a = generateTempId();
    const b = generateTempId();
    expect(a).toBeLessThan(0);
    expect(b).toBeLessThan(0);
    expect(a).not.toBe(b);
  });
});
