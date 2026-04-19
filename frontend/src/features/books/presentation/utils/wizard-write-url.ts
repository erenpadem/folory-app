import type { PageEntity, SectionEntity } from '@/features/books';
import { getWizardSectionPages } from './wizard-section-pages';

/** Sorgu anahtarları: ?step=4&section=...&page=... */
export const WIZARD_URL_SECTION = 'section';
export const WIZARD_URL_PAGE = 'page';

export function slugifyWizardSegment(title: string): string {
  const t = title
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '');
  const s = t.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
  return s || 'bolum';
}

/**
 * Bölüm için URL segmenti: başlıktan slug; aynı başlık birden fazlaysa `-o{order}` eklenir.
 */
export function getWizardSectionSlug(
  section: SectionEntity,
  allSections: SectionEntity[]
): string {
  const base = slugifyWizardSegment(section.title);
  const sameTitle = allSections.filter(
    (s) => slugifyWizardSegment(s.title) === base
  );
  if (sameTitle.length <= 1) return base;
  return `${base}-o${section.order}`;
}

export function sortWizardSectionPages(
  section: SectionEntity,
  pagesBySection: Record<number, PageEntity[]>
): PageEntity[] {
  return [...getWizardSectionPages(section, pagesBySection)].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.id - b.id;
  });
}

export function getWizardPageOneBased(
  pageId: number,
  section: SectionEntity,
  pagesBySection: Record<number, PageEntity[]>
): number {
  const list = sortWizardSectionPages(section, pagesBySection);
  const idx = list.findIndex((p) => p.id === pageId);
  return idx >= 0 ? idx + 1 : 1;
}

export function findWizardSectionBySlug(
  slug: string | null,
  allSections: SectionEntity[]
): SectionEntity | undefined {
  if (!slug?.trim() || allSections.length === 0) return undefined;
  const want = slug.trim().toLowerCase();
  return allSections.find(
    (s) => getWizardSectionSlug(s, allSections).toLowerCase() === want
  );
}

export function clearWizardWriteContextParams(url: URL): void {
  url.searchParams.delete(WIZARD_URL_SECTION);
  url.searchParams.delete(WIZARD_URL_PAGE);
}
