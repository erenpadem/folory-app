import { test, expect } from '@playwright/test';
import { API_BASE, backendReachable, getReadableBook } from './helpers';

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
});
