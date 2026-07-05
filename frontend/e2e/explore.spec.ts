import { test, expect } from '@playwright/test';
import {
  API_BASE,
  apiCreateDraftBook,
  apiDeleteBook,
  apiLogin,
  authHeaders,
  backendReachable,
  getReadableBook,
  SEEDED_AUTHOR,
  seededAuthorReady,
  uniqueE2eTitle,
} from './helpers';

test.describe('Explore / discovery', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!(await backendReachable(request)), `Backend unreachable at ${API_BASE}`);
  });

  test('renders search box and lists seeded books', async ({ page }) => {
    await page.goto('/explore');
    await expect(page.getByPlaceholder('Kitap, yazar veya kategori ara...')).toBeVisible({
      timeout: 15_000,
    });
    // At least one book card link should appear.
    await expect(page.locator('a[href^="/book/"]').first()).toBeVisible({ timeout: 15_000 });
  });

  test('sort tabs are present and switchable', async ({ page }) => {
    await page.goto('/explore');
    await expect(page.locator('a[href^="/book/"]').first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole('tab', { name: /Yeni/ }).click();
    await expect(page.locator('a[href^="/book/"]').first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole('tab', { name: /En Beğenilen/ }).click();
    // Refetch after sort change can briefly clear the grid — allow extra time.
    await expect(page.locator('a[href^="/book/"]').first()).toBeVisible({ timeout: 15_000 });
  });

  test('search narrows results to the matching book', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await page.goto('/explore');
    const search = page.getByPlaceholder('Kitap, yazar veya kategori ara...');
    await search.fill(book!.title);

    // Debounced search (500ms) then SWR fetch; wait for the matching card.
    await expect(
      page.locator('a[href^="/book/"]').filter({ hasText: book!.title }).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('clicking a book card navigates to its detail page', async ({ page }) => {
    await page.goto('/explore');
    const firstCard = page.locator('a[href^="/book/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();
    await page.waitForURL(/\/book\/.+/, { timeout: 20_000 });
    expect(new URL(page.url()).pathname).toMatch(/^\/book\//);
  });

  test('draft books do not appear in public explore search', async ({ request }) => {
    test.skip(!(await seededAuthorReady(request)), 'Seeded author required');
    const token = await apiLogin(request, SEEDED_AUTHOR);
    const draftTitle = uniqueE2eTitle('E2E Gizli Taslak');
    const draft = await apiCreateDraftBook(request, token, { title: draftTitle });

    try {
      const publicRes = await request.get(
        `${API_BASE}/api/books?search=${encodeURIComponent(draftTitle)}`,
        { headers: { Accept: 'application/json' } }
      );
      expect(publicRes.ok()).toBeTruthy();
      const books = (await publicRes.json()).data ?? [];
      expect(books.some((b: { id: number }) => b.id === draft.id)).toBeFalsy();

      const mineRes = await request.get(
        `${API_BASE}/api/books/me?search=${encodeURIComponent(draftTitle)}`,
        { headers: authHeaders(token) }
      );
      expect(mineRes.ok()).toBeTruthy();
      const mine = (await mineRes.json()).data ?? [];
      expect(mine.some((b: { title: string }) => b.title === draftTitle)).toBeTruthy();
    } finally {
      await apiDeleteBook(request, token, draft.id);
    }
  });

  test('category chip filters explore results', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    const detailRes = await request.get(`${API_BASE}/api/books/${book!.slug}`);
    const detail = await detailRes.json();
    const categoryName = detail?.data?.category?.name;
    test.skip(!categoryName, 'Book has no category');

    await page.goto('/explore');
    await page.getByRole('button', { name: categoryName, exact: true }).click();
    await expect(
      page.locator('a[href^="/book/"]').filter({ hasText: book!.title }).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('filter panel can narrow by published status', async ({ page }) => {
    await page.goto('/explore');
    await page.getByRole('button', { name: 'Filtrele' }).click();
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Yayında' }).click();
    await page.getByRole('button', { name: 'Uygula' }).click();
    await expect(page.locator('a[href^="/book/"]').first()).toBeVisible({ timeout: 15_000 });
  });
});
