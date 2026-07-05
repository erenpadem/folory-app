import { BookEntity, PageEntity, SectionEntity } from '@/features/books';

export type DraftSyncPayloadSection = {
  id?: number;
  title: string;
  order: number;
  is_visible: boolean;
  pages: { id?: number; content: string; order: number }[];
};

export type DraftSyncPayload = {
  title?: string;
  short_description?: string;
  cover?: string;
  category_id?: number;
  is_adult: boolean;
  sections: DraftSyncPayloadSection[];
};

/**
 * Taslak POST yanıtından yalnızca istemcinin gönderdiği bölümleri al.
 * Sunucu prune etmemişse bile DB'deki "zombie" bölümler store'a geri yazılmaz.
 */
export function mergeSectionsAfterDraftSave(
  sentSections: DraftSyncPayloadSection[],
  clientSections: SectionEntity[],
  serverBook: BookEntity
): SectionEntity[] {
  if (sentSections.length === 0) return [];

  const clientById = new Map(clientSections.map((s) => [s.id, s]));
  const serverById = new Map(serverBook.sections.map((s) => [s.id, s]));
  const unassigned = [...serverBook.sections];
  const takeUnassigned = (pred: (s: SectionEntity) => boolean): SectionEntity | undefined => {
    const idx = unassigned.findIndex(pred);
    if (idx < 0) return undefined;
    return unassigned.splice(idx, 1)[0];
  };

  const sortedSent = [...sentSections].sort((a, b) => a.order - b.order);
  const out: SectionEntity[] = [];

  for (const sent of sortedSent) {
    const client =
      sent.id != null && sent.id > 0
        ? clientById.get(sent.id)
        : clientSections.find(
            (s) =>
              s.id < 0 &&
              s.order === sent.order &&
              (s.title === sent.title || sent.title === 'Bölüm')
          );

    let server: SectionEntity | undefined;
    if (sent.id != null && sent.id > 0) {
      server = serverById.get(sent.id);
    }
    if (!server) {
      server =
        takeUnassigned((s) => s.order === sent.order && s.title === sent.title) ??
        takeUnassigned((s) => s.order === sent.order) ??
        takeUnassigned((s) => s.title === sent.title) ??
        takeUnassigned(() => true);
    }

    if (!server) {
      if (client) out.push(client);
      continue;
    }

    out.push(
      new SectionEntity(
        server.id,
        server.bookId,
        sent.title?.trim() || client?.title || server.title,
        sent.order ?? client?.order ?? server.order,
        server.totalPage,
        typeof sent.is_visible === 'boolean' ? sent.is_visible : (client?.isVisible ?? server.isVisible),
        server.createdAt,
        server.updatedAt,
        server.pages
      )
    );
  }

  return out.sort((a, b) => a.order - b.order);
}

/** Sunucu yanıtı gelene kadar istemci değiştiyse: yalnızca id eşlemesi, liste ezilmez. */
export function remapClientSectionIdsFromServer(
  clientSections: SectionEntity[],
  sentSections: DraftSyncPayloadSection[],
  serverBook: BookEntity
): SectionEntity[] {
  if (sentSections.length === 0) return clientSections;

  const sortedSent = [...sentSections].sort((a, b) => a.order - b.order);
  const sortedClient = [...clientSections].sort((a, b) => a.order - b.order);
  const serverSorted = [...serverBook.sections].sort((a, b) => a.order - b.order);
  const usedServer = new Set<number>();

  return sortedClient.map((client, idx) => {
    if (client.id > 0) return client;

    const sent = sortedSent[idx];
    let server: SectionEntity | undefined;
    if (sent?.id != null && sent.id > 0) {
      server = serverBook.sections.find((s) => s.id === sent.id);
    }
    if (!server) {
      server = serverSorted.find(
        (s) =>
          !usedServer.has(s.id) &&
          (s.order === client.order || s.title === client.title)
      );
    }
    if (!server) return client;

    usedServer.add(server.id);
    return new SectionEntity(
      server.id,
      server.bookId,
      client.title,
      client.order,
      server.totalPage,
      client.isVisible,
      client.createdAt,
      client.updatedAt,
      client.pages
    );
  });
}

export function buildPagesRecordFromSections(
  sections: SectionEntity[]
): Record<number, PageEntity[]> {
  return sections.reduce((acc, section) => {
    const list = (section.pages ?? []).filter((p) => p != null);
    if (list.length > 0) {
      acc[section.id] = list;
    }
    return acc;
  }, {} as Record<number, PageEntity[]>);
}

export function prunePagesMapToSections(
  pages: Record<number, PageEntity[]>,
  sections: SectionEntity[]
): Record<number, PageEntity[]> {
  const allowedIds = new Set(sections.map((s) => s.id));
  const pruned: Record<number, PageEntity[]> = {};

  for (const section of sections) {
    const fromKey = pages[section.id] ?? [];
    const collected: PageEntity[] = [];
    const seen = new Set<number>();

    for (const list of Object.values(pages)) {
      for (const p of list ?? []) {
        if (p != null && p.sectionId === section.id && !seen.has(p.id)) {
          seen.add(p.id);
          collected.push(p);
        }
      }
    }

    const byId = new Map<number, PageEntity>();
    for (const p of fromKey) {
      if (p != null) byId.set(p.id, p);
    }
    for (const p of collected) {
      byId.set(p.id, p);
    }

    const merged = Array.from(byId.values()).sort((a, b) => {
      const oa = a.order ?? 0;
      const ob = b.order ?? 0;
      if (oa !== ob) return oa - ob;
      return a.id - b.id;
    });

    if (merged.length > 0) {
      pruned[section.id] = merged;
    }
  }

  for (const [key, list] of Object.entries(pages)) {
    const id = Number(key);
    if (!allowedIds.has(id)) continue;
    if (pruned[id]) continue;
    if (list?.length) pruned[id] = list;
  }

  return pruned;
}
