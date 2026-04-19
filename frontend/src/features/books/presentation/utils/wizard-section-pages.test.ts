import { describe, expect, it } from 'vitest';
import { PageEntity, SectionEntity } from '@/features/books';
import { getWizardSectionPages } from './wizard-section-pages';

describe('getWizardSectionPages', () => {
  const now = new Date();

  it('returns pages from pagesBySection when keyed by section id', () => {
    const section = new SectionEntity(10, 1, 'A', 0, 0, true, now, now, []);
    const p = new PageEntity(100, 10, '<p>hi</p>', 0, now, now);
    const map: Record<number, PageEntity[]> = { 10: [p] };
    expect(getWizardSectionPages(section, map)).toEqual([p]);
  });

  it('uses section.pages when map has no key but embedded pages exist', () => {
    const p = new PageEntity(2, 5, '<p>x</p>', 0, now, now);
    const section = new SectionEntity(5, 1, 'A', 0, 0, true, now, now, [p]);
    const map: Record<number, PageEntity[]> = {};
    expect(getWizardSectionPages(section, map)).toEqual([p]);
  });

  it('collects by page.sectionId when map key mismatches section id', () => {
    const sid = -10;
    const p = new PageEntity(-20, sid, '<p>orphan</p>', 0, now, now);
    const section = new SectionEntity(sid, 0, 'B1', 0, 0, true, now, now, []);
    const wrongKey = -999;
    const map: Record<number, PageEntity[]> = {
      [wrongKey]: [p],
    };
    const result = getWizardSectionPages(section, map);
    expect(result).toHaveLength(1);
    expect(result[0]?.content).toContain('orphan');
    expect(result[0]?.sectionId).toBe(sid);
  });

  it('merges store list with embedded by id (store wins on duplicate id)', () => {
    const sid = 3;
    const embedded = new PageEntity(1, sid, '<p>old</p>', 0, now, now);
    const updated = new PageEntity(1, sid, '<p>new</p>', 0, now, now);
    const section = new SectionEntity(sid, 1, 'A', 0, 0, true, now, now, [embedded]);
    const map: Record<number, PageEntity[]> = {
      [sid]: [updated],
    };
    const result = getWizardSectionPages(section, map);
    expect(result).toHaveLength(1);
    expect(result[0]?.content).toContain('new');
  });
});
