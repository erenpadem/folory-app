import { useBookEditorStore } from '../stores/book-editor.store';

/** Clears persisted wizard state when the deleted book matches the active editor session. */
export function clearBookEditorIfDeleted(deletedBookId: number): void {
  const st = useBookEditorStore.getState();
  if (st.draftBookId !== deletedBookId) return;
  useBookEditorStore.persist.clearStorage();
  st.reset();
}

/** Reset editor before loading a different book (prevents cross-book autosave POST). */
export function resetBookEditorForBookSwitch(): void {
  useBookEditorStore.getState().reset();
}
