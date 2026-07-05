import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

export const API_BASE = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:8081';

/**
 * Seeded credentials (see backend/database/seeders/UserSeeder.php).
 * Author "erenpadem" owns several published books.
 */
export const SEEDED_AUTHOR = {
  email: process.env.PLAYWRIGHT_AUTHOR_EMAIL ?? 'erenpadem@fo-lory.com',
  password: process.env.PLAYWRIGHT_AUTHOR_PASSWORD ?? 'erensunucu',
};

export const SEEDED_READER = {
  email: process.env.PLAYWRIGHT_READER_EMAIL ?? 'ayse@example.com',
  password: process.env.PLAYWRIGHT_READER_PASSWORD ?? 'password',
};

export interface SeedBook {
  id: number;
  slug: string;
  title: string;
  is_published?: boolean;
}

/** Returns true if the Laravel backend is up and serving JSON. */
export async function backendReachable(request: APIRequestContext): Promise<boolean> {
  try {
    const res = await request.get(`${API_BASE}/api/books`, { timeout: 5000 });
    return res.ok();
  } catch {
    return false;
  }
}

/**
 * Returns true when the seeded reader account can log in.
 */
export async function seededReaderReady(request: APIRequestContext): Promise<boolean> {
  try {
    const res = await request.post(`${API_BASE}/api/login`, {
      data: SEEDED_READER,
      headers: { Accept: 'application/json' },
      timeout: 5000,
    });
    return res.ok();
  } catch {
    return false;
  }
}

/**
 * Returns true when the seeded author account can log in.
 */
export async function seededAuthorReady(request: APIRequestContext): Promise<boolean> {
  try {
    const res = await request.post(`${API_BASE}/api/login`, {
      data: SEEDED_AUTHOR,
      headers: { Accept: 'application/json' },
      timeout: 5000,
    });
    return res.ok();
  } catch {
    return false;
  }
}

/** Skip hook for specs that need seeded reader (and reachable API). */
export async function requireSeededBackend(
  request: APIRequestContext
): Promise<void> {
  test.skip(!(await backendReachable(request)), `Backend unreachable at ${API_BASE}`);
  test.skip(
    !(await seededReaderReady(request)),
    `Seeded reader missing — run: cd backend && php artisan db:seed`
  );
}

/** Skip hook for author-only flows (wizard, dashboard, author profile edits). */
export async function requireSeededAuthor(
  request: APIRequestContext
): Promise<void> {
  await requireSeededBackend(request);
  test.skip(
    !(await seededAuthorReady(request)),
    `Seeded author missing — run: cd backend && php artisan db:seed (or set PLAYWRIGHT_AUTHOR_EMAIL)`
  );
}

/** Logs in via the API and returns the bearer token. */
export async function apiLogin(
  request: APIRequestContext,
  creds: { email: string; password: string } = SEEDED_AUTHOR
): Promise<string> {
  const res = await request.post(`${API_BASE}/api/login`, {
    data: creds,
    headers: { Accept: 'application/json' },
  });
  expect(res.ok(), `Login failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  const token = body?.data?.token;
  expect(token, 'Login response missing data.token').toBeTruthy();
  return token as string;
}

/** Registers a brand new user via the API and returns the credentials + token. */
export async function apiRegister(request: APIRequestContext): Promise<{
  email: string;
  password: string;
  token?: string;
}> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `e2e.${suffix}@folory.test`;
  const password = 'e2e-secret-12';
  const res = await request.post(`${API_BASE}/api/register`, {
    data: { name: 'E2E User', email, password, password_confirmation: password },
    headers: { Accept: 'application/json' },
  });
  expect(res.ok(), `Register failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json().catch(() => ({}));
  return { email, password, token: body?.data?.token };
}

/**
 * Seeds the auth token into localStorage *before* any page script runs.
 * The app's AuthProvider picks it up on mount and calls fetchUser(),
 * which hydrates the Zustand store (isAuthenticated + user).
 */
export async function authenticate(page: Page, token: string): Promise<void> {
  await page.addInitScript((t) => {
    try {
      window.localStorage.setItem('auth_token', t);
    } catch {
      /* storage may be unavailable in some contexts */
    }
  }, token);
}

/** Convenience: log in via API as a given user and seed the token into the page. */
export async function loginAs(
  page: Page,
  request: APIRequestContext,
  creds: { email: string; password: string } = SEEDED_AUTHOR
): Promise<string> {
  const token = await apiLogin(request, creds);
  await authenticate(page, token);
  return token;
}

/** Fetches the first published book that has at least one readable page. */
export async function getReadableBook(request: APIRequestContext): Promise<{
  slug: string;
  title: string;
  sectionId: number;
  pageId: number;
} | null> {
  const listRes = await request.get(`${API_BASE}/api/books?per_page=20`);
  if (!listRes.ok()) return null;
  const list = await listRes.json();
  const books: SeedBook[] = list?.data ?? [];

  for (const book of books) {
    const slug = book.slug || String(book.id);
    const detailRes = await request.get(`${API_BASE}/api/books/${slug}?include=sections`);
    if (!detailRes.ok()) continue;
    const detail = await detailRes.json();
    const sections = detail?.data?.sections ?? [];
    for (const section of sections) {
      const pages = section?.pages ?? [];
      if (pages.length > 0) {
        return {
          slug,
          title: detail.data.title,
          sectionId: section.id,
          pageId: pages[0].id,
        };
      }
    }
  }
  return null;
}

/**
 * Asserts the Next.js dev error overlay / React error boundary is NOT shown.
 * Catches runtime crashes that still render a 200 page shell.
 */
export async function expectNoAppCrash(page: Page): Promise<void> {
  const overlay = page.locator('nextjs-portal, [data-nextjs-dialog], #__next-build-watcher');
  // The error overlay renders a dialog with this heading in dev.
  const runtimeError = page.getByText(/Unhandled Runtime Error|Build Error|Server Error/i);
  await expect(runtimeError).toHaveCount(0);
  // Overlay element may exist but be empty; only fail if it actually shows an error.
  if ((await overlay.count()) > 0) {
    const text = (await overlay.first().innerText().catch(() => '')) || '';
    expect(text).not.toMatch(/Runtime Error|Build Error/i);
  }
}

/** Collects uncaught page errors so a test can assert the flow didn't throw. */
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

/** Clears persisted wizard state before opening /dashboard/books/new */
export async function clearBookEditorStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('book-editor-storage');
    } catch {
      /* ignore */
    }
  });
}

export function uniqueE2eTitle(prefix = 'E2E'): string {
  return `${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' };
}

/** Creates a minimal draft book via API (author token required). */
export async function apiCreateDraftBook(
  request: APIRequestContext,
  token: string,
  opts: {
    title: string;
    sectionTitle?: string;
    pageContent?: string;
    categoryId?: number;
  }
): Promise<{ id: number; slug: string; title: string; sectionId: number; pageId: number }> {
  let categoryId = opts.categoryId;
  if (!categoryId) {
    const catRes = await request.get(`${API_BASE}/api/categories`, {
      headers: authHeaders(token),
    });
    expect(catRes.ok()).toBeTruthy();
    const cats = (await catRes.json()).data ?? [];
    categoryId = cats[0]?.id;
    expect(categoryId, 'Need at least one category seeded').toBeTruthy();
  }

  const res = await request.post(`${API_BASE}/api/books/draft`, {
    headers: authHeaders(token),
    data: {
      title: opts.title,
      category_id: categoryId,
      short_description: 'E2E draft',
      sections: [
        {
          title: opts.sectionTitle ?? 'Bölüm 1',
          order: 0,
          is_visible: true,
          pages: [{ content: opts.pageContent ?? '<p>E2E içerik</p>', order: 0 }],
        },
      ],
    },
  });
  expect(res.ok(), `Draft create failed: ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  const book = body.data;
  const section = book.sections?.[0];
  const page = section?.pages?.[0];
  expect(book?.id).toBeTruthy();
  expect(section?.id).toBeTruthy();
  expect(page?.id).toBeTruthy();
  return {
    id: book.id,
    slug: book.slug || String(book.id),
    title: book.title,
    sectionId: section.id,
    pageId: page.id,
  };
}

export async function apiDeleteBook(
  request: APIRequestContext,
  token: string,
  bookId: number
): Promise<void> {
  const res = await request.delete(`${API_BASE}/api/books/${bookId}`, {
    headers: authHeaders(token),
  });
  expect(res.ok(), `Delete book ${bookId} failed: ${res.status()}`).toBeTruthy();
}

export async function apiBecomeAuthor(
  request: APIRequestContext,
  token: string
): Promise<void> {
  const res = await request.post(`${API_BASE}/api/user/become-author`, {
    headers: authHeaders(token),
  });
  expect(res.ok(), `become-author failed: ${await res.text()}`).toBeTruthy();
}

/** Wait for a draft autosave network call after wizard edits. */
export async function waitForDraftSave(
  page: Page,
  timeout = 30_000
): Promise<void> {
  await page.waitForResponse(
    (r) =>
      r.url().includes('/api/books/draft') &&
      r.request().method() === 'POST' &&
      r.ok(),
    { timeout }
  );
}

export async function apiLogout(
  request: APIRequestContext,
  token: string
): Promise<void> {
  const res = await request.post(`${API_BASE}/api/logout`, {
    headers: authHeaders(token),
  });
  expect(res.ok(), `Logout failed: ${res.status()}`).toBeTruthy();
}

/** Returns numeric user id from GET /api/user */
export async function apiGetUserId(
  request: APIRequestContext,
  token: string
): Promise<number> {
  const res = await request.get(`${API_BASE}/api/user`, { headers: authHeaders(token) });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  const user = body.data?.user ?? body.data;
  return user.id as number;
}

export async function apiPostComment(
  request: APIRequestContext,
  token: string,
  opts: { bookId: number; content: string; parentId?: number }
): Promise<{ id: number }> {
  const res = await request.post(`${API_BASE}/api/comments`, {
    headers: authHeaders(token),
    data: {
      book_id: opts.bookId,
      content: opts.content,
      ...(opts.parentId ? { parent_id: opts.parentId } : {}),
    },
  });
  expect(res.ok(), `Comment post failed: ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  const id = body.data?.id ?? body.id ?? body.data?.data?.id;
  expect(id, 'Comment id missing from response').toBeTruthy();
  return { id: id as number };
}
