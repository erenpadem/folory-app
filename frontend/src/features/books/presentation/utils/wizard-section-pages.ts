import type { PageEntity, SectionEntity } from '@/features/books';

function sortPages(a: PageEntity, b: PageEntity): number {
  const oa = a.order ?? 0;
  const ob = b.order ?? 0;
  if (oa !== ob) return oa - ob;
  return a.id - b.id;
}

/**
 * Bölüm id’si ile harita anahtarı uyuşmadığında (eski negatif id, persist string anahtar vb.)
 * sayfaları `page.sectionId === section.id` ile toplar.
 */
function collectPagesBySectionId(
  section: SectionEntity,
  pagesBySection: Record<number, PageEntity[]>
): PageEntity[] {
  const byId = new Map<number, PageEntity>();
  for (const list of Object.values(pagesBySection)) {
    if (!list?.length) continue;
    for (const p of list) {
      if (p != null && p.sectionId === section.id) {
        byId.set(p.id, p);
      }
    }
  }
  return Array.from(byId.values()).sort(sortPages);
}

/**
 * Bölüm sayfaları: `pages[sectionId]` haritası + `section.pages` (API) birleşimi.
 * - Sadece `section.pages` dolu, haritada anahtar yok → API sayfaları kullanılır.
 * - Haritada `[]` varken `section.pages` doluysa (yanlış boş init) API’ye düşülür; yoksa gerçekten boştur.
 * - Haritada sayfa varsa id bazında birleştirilir (store’daki güncel içerik baskın).
 * - Anahtar uyuşmazlığında `page.sectionId` ile yedek toplama.
 */
export function getWizardSectionPages(
  section: SectionEntity,
  pagesBySection: Record<number, PageEntity[]>
): PageEntity[] {
  const embedded = (section.pages ?? []).filter((p) => p != null);
  const raw = pagesBySection[section.id];
  if (raw === undefined) {
    if (embedded.length > 0) return embedded;
    return collectPagesBySectionId(section, pagesBySection);
  }
  const storeList = raw.filter((p) => p != null);
  if (storeList.length > 0) {
    const byId = new Map<number, PageEntity>();
    for (const p of embedded) byId.set(p.id, p);
    for (const p of storeList) byId.set(p.id, p);
    return Array.from(byId.values()).sort(sortPages);
  }
  if (embedded.length > 0) return embedded;
  const orphaned = collectPagesBySectionId(section, pagesBySection);
  return orphaned.length > 0 ? orphaned : [];
}
