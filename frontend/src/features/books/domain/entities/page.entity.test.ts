import { describe, expect, it } from 'vitest';
import { PageEntity } from './page.entity';

describe('PageEntity.fromPrimitives', () => {
  it('returns empty content for null/invalid input', () => {
    const a = PageEntity.fromPrimitives(null);
    expect(a.content).toBe('');
    expect(a.id).toBe(0);

    const b = PageEntity.fromPrimitives(undefined);
    expect(b.content).toBe('');
  });

  it('maps API snake_case and coerces content', () => {
    const p = PageEntity.fromPrimitives({
      id: 5,
      section_id: 2,
      content: '<p>Hi</p>',
      order: 1,
    });
    expect(p.id).toBe(5);
    expect(p.sectionId).toBe(2);
    expect(p.content).toBe('<p>Hi</p>');
  });

  it('treats missing content as empty string', () => {
    const p = PageEntity.fromPrimitives({
      id: 1,
      section_id: 1,
      order: 0,
    });
    expect(p.content).toBe('');
  });
});
