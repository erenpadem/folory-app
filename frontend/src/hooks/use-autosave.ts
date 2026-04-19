import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useBookEditorStore } from '@/features/books/presentation/stores/book-editor.store';

/** Sunucu taslağı: çok sık POST yok, yazarken makul gecikmeyle senkron. */
const DEBOUNCE_MS = 2500;
const STEP_SAVE_DELAY_MS = 450;

/**
 * Keeps the book draft in sync: debounced server saves as content/steps change,
 * save on wizard step changes, and retry when the browser comes back online.
 * Zustand persist already mirrors state to localStorage for offline viewing.
 */
export function useAutoSave(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const bookInfo = useBookEditorStore((s) => s.bookInfo);
  const sections = useBookEditorStore((s) => s.sections);
  const pages = useBookEditorStore((s) => s.pages);
  const currentStep = useBookEditorStore((s) => s.currentStep);
  const prevStepRef = useRef<number | null>(null);

  const runSave = useDebouncedCallback(() => {
    const { bookInfo: bi, saveDraft, draftBookId } = useBookEditorStore.getState();
    if (!bi.title.trim()) return;
    // Yeni kitap: adım 1 kuralı (kategori). Mevcut kitap düzenlemede draftBookId ile her zaman senkron.
    const needsCategoryForNewDraft = draftBookId == null;
    if (needsCategoryForNewDraft && (bi.categoryId == null || bi.categoryId < 1)) return;
    void saveDraft();
  }, DEBOUNCE_MS);

  // Debounced save: içerik / bölüm / sayfa değişince (adım değişimi ayrı effect’te)
  useEffect(() => {
    if (!enabled) return;
    runSave();
  }, [bookInfo, sections, pages, runSave, enabled]);

  // Extra save shortly after wizard step changes (milestones)
  useEffect(() => {
    if (!enabled) return;
    if (prevStepRef.current === null) {
      prevStepRef.current = currentStep;
      return;
    }
    if (prevStepRef.current === currentStep) return;
    prevStepRef.current = currentStep;

    const t = window.setTimeout(() => {
      const { bookInfo: bi, saveDraft, draftBookId } = useBookEditorStore.getState();
      if (!bi.title.trim()) return;
      const needsCategoryForNewDraft = draftBookId == null;
      if (needsCategoryForNewDraft && (bi.categoryId == null || bi.categoryId < 1)) return;
      void saveDraft();
    }, STEP_SAVE_DELAY_MS);

    return () => window.clearTimeout(t);
  }, [currentStep, enabled]);

  // When back online, push pending work to the server
  useEffect(() => {
    if (!enabled) return;
    const onOnline = () => {
      const st = useBookEditorStore.getState();
      const bi = st.bookInfo;
      if (!bi.title.trim()) return;
      const needsCategoryForNewDraft = st.draftBookId == null;
      if (needsCategoryForNewDraft && (bi.categoryId == null || bi.categoryId < 1)) return;
      void st.saveDraft({ force: st.pendingServerSync });
    };
    if (typeof window === 'undefined') return;
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [enabled]);
}
