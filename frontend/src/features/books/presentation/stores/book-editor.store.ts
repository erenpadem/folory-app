/**
 * Book Editor Store
 * Manages state for the book creation/editing wizard
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BookEntity, SectionEntity, PageEntity } from '@/features/books';
import { getWizardSectionPages } from '../utils/wizard-section-pages';

interface BookEditorState {
  // Current step in wizard
  currentStep: number;
  
  // Book basic info
  bookInfo: {
    title: string;
    shortDescription: string;
    categoryId: number | null;
    isAdult: boolean;
    cover: string | null;
  };
  
  // Sections
  sections: SectionEntity[];
  activeSectionId: number | null;
  
  // Pages (grouped by section)
  pages: Record<number, PageEntity[]>;
  activePageId: number | null;
  
  // Current book being edited
  currentBook: BookEntity | null;
  draftBookId: number | null;
  
  // Loading states
  isSaving: boolean;
  isPublishing: boolean;
  lastSavedAt: Date | null;
  /** Last time the draft was snapshotted locally (offline or before sync). */
  lastLocalSavedAt: Date | null;
  /** True when local changes are not yet confirmed on the server. */
  pendingServerSync: boolean;
  /** Son başarılı API senkine göre içerik imzası; aynıysa gereksiz POST atlanır. */
  lastSyncedDraftFingerprint: string | null;
}

interface BookEditorActions {
  // Step navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Book info
  updateBookInfo: (info: Partial<BookEditorState['bookInfo']>) => void;
  
  // Sections
  addSection: (section: SectionEntity) => void;
  updateSection: (id: number, section: SectionEntity) => void;
  deleteSection: (id: number) => void;
  setActiveSection: (id: number | null) => void;
  reorderSections: (sectionOrders: { id: number; order: number }[]) => void;
  
  // Pages
  addPage: (sectionId: number, page: PageEntity) => void;
  updatePage: (sectionId: number, pageId: number, page: PageEntity) => void;
  deletePage: (sectionId: number, pageId: number) => void;
  setActivePage: (id: number | null) => void;
  /** Adım 4’e geçerken veya yazım ekranı açılırken seçili sayfa yoksa ilk sayfayı seçer */
  ensureDefaultActivePage: () => void;

  // Book operations
  setCurrentBook: (book: BookEntity | null) => void;
  loadBook: (book: BookEntity) => void;
  setDraftBookId: (id: number | null) => void;
  saveDraft: (options?: { force?: boolean }) => Promise<void>;
  reset: () => void;
  
  // Validation
  validateStep: (step: number) => boolean;
  canProceedToNextStep: () => boolean;
}

/** Kitap taslağı API’si yalnızca doğrulanmış e-postalı yazar rolüne izin verir; kayıtta rol okuyucudur. */
/** API `string` bekler; `0`/`false`/`??` ile sayı-boolean sızıntısını önler. */
export function stringifyDraftPageContent(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
}

/** Taslak POST gövdesi — saveDraft ve imza aynı kaynaktan üretilir. */
function getDraftSyncPayload(state: BookEditorState) {
  const sectionsData = state.sections.map((section) => ({
    id: section.id > 0 ? section.id : undefined,
    title: section.title?.trim() || 'Bölüm',
    order: section.order,
    is_visible: section.isVisible,
    pages: getWizardSectionPages(section, state.pages).map((page) => ({
      id: page.id > 0 ? page.id : undefined,
      content: stringifyDraftPageContent(page.content),
      order: page.order,
    })),
  }));

  return {
    title: state.bookInfo.title || undefined,
    short_description: state.bookInfo.shortDescription || undefined,
    cover: state.bookInfo.cover || undefined,
    category_id: state.bookInfo.categoryId || undefined,
    is_adult: state.bookInfo.isAdult,
    sections: sectionsData.length > 0 ? sectionsData : undefined,
  };
}

function computeDraftFingerprint(state: BookEditorState): string {
  return JSON.stringify(getDraftSyncPayload(state));
}

async function ensureCanWriteBooks(): Promise<void> {
  const { useAuthStore } = await import('@/stores/auth.store');
  const { AuthApi } = await import('@/features/auth/infrastructure/api/auth.api');
  const user = useAuthStore.getState().user;
  if (!user || user.role === 'author') return;
  const authApi = new AuthApi();
  const result = await authApi.becomeAuthor();
  if (result.success && result.data?.role) {
    useAuthStore.getState().setUser({
      ...user,
      role: result.data.role,
    });
  }
}

/**
 * Taslak kaydından sonra sunucu gerçek bölüm/sayfa id'leri döner; Zustand merge ile
 * activeSectionId / activePageId eski (negatif) id'lerde kalır → tam ekran editör düşer.
 * Seçimi order (ve gerekirse sıra indeksi) ile yeni id'lere taşır.
 */
function buildPagesRecordFromBook(book: BookEntity): Record<number, PageEntity[]> {
  return book.sections.reduce((acc, section) => {
    const list = (section.pages ?? []).filter((p) => p != null);
    if (list.length > 0) {
      acc[section.id] = list;
    }
    return acc;
  }, {} as Record<number, PageEntity[]>);
}

function bookInfoFromEntity(book: BookEntity): BookEditorState['bookInfo'] {
  return {
    title: book.title,
    shortDescription: book.shortDescription || '',
    categoryId: book.categoryId,
    isAdult: book.isAdult,
    cover: book.cover,
  };
}

function remapActiveIdsAfterServerSync(
  prev: Pick<BookEditorState, 'activeSectionId' | 'activePageId' | 'sections' | 'pages'>,
  nextBook: BookEntity
): Pick<BookEditorState, 'activeSectionId' | 'activePageId'> {
  const sid = prev.activeSectionId;
  const pid = prev.activePageId;
  if (sid == null) {
    return { activeSectionId: null, activePageId: pid };
  }

  const oldSection = prev.sections.find((s) => s.id === sid);
  if (!oldSection) {
    return { activeSectionId: null, activePageId: null };
  }

  let newSection =
    nextBook.sections.find((s) => s.order === oldSection.order) ?? null;
  if (!newSection) {
    const sortedOld = [...prev.sections].sort((a, b) => a.order - b.order);
    const sortedNew = [...nextBook.sections].sort((a, b) => a.order - b.order);
    const idx = sortedOld.findIndex((s) => s.id === sid);
    newSection =
      idx >= 0 && idx < sortedNew.length ? sortedNew[idx]! : null;
  }
  if (!newSection) {
    return { activeSectionId: null, activePageId: null };
  }

  let newPageId: number | null = null;
  if (pid != null) {
    const oldPages = prev.pages[sid] || [];
    const oldPage = oldPages.find((p) => p.id === pid);
    if (oldPage) {
      let newPage =
        newSection.pages.find((p) => p.order === oldPage.order) ?? null;
      if (!newPage) {
        const sortedOldP = [...oldPages].sort((a, b) => a.order - b.order);
        const sortedNewP = [...newSection.pages].sort((a, b) => a.order - b.order);
        const pidx = sortedOldP.findIndex((p) => p.id === pid);
        newPage =
          pidx >= 0 && pidx < sortedNewP.length ? sortedNewP[pidx]! : null;
      }
      newPageId = newPage ? newPage.id : null;
    }
  }

  // Sunucu yanıtında sıra/id uyuşmazlığında null kalırsa yazım ekranı düşmesin
  if (newPageId == null && pid != null && newSection.pages.length > 0) {
    const sortedNewP = [...newSection.pages].sort((a, b) => a.order - b.order);
    newPageId = sortedNewP[0]!.id;
  }

  return { activeSectionId: newSection.id, activePageId: newPageId };
}

/**
 * Taslak POST yanıtı bazen az önce eklenen (negatif id) sayfaları içermez.
 * Bölüm sırasına göre eşleştirip istemcide kalan bekleyen sayfaları korur.
 */
function mergeClientPendingPagesIntoServerPages(
  before: BookEditorState,
  pagesFromServer: Record<number, PageEntity[]>,
  nextBook: BookEntity
): Record<number, PageEntity[]> {
  const merged: Record<number, PageEntity[]> = { ...pagesFromServer };
  const nextSorted = [...nextBook.sections].sort((a, b) => a.order - b.order);
  const prevSorted = [...before.sections].sort((a, b) => a.order - b.order);
  for (let i = 0; i < prevSorted.length && i < nextSorted.length; i++) {
    const prevSec = prevSorted[i];
    const nextSec = nextSorted[i];
    const prevPages = [...(before.pages[prevSec.id] || [])].sort((a, b) => a.order - b.order);
    const serverPages = pagesFromServer[nextSec.id] || [];
    const serverOrders = new Set(serverPages.map((p) => p.order));
    for (const p of prevPages) {
      if (p.id < 0 && !serverOrders.has(p.order)) {
        const list = merged[nextSec.id] ?? [];
        const nextPage = new PageEntity(
          p.id,
          nextSec.id,
          p.content,
          p.order,
          p.createdAt,
          p.updatedAt
        );
        merged[nextSec.id] = [...list, nextPage].sort((a, b) => a.order - b.order);
      }
    }
  }
  return merged;
}

/** Negatif id sayfa birleştirmeden sonra hâlâ varsa seçimi koru (remap yanlış ilk sayfaya düşmesin). */
function restoreActiveSelectionAfterMerge(
  before: BookEditorState,
  merged: Record<number, PageEntity[]>,
  nextBook: BookEntity,
  remapped: Pick<BookEditorState, 'activeSectionId' | 'activePageId'>
): Pick<BookEditorState, 'activeSectionId' | 'activePageId'> {
  const pid = before.activePageId;
  if (pid != null && pid < 0) {
    for (const sec of nextBook.sections) {
      const list = merged[sec.id] || [];
      if (list.some((p) => p.id === pid)) {
        return { activeSectionId: sec.id, activePageId: pid };
      }
    }
  }
  return remapped;
}

const initialState: BookEditorState = {
  currentStep: 1,
  bookInfo: {
    title: '',
    shortDescription: '',
    categoryId: null,
    isAdult: false,
    cover: null,
  },
  sections: [],
  activeSectionId: null,
  pages: {},
  activePageId: null,
  currentBook: null,
  draftBookId: null,
  isSaving: false,
  isPublishing: false,
  lastSavedAt: null,
  lastLocalSavedAt: null,
  pendingServerSync: false,
  lastSyncedDraftFingerprint: null,
};

export const useBookEditorStore = create<BookEditorState & BookEditorActions>()(
  persist(
    (set, get) => ({
  ...initialState,

  setCurrentStep: (step) => {
    const s = Math.min(5, Math.max(1, step));
    set({ currentStep: s });
  },

  nextStep: () => {
    const { currentStep, canProceedToNextStep, ensureDefaultActivePage } = get();
    if (!canProceedToNextStep()) return;
    const next = Math.min(currentStep + 1, 5);
    if (currentStep === 3 && next === 4) {
      ensureDefaultActivePage();
    }
    set({ currentStep: next });
  },

  previousStep: () => {
    const { currentStep } = get();
    set({ currentStep: Math.max(currentStep - 1, 1) });
  },

  updateBookInfo: (info) =>
    set((state) => ({
      bookInfo: { ...state.bookInfo, ...info },
    })),

  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, section],
      activeSectionId: section.id,
    })),

  updateSection: (id, section) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? section : s
      ),
    })),

  deleteSection: (id) =>
    set((state) => {
      const newSections = state.sections.filter((s) => s.id !== id);
      const newPages = { ...state.pages };
      delete newPages[id];
      return {
        sections: newSections,
        pages: newPages,
        activeSectionId: state.activeSectionId === id ? null : state.activeSectionId,
      };
    }),

  setActiveSection: (id) => set({ activeSectionId: id }),

  reorderSections: (sectionOrders) =>
    set((state) => {
      const orderMap = new Map(sectionOrders.map((so) => [so.id, so.order]));
      const sortedSections = [...state.sections].sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? a.order;
        const orderB = orderMap.get(b.id) ?? b.order;
        return orderA - orderB;
      });
      return {
        sections: sortedSections.map((s, index) => {
          const newOrder = orderMap.get(s.id) ?? index;
          return new SectionEntity(
            s.id,
            s.bookId,
            s.title,
            newOrder,
            s.totalPage,
            s.isVisible,
            s.createdAt,
            new Date(),
            s.pages
          );
        }),
      };
    }),

  addPage: (sectionId, page) =>
    set((state) => ({
      pages: {
        ...state.pages,
        [sectionId]: [...(state.pages[sectionId] || []), page],
      },
      activePageId: page.id,
    })),

  updatePage: (sectionId, pageId, page) =>
    set((state) => ({
      pages: {
        ...state.pages,
        [sectionId]: (state.pages[sectionId] || []).map((p) =>
          p.id === pageId ? page : p
        ),
      },
    })),

  deletePage: (sectionId, pageId) =>
    set((state) => {
      const nextForSection = (state.pages[sectionId] || []).filter((p) => p.id !== pageId);
      const pages = { ...state.pages };
      if (nextForSection.length === 0) {
        delete pages[sectionId];
      } else {
        pages[sectionId] = nextForSection;
      }
      const sections = state.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const filtered = s.pages.filter((p) => p.id !== pageId);
        return new SectionEntity(
          s.id,
          s.bookId,
          s.title,
          s.order,
          s.totalPage,
          s.isVisible,
          s.createdAt,
          s.updatedAt,
          filtered
        );
      });
      return {
        pages,
        sections,
        activePageId: state.activePageId === pageId ? null : state.activePageId,
      };
    }),

  setActivePage: (id) => set({ activePageId: id }),

  ensureDefaultActivePage: () => {
    const state = get();
    const pickFirst = (): { sid: number; pid: number } | null => {
      const sortedS = [...state.sections].sort((a, b) => a.order - b.order);
      for (const sec of sortedS) {
        const pgs = [...getWizardSectionPages(sec, state.pages)].sort((a, b) => a.order - b.order);
        if (pgs.length > 0) {
          return { sid: sec.id, pid: pgs[0]!.id };
        }
      }
      return null;
    };
    if (state.activeSectionId != null && state.activePageId != null) {
      const sec = state.sections.find((s) => s.id === state.activeSectionId);
      const list = sec ? getWizardSectionPages(sec, state.pages) : [];
      if (list.some((p) => p.id === state.activePageId)) return;
    }
    const first = pickFirst();
    if (first) {
      set({ activeSectionId: first.sid, activePageId: first.pid });
    }
  },

  setCurrentBook: (book) => set({ currentBook: book }),

  setDraftBookId: (id) => set({ draftBookId: id }),

  loadBook: (book) => {
    const pagesMap = buildPagesRecordFromBook(book);
    const bookInfo = bookInfoFromEntity(book);
    const nextFingerprint = computeDraftFingerprint({
      ...get(),
      currentBook: book,
      draftBookId: book.id,
      bookInfo,
      sections: book.sections,
      pages: pagesMap,
    } as BookEditorState);
    set({
      currentBook: book,
      draftBookId: book.id,
      bookInfo,
      sections: book.sections,
      pages: pagesMap,
      lastSyncedDraftFingerprint: nextFingerprint,
    });
  },

  saveDraft: async (options?: { force?: boolean }) => {
    let state = get();
    let fingerprint = computeDraftFingerprint(state);
    if (
      !options?.force &&
      state.lastSyncedDraftFingerprint != null &&
      fingerprint === state.lastSyncedDraftFingerprint
    ) {
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      set({
        lastLocalSavedAt: new Date(),
        pendingServerSync: true,
        isSaving: false,
      });
      return;
    }

    set({ isSaving: true });

    try {
      await ensureCanWriteBooks();

      // ensureCanWriteBooks / await sonrası güncel sayfa içeriği (flush sonrası saveDraft için şart)
      state = get();
      fingerprint = computeDraftFingerprint(state);
      if (
        !options?.force &&
        state.lastSyncedDraftFingerprint != null &&
        fingerprint === state.lastSyncedDraftFingerprint
      ) {
        set({ isSaving: false });
        return;
      }

      const api = (await import('@/shared/lib/api-client')).default;
      const payload = getDraftSyncPayload(state);

      const url = state.draftBookId 
        ? `/books/draft/${state.draftBookId}`
        : '/books/draft';

      const response = await api.post(url, payload);
      
      if (response.data.success && response.data.data) {
        const bookData = response.data.data;
        let nextBook: BookEntity | null = null;
        try {
          nextBook = BookEntity.fromPrimitives(bookData);
        } catch {
          nextBook = null;
        }
        const syncMeta = {
          lastSavedAt: new Date(),
          lastLocalSavedAt: new Date(),
          pendingServerSync: false,
          isSaving: false,
        };
        if (nextBook && nextBook.sections.length > 0) {
          const beforeSync = get();
          const remapped = remapActiveIdsAfterServerSync(beforeSync, nextBook);
          const pagesFromServer = buildPagesRecordFromBook(nextBook);
          const pagesMap = mergeClientPendingPagesIntoServerPages(
            beforeSync,
            pagesFromServer,
            nextBook
          );
          const { activeSectionId, activePageId } = restoreActiveSelectionAfterMerge(
            beforeSync,
            pagesMap,
            nextBook,
            remapped
          );
          const bookInfo = bookInfoFromEntity(nextBook);
          const lastSyncedDraftFingerprint = computeDraftFingerprint({
            ...beforeSync,
            currentBook: nextBook,
            draftBookId: nextBook.id,
            bookInfo,
            sections: nextBook.sections,
            pages: pagesMap,
            activeSectionId,
            activePageId,
          } as BookEditorState);
          set({
            currentBook: nextBook,
            draftBookId: nextBook.id,
            bookInfo,
            sections: nextBook.sections,
            pages: pagesMap,
            activeSectionId,
            activePageId,
            ...syncMeta,
            lastSyncedDraftFingerprint,
          });
        } else {
          set({
            draftBookId: bookData.id,
            currentBook: nextBook,
            ...syncMeta,
            lastSyncedDraftFingerprint: computeDraftFingerprint(get()),
          });
        }
      } else {
        set({ isSaving: false });
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      set({
        isSaving: false,
        lastLocalSavedAt: new Date(),
        pendingServerSync: true,
      });
    }
  },

  reset: () => set(initialState),

  validateStep: (step) => {
    const state = get();
    switch (step) {
      case 1:
        return (
          state.bookInfo.title.trim().length > 0 &&
          state.bookInfo.categoryId != null &&
          state.bookInfo.categoryId > 0
        );
      case 2:
        return state.sections.length > 0;
      case 3:
        return state.sections.every(
          (section) =>
            getWizardSectionPages(section, state.pages).length > 0
        );
      case 4:
        return state.sections.every(
          (section) =>
            getWizardSectionPages(section, state.pages).length > 0
        );
      case 5:
        return true;
      default:
        return false;
    }
  },

  canProceedToNextStep: () => {
    const { currentStep, validateStep } = get();
    return validateStep(currentStep);
  },
    }),
    {
      name: 'book-editor-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          // Return a no-op storage for SSR
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        currentStep: state.currentStep,
        draftBookId: state.draftBookId,
        bookInfo: state.bookInfo,
        sections: state.sections.map((s) => ({
          id: s.id,
          bookId: s.bookId,
          title: s.title,
          order: s.order,
          totalPage: s.totalPage,
          isVisible: s.isVisible,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
          pages: s.pages.map((p) => ({
            id: p.id,
            sectionId: p.sectionId,
            content: p.content,
            order: p.order,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          })),
        })),
        pages: Object.fromEntries(
          Object.entries(state.pages).map(([key, pages]) => [
            key,
            pages.map((p) => ({
              id: p.id,
              sectionId: p.sectionId,
              content: p.content,
              order: p.order,
              createdAt: p.createdAt.toISOString(),
              updatedAt: p.updatedAt.toISOString(),
            })),
          ])
        ),
        activeSectionId: state.activeSectionId,
        activePageId: state.activePageId,
        lastSavedAt: state.lastSavedAt ? state.lastSavedAt.toISOString() : null,
        lastLocalSavedAt: state.lastLocalSavedAt
          ? state.lastLocalSavedAt.toISOString()
          : null,
        pendingServerSync: state.pendingServerSync,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reconstruct entities from plain objects
          interface SerializedSection {
            id: number;
            bookId: number;
            title: string;
            order: number;
            totalPage: number;
            isVisible: boolean;
            createdAt: string;
            updatedAt: string;
            pages: SerializedPage[];
          }
          interface SerializedPage {
            id: number;
            sectionId: number;
            content: string;
            order: number;
            createdAt: string;
            updatedAt: string;
          }
          
          state.sections = (state.sections as unknown as SerializedSection[])
            .filter((s): s is SerializedSection => s != null && typeof s === 'object')
            .map((s) =>
            new SectionEntity(
              s.id,
              s.bookId,
              s.title,
              s.order,
              s.totalPage,
              typeof s.isVisible === 'boolean' ? s.isVisible : true,
              new Date(s.createdAt),
              new Date(s.updatedAt),
              (s.pages || [])
                .filter((p): p is SerializedPage => p != null && typeof p === 'object')
                .map((p) =>
                new PageEntity(
                  p.id,
                  p.sectionId,
                  p.content ?? '',
                  p.order,
                  new Date(p.createdAt),
                  new Date(p.updatedAt)
                )
              )
            )
          );
          state.pages = Object.fromEntries(
            Object.entries(state.pages as unknown as Record<string, SerializedPage[]>).map(([key, pages]) => {
              const numericKey = Number(key);
              const safeKey = Number.isFinite(numericKey) ? numericKey : key;
              return [
                safeKey,
                (pages || [])
                  .filter((p): p is SerializedPage => p != null && typeof p === 'object')
                  .map((p) =>
                    new PageEntity(
                      p.id,
                      p.sectionId,
                      p.content ?? '',
                      p.order,
                      new Date(p.createdAt),
                      new Date(p.updatedAt)
                    )
                  ),
              ];
            })
          ) as Record<number, PageEntity[]>;
          
          if (state.lastSavedAt) {
            state.lastSavedAt = new Date(state.lastSavedAt);
          }
          if (state.lastLocalSavedAt) {
            state.lastLocalSavedAt = new Date(state.lastLocalSavedAt as unknown as string);
          }
          if (typeof state.pendingServerSync !== 'boolean') {
            state.pendingServerSync = Boolean(state.pendingServerSync);
          }

          if (typeof state.draftBookId === 'string') {
            state.draftBookId = Number(state.draftBookId);
          }
          if (state.currentStep != null && typeof state.currentStep !== 'number') {
            state.currentStep = Number(state.currentStep);
          }
          if (state.currentStep != null) {
            const s = state.currentStep as number;
            state.currentStep = Math.min(5, Math.max(1, Number.isFinite(s) ? s : 1));
          }
        }
      },
    }
  )
);

