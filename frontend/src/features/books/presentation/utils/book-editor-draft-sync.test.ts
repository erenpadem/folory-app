import { describe, expect, it } from 'vitest';
import { BookEntity, PageEntity, SectionEntity } from '@/features/books';
import {
  mergeSectionsAfterDraftSave,
  remapClientSectionIdsFromServer,
  prunePagesMapToSections,
  type DraftSyncPayloadSection,
} from './book-editor-draft-sync';

const now = new Date('2026-01-01T00:00:00Z');

function section(
  id: number,
  title: string,
  order: number,
  pages: PageEntity[] = []
): SectionEntity {
  return new SectionEntity(id, 1, title, order, pages.length, true, now, now, pages);
}

function book(...sections: SectionEntity[]): BookEntity {
  return BookEntity.fromPrimitives({
    id: 1,
    author_id: 1,
    category_id: 1,
    title: 'Kitap',
    short_description: null,
    cover: null,
    read_count: 0,
    total_page: 0,
    is_adult: false,
    is_draft: true,
    is_published: false,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    sections: sections.map((s) => s.toPrimitives()),
  });
}

describe('mergeSectionsAfterDraftSave', () => {
  it('drops zombie sections returned by server but omitted from payload', () => {
    const client = [section(6, 'Kalacak', 0)];
    const sent: DraftSyncPayloadSection[] = [
      { id: 6, title: 'Kalacak', order: 0, is_visible: true, pages: [] },
    ];
    const server = book(
      section(5, 'Silinecek', 0),
      section(6, 'Kalacak', 1)
    );

    const merged = mergeSectionsAfterDraftSave(sent, client, server);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.id).toBe(6);
    expect(merged[0]!.title).toBe('Kalacak');
  });

  it('assigns server ids to new client sections without pulling zombies', () => {
    const client = [section(-100, 'Yeni', 0)];
    const sent: DraftSyncPayloadSection[] = [
      { title: 'Yeni', order: 0, is_visible: true, pages: [] },
    ];
    const server = book(section(5, 'Zombie', 0), section(7, 'Yeni', 0));

    const merged = mergeSectionsAfterDraftSave(sent, client, server);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.id).toBe(7);
    expect(merged[0]!.title).toBe('Yeni');
  });

  it('returns empty when payload sent no sections', () => {
    const merged = mergeSectionsAfterDraftSave([], [section(1, 'A', 0)], book(section(1, 'A', 0)));
    expect(merged).toEqual([]);
  });
});

describe('remapClientSectionIdsFromServer', () => {
  it('maps negative client ids without adding server-only sections', () => {
    const client = [section(-1, 'B', 0), section(-2, 'C', 1)];
    const sent: DraftSyncPayloadSection[] = [
      { title: 'B', order: 0, is_visible: true, pages: [] },
      { title: 'C', order: 1, is_visible: true, pages: [] },
    ];
    const server = book(section(10, 'B', 0), section(11, 'C', 1), section(99, 'Zombie', 2));

    const remapped = remapClientSectionIdsFromServer(client, sent, server);
    expect(remapped).toHaveLength(2);
    expect(remapped.map((s) => s.id).sort()).toEqual([10, 11]);
  });
});

describe('prunePagesMapToSections', () => {
  it('removes pages keyed under deleted section ids', () => {
    const sections = [section(6, 'Kalacak', 0)];
    const pages = {
      5: [new PageEntity(1, 5, '<p>old</p>', 0, now, now)],
      6: [new PageEntity(2, 6, '<p>keep</p>', 0, now, now)],
    };
    const pruned = prunePagesMapToSections(pages, sections);
    expect(Object.keys(pruned)).toEqual(['6']);
    expect(pruned[6]).toHaveLength(1);
    expect(pruned[6]![0]!.content).toContain('keep');
  });
});
