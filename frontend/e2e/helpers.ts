import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const API_BASE = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:8081';

/**
 * Seeded credentials (see backend/database/seeders/UserSeeder.php).
 * Author "erenpadem" owns several published books.
 */
export const SEEDED_AUTHOR = {
  email: 'erenpadem@fo-lory.com',
  password: 'erensunucu',
};

export const SEEDED_READER = {
  email: 'ayse@example.com',
  password: 'password',
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
