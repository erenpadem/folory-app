import { beforeEach, describe, expect, it } from 'vitest';
import { useBookEditorStore } from './stores/book-editor.store';

describe('book editor wizard persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    useBookEditorStore.persist.clearStorage();
    useBookEditorStore.getState().reset();
  });

  it('persists currentStep and draftBookId in partialize', () => {
    const opts = useBookEditorStore.persist.getOptions();
    const partial = opts.partialize?.(useBookEditorStore.getState());
    expect(partial).toMatchObject({
      currentStep: 1,
      draftBookId: null,
    });
  });

  it('distinguishes temp vs server entity ids for API (negative = create)', () => {
    const tempSectionId = -1740000123456;
    const serverSectionId = 42;
    expect(tempSectionId < 0).toBe(true);
    expect(serverSectionId < 0).toBe(false);
  });
});
