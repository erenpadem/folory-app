/**
 * Fullscreen sayfa editörü için yerel yedek anahtarları.
 * Sadece `page.id` kullanmak farklı kullanıcılar / kitaplar arasında çakışır (sunucu id'leri küçük tamsayı).
 */

const KEY_PREFIX = 'folory:book-page:v1:';

export function getBookPageLocalStorageKey(
  userId: string | number | null | undefined,
  draftBookId: number | null,
  pageId: number
): string {
  const uid = userId != null && userId !== '' ? String(userId) : 'anon';
  const book = draftBookId != null ? String(draftBookId) : 'unsaved';
  return `${KEY_PREFIX}${uid}:${book}:${pageId}`;
}

/** Taslak id geldikten sonra önceki `unsaved` anahtarındaki yedeği bulur. */
export function readBookPageLocalStorageBackup(
  userId: string | number | null | undefined,
  draftBookId: number | null,
  pageId: number
): string | null {
  if (typeof window === 'undefined') return null;
  const primary = getBookPageLocalStorageKey(userId, draftBookId, pageId);
  const fromPrimary = localStorage.getItem(primary);
  if (fromPrimary) return fromPrimary;
  if (draftBookId != null) {
    const unsaved = getBookPageLocalStorageKey(userId, null, pageId);
    return localStorage.getItem(unsaved);
  }
  return null;
}

/** Eski `book-page-<id>` anahtarlarını kaldır (çoklu kullanıcı/kitap sızıntısı). */
export function removeLegacyBookPageLocalStorageKeys(): void {
  if (typeof window === 'undefined') return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('book-page-')) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore quota / private mode
  }
}

export function removeBookPageLocalStorageKeysForUser(
  userId: string | number | null | undefined
): void {
  if (typeof window === 'undefined') return;
  if (userId == null || userId === '') return;
  const prefix = `${KEY_PREFIX}${String(userId)}:`;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
