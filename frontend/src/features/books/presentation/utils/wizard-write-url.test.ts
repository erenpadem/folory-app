import { describe, expect, it } from 'vitest';
import { PageEntity, SectionEntity } from '@/features/books';
import {
  clearWizardWriteContextParams,
  findWizardSectionBySlug,
  getWizardPageOneBased,
  getWizardSectionSlug,
  slugifyWizardSegment,
  sortWizardSectionPages,
  WIZARD_URL_PAGE,
  WIZARD_URL_SECTION,
} from './wizard-write-url';

const now = new Date();

function section(
  id: number,
  title: string,
  order: number,
  pages: PageEntity[] = []
): SectionEntity {
  return new SectionEntity(
    id,
    1,
    title,
    order,
    pages.length,
    true,
    now,
    now,
    pages
  );
}

describe('slugifyWizardSegment', () => {
  it('normalizes Turkish and non-ascii to ascii slug', () => {
    expect(slugifyWizardSegment('  Giriş Bölümü  ')).toBe('giris-bolumu');
  });

  it('returns fallback for empty title', () => {
    expect(slugifyWizardSegment('')).toBe('bolum');
    expect(slugifyWizardSegment('   ')).toBe('bolum');
  });
});

describe('getWizardSectionSlug', () => {
  it('uses title slug when title is unique', () => {
    const s = section(1, 'Önsöz', 0);
    expect(getWizardSectionSlug(s, [s])).toBe('onsoz');
  });

  it('adds order suffix when same slug title appears twice', () => {
    const a = section(1, 'Bölüm', 0);
    const b = section(2, 'Bölüm', 1);
    const all = [a, b];
    expect(getWizardSectionSlug(a, all)).toBe('bolum-o0');
    expect(getWizardSectionSlug(b, all)).toBe('bolum-o1');
  });
});

describe('sortWizardSectionPages and getWizardPageOneBased', () => {
  it('sorts by order then id and returns 1-based index', () => {
    const sec = section(10, 'S', 0);
    const p1 = new PageEntity(101, 10, '', 1, now, now);
    const p0 = new PageEntity(100, 10, '', 0, now, now);
    const map: Record<number, PageEntity[]> = {
      10: [p1, p0],
    };
    const sorted = sortWizardSectionPages(sec, map);
    expect(sorted.map((p) => p.id)).toEqual([100, 101]);
    expect(getWizardPageOneBased(100, sec, map)).toBe(1);
    expect(getWizardPageOneBased(101, sec, map)).toBe(2);
  });

  it('returns 1 when page id not in section', () => {
    const sec = section(1, 'S', 0);
    expect(getWizardPageOneBased(999, sec, {})).toBe(1);
  });
});

describe('findWizardSectionBySlug', () => {
  it('finds section case-insensitively by canonical slug', () => {
    const s = section(5, 'Tanışma', 0);
    const slug = getWizardSectionSlug(s, [s]);
    expect(findWizardSectionBySlug(slug, [s])?.id).toBe(5);
    expect(findWizardSectionBySlug(slug.toUpperCase(), [s])?.id).toBe(5);
  });

  it('returns undefined for null or empty slug', () => {
    expect(findWizardSectionBySlug(null, [section(1, 'A', 0)])).toBeUndefined();
    expect(findWizardSectionBySlug('   ', [section(1, 'A', 0)])).toBeUndefined();
  });
});

describe('clearWizardWriteContextParams', () => {
  it('removes section and page query keys', () => {
    const url = new URL('https://app.test/dashboard/books/update/x?step=4&section=a&page=2&foo=1');
    clearWizardWriteContextParams(url);
    expect(url.searchParams.has(WIZARD_URL_SECTION)).toBe(false);
    expect(url.searchParams.has(WIZARD_URL_PAGE)).toBe(false);
    expect(url.searchParams.get('step')).toBe('4');
    expect(url.searchParams.get('foo')).toBe('1');
  });
});
