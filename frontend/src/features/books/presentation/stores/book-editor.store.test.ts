import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();

vi.mock('@/shared/lib/api-client', () => ({
  default: {
    post: (...args: unknown[]) => postMock(...args),
  },
}));

import { PageEntity, SectionEntity } from '@/features/books';
import { useBookEditorStore } from './book-editor.store';

function minimalDraftResponse(id: number) {
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
        sections: [],
      },
    },
  };
}

describe('useBookEditorStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useBookEditorStore.persist.clearStorage();
    useBookEditorStore.getState().reset();
    postMock.mockReset();
    postMock.mockResolvedValue(minimalDraftResponse(42));
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
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

  it('validateStep 4 mirrors step 3; validateStep 5 is always true', () => {
    const s = useBookEditorStore.getState();
    const now = new Date();
    s.updateBookInfo({ title: 'Kitap', categoryId: 1 });
    s.addSection(new SectionEntity(-1, 0, 'B1', 0, 0, true, now, now, []));
    s.addPage(-1, new PageEntity(-2, -1, '<p>x</p>', 0, now, now));
    expect(s.validateStep(4)).toBe(true);
    s.setCurrentStep(5);
    expect(s.validateStep(5)).toBe(true);
  });

  it('canProceedToNextStep reflects validateStep for current step', () => {
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
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    useBookEditorStore.getState().updateBookInfo({ title: 'Kitap' });
    await useBookEditorStore.getState().saveDraft();
    expect(useBookEditorStore.getState().pendingServerSync).toBe(true);
    expect(useBookEditorStore.getState().lastLocalSavedAt).toBeInstanceOf(Date);
    expect(postMock).not.toHaveBeenCalled();
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  it('saveDraft POST includes sections with nested pages matching wizard content', async () => {
    const s = useBookEditorStore.getState();
    const now = new Date();
    s.updateBookInfo({ title: 'Taslak Kitap', categoryId: 2 });
    s.addSection(new SectionEntity(-5, 0, 'B1', 0, 0, true, now, now, []));
    s.addPage(
      -5,
      new PageEntity(-6, -5, '<p>hello</p>', 0, now, now)
    );
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
    s.addSection(new SectionEntity(-1, 0, 'S', 0, 0, true, now, now, []));
    s.addPage(-1, new PageEntity(-2, -1, '<p>a</p>', 0, now, now));
    await s.saveDraft({ force: true });
    expect(postMock).toHaveBeenCalledTimes(1);
    postMock.mockClear();
    await s.saveDraft();
    expect(postMock).not.toHaveBeenCalled();
    await s.saveDraft({ force: true });
    expect(postMock).toHaveBeenCalledTimes(1);
  });
});
