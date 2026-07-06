import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();

vi.mock('@/shared/lib/api-client', () => ({
  default: {
    post: (...args: unknown[]) => postMock(...args),
  },
}));

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: {
    getState: () => ({
      user: { role: 'author' },
      setUser: vi.fn(),
    }),
  },
}));

import { BookEntity, PageEntity, SectionEntity } from '@/features/books';
import { useBookEditorStore, resetBookEditorSaveDraftChainForTests } from './book-editor.store';

function minimalDraftResponse(id: number, sections: unknown[] = []) {
  return {
    data: {
      success: true,
      data: {
        id,
        author_id: 1,
        category_id: 1,
        title: 'Kitap',
        short_description: null,
        cover: null,
        read_count: 0,
        total_page: 1,
        is_adult: false,
        is_draft: true,
        is_published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sections,
      },
    },
  };
}

describe('useBookEditorStore', () => {
  beforeEach(async () => {
    localStorage.clear();
    useBookEditorStore.persist.clearStorage();
    resetBookEditorSaveDraftChainForTests();
    useBookEditorStore.getState().reset();
    postMock.mockReset();
    postMock.mockImplementation(() => Promise.resolve(minimalDraftResponse(42)));
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    await new Promise((r) => setTimeout(r, 0));
    postMock.mockReset();
  });

  it('validateStep 1 requires non-empty title', () => {
    const s = useBookEditorStore.getState();
    expect(s.validateStep(1)).toBe(false);
    s.updateBookInfo({ title: '  ' });
    expect(s.validateStep(1)).toBe(false);
    s.updateBookInfo({ title: 'Kitap', categoryId: 1 });
    expect(s.validateStep(1)).toBe(true);
  });

  it('validateStep 2 requires at least one section', () => {
    const s = useBookEditorStore.getState();
    s.updateBookInfo({ title: 'Kitap' });
    s.setCurrentStep(2);
    expect(s.validateStep(2)).toBe(false);
    const now = new Date();
    s.addSection(
      new SectionEntity(-1, 0, 'B1', 0, 0, true, now, now, [])
    );
    expect(s.validateStep(2)).toBe(true);
  });

  it('validateStep 3 requires at least one page per section (map keyed by section id)', () => {
    const s = useBookEditorStore.getState();
    const now = new Date();
    s.updateBookInfo({ title: 'Kitap' });
    s.addSection(new SectionEntity(-10, 0, 'B1', 0, 0, true, now, now, []));
    s.setCurrentStep(3);
    expect(s.validateStep(3)).toBe(false);
    s.addPage(
      -10,
      new PageEntity(-20, -10, '<p>a</p>', 0, now, now)
    );
    expect(s.validateStep(3)).toBe(true);
  });

  it('validateStep 3 passes when pages only match via sectionId (stale map key)', () => {
    const s = useBookEditorStore.getState();
    const now = new Date();
    const sectionId = -10;
    s.updateBookInfo({ title: 'Kitap', categoryId: 1 });
    s.addSection(
      new SectionEntity(sectionId, 0, 'B1', 0, 0, true, now, now, [])
    );
    s.setCurrentStep(3);
    const orphanKey = -999;
    s.addPage(
      orphanKey,
      new PageEntity(-20, sectionId, '<p>via-section-id</p>', 0, now, now)
    );
    expect(s.validateStep(3)).toBe(true);
  });

  it('validateStep 4 and 5 require written content on every page', () => {
    const s = useBookEditorStore.getState();
    const now = new Date();
    s.updateBookInfo({ title: 'Kitap', categoryId: 1 });
    s.addSection(new SectionEntity(-1, 0, 'B1', 0, 0, true, now, now, []));
    s.addPage(-1, new PageEntity(-2, -1, '', 0, now, now));
    expect(s.validateStep(4)).toBe(false);
    expect(s.validateStep(5)).toBe(false);
    s.updatePage(-1, -2, new PageEntity(-2, -1, '<p>x</p>', 0, now, now));
    expect(s.validateStep(4)).toBe(true);
    expect(s.validateStep(5)).toBe(true);
  });

  it('canProceedToNextStep reflects validateStep for current step', () => {
    useBookEditorStore.getState().reset();
    const s = useBookEditorStore.getState();
    expect(s.currentStep).toBe(1);
    expect(s.canProceedToNextStep()).toBe(false);
    s.updateBookInfo({ title: 'X', categoryId: 1 });
    expect(s.canProceedToNextStep()).toBe(true);
  });

  it('advances full wizard steps 1→5 when each step is valid', () => {
    const now = new Date();
    let st = useBookEditorStore.getState();
    expect(st.currentStep).toBe(1);
    st.updateBookInfo({ title: 'Tam Akış', categoryId: 1 });
    st.nextStep();
    st = useBookEditorStore.getState();
    expect(st.currentStep).toBe(2);
    st.addSection(new SectionEntity(-100, 0, 'Bölüm', 0, 0, true, now, now, []));
    st.nextStep();
    st = useBookEditorStore.getState();
    expect(st.currentStep).toBe(3);
    st.addPage(-100, new PageEntity(-200, -100, '<p>metin</p>', 0, now, now));
    st.nextStep();
    st = useBookEditorStore.getState();
    expect(st.currentStep).toBe(4);
    expect(st.activePageId).toBe(-200);
    st.nextStep();
    expect(useBookEditorStore.getState().currentStep).toBe(5);
  });

  it('saveDraft marks local sync when offline', async () => {
    resetBookEditorSaveDraftChainForTests();
    const onLineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    postMock.mockClear();
    useBookEditorStore.getState().updateBookInfo({ title: 'Kitap' });
    await useBookEditorStore.getState().saveDraft();
    expect(useBookEditorStore.getState().pendingServerSync).toBe(true);
    expect(useBookEditorStore.getState().lastLocalSavedAt).toBeInstanceOf(Date);
    expect(postMock).not.toHaveBeenCalled();
    onLineSpy.mockRestore();
  });

  it('saveDraft POST includes sections with nested pages matching wizard content', async () => {
    const s = useBookEditorStore.getState();
    const now = new Date();
    s.updateBookInfo({ title: 'Taslak Kitap', categoryId: 2 });
    useBookEditorStore.setState({
      sections: [new SectionEntity(-5, 0, 'B1', 0, 0, true, now, now, [])],
      pages: {
        [-5]: [new PageEntity(-6, -5, '<p>hello</p>', 0, now, now)],
      },
    });
    await s.saveDraft({ force: true });
    expect(postMock).toHaveBeenCalled();
    const payload = postMock.mock.calls[0]?.[1] as {
      sections?: { title: string; pages: { content: string }[] }[];
    };
    expect(payload?.sections?.length).toBe(1);
    expect(payload?.sections?.[0]?.pages?.length).toBe(1);
    expect(payload?.sections?.[0]?.pages?.[0]?.content).toContain('hello');
  });

  it('saveDraft skips POST when unchanged; force:true sends again', async () => {
    const s = useBookEditorStore.getState();
    const now = new Date();
    s.updateBookInfo({ title: 'İmza', categoryId: 1 });
    s.setDraftBookId(42);
    useBookEditorStore.setState({
      sections: [new SectionEntity(-1, 0, 'S', 0, 0, true, now, now, [])],
      pages: {
        [-1]: [new PageEntity(-2, -1, '<p>a</p>', 0, now, now)],
      },
      lastSyncedDraftFingerprint: null,
    });
    postMock.mockImplementationOnce(() =>
      Promise.resolve(
        minimalDraftResponse(42, [
          {
            id: 7,
            book_id: 42,
            title: 'S',
            order: 0,
            total_page: 1,
            is_visible: true,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            pages: [
              {
                id: 8,
                section_id: 7,
                content: '<p>a</p>',
                order: 0,
                created_at: now.toISOString(),
                updated_at: now.toISOString(),
              },
            ],
          },
        ])
      )
    );
    await s.saveDraft({ force: true });
    expect(postMock).toHaveBeenCalledTimes(1);
    const synced = useBookEditorStore.getState();
    expect(synced.lastSyncedDraftFingerprint).toBeTruthy();
    expect(synced.sections).toHaveLength(1);
    postMock.mockClear();
    await s.saveDraft();
    expect(postMock).not.toHaveBeenCalled();
    await s.saveDraft({ force: true });
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  it('saveDraft does not restore zombie sections omitted from client payload', async () => {
    const now = new Date();
    const s = useBookEditorStore.getState();
    s.updateBookInfo({ title: 'Zombie test', categoryId: 1 });
    s.setDraftBookId(99);
    s.addSection(new SectionEntity(6, 99, 'Kalacak', 0, 0, true, now, now, []));

    postMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: 99,
          author_id: 1,
          category_id: 1,
          title: 'Zombie test',
          short_description: null,
          cover: null,
          read_count: 0,
          total_page: 0,
          is_adult: false,
          is_draft: true,
          is_published: false,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          sections: [
            {
              id: 5,
              book_id: 99,
              title: 'Silinecek',
              order: 0,
              total_page: 0,
              is_visible: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              pages: [],
            },
            {
              id: 6,
              book_id: 99,
              title: 'Kalacak',
              order: 1,
              total_page: 0,
              is_visible: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              pages: [],
            },
          ],
        },
      },
    });

    await s.saveDraft({ force: true });

    const after = useBookEditorStore.getState();
    expect(after.sections).toHaveLength(1);
    expect(after.sections[0]!.id).toBe(6);
    expect(after.sections[0]!.title).toBe('Kalacak');
  });

  it('deleteSection triggers save and keeps single section after server sync', async () => {
    const now = new Date();
    const s = useBookEditorStore.getState();
    s.updateBookInfo({ title: 'Silme', categoryId: 1 });
    s.setDraftBookId(100);
    s.addSection(new SectionEntity(10, 100, 'Silinecek', 0, 0, true, now, now, []));
    s.addSection(new SectionEntity(11, 100, 'Kalacak', 1, 0, true, now, now, []));

    postMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 100,
          author_id: 1,
          category_id: 1,
          title: 'Silme',
          short_description: null,
          cover: null,
          read_count: 0,
          total_page: 0,
          is_adult: false,
          is_draft: true,
          is_published: false,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          sections: [
            {
              id: 10,
              book_id: 100,
              title: 'Silinecek',
              order: 0,
              total_page: 0,
              is_visible: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              pages: [],
            },
            {
              id: 11,
              book_id: 100,
              title: 'Kalacak',
              order: 1,
              total_page: 0,
              is_visible: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              pages: [],
            },
          ],
        },
      },
    });

    s.deleteSection(10);
    await new Promise((r) => setTimeout(r, 0));

    const after = useBookEditorStore.getState();
    expect(after.sections).toHaveLength(1);
    expect(after.sections[0]!.title).toBe('Kalacak');
    expect(after.sections.some((sec) => sec.title === 'Silinecek')).toBe(false);
  });

  it('saveDraft skips empty sections payload for published books', async () => {
    const now = new Date();
    const s = useBookEditorStore.getState();
    s.setDraftBookId(200);
    s.setCurrentBook(
      BookEntity.fromPrimitives({
        id: 200,
        author_id: 1,
        category_id: 1,
        title: 'Yayında',
        short_description: null,
        cover: null,
        read_count: 0,
        total_page: 1,
        is_adult: false,
        is_draft: false,
        is_published: true,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        sections: [
          {
            id: 1,
            book_id: 200,
            title: 'Bölüm',
            order: 0,
            total_page: 1,
            is_visible: true,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            pages: [],
          },
        ],
      })
    );
    s.updateBookInfo({ title: 'Yayında', categoryId: 1 });
    useBookEditorStore.setState({ sections: [], pages: {} });

    postMock.mockClear();
    await s.saveDraft({ force: true });

    expect(postMock).not.toHaveBeenCalled();
    expect(useBookEditorStore.getState().pendingServerSync).toBe(true);
  });
});
