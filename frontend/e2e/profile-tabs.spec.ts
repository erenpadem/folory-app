import { test, expect } from '@playwright/test';
import {
  getReadableBook,
  loginAs,
  requireSeededAuthor,
  requireSeededBackend,
  SEEDED_AUTHOR,
  SEEDED_READER,
} from './helpers';

test.describe('Profile tabs', () => {
  test.describe('Author profile', () => {
    test.beforeEach(async ({ request }) => {
      await requireSeededAuthor(request);
    });

    test('books tab lists author published works', async ({ page, request }) => {
      await loginAs(page, request, SEEDED_AUTHOR);
      await page.goto('/profile?tab=books');
      await expect(page.getByRole('tab', { name: 'Kitaplar' })).toBeVisible({ timeout: 15_000 });
      await expect(page.locator('a[href^="/book/"]').first()).toBeVisible({
        timeout: 15_000,
      });
    });

    test('about tab shows bio section', async ({ page, request }) => {
      await loginAs(page, request, SEEDED_AUTHOR);
      await page.goto('/profile?tab=about');
      await expect(page.getByRole('tab', { name: 'Hakkında' })).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/Fantastik|Yazar|biyografi/i).first()).toBeVisible({
        timeout: 15_000,
      });
    });
  });

  test.describe('Reader profile', () => {
    test.beforeEach(async ({ request }) => {
      await requireSeededBackend(request);
    });

    test('likes tab shows book after liking from detail', async ({ page, request }) => {
      const book = await getReadableBook(request);
      test.skip(!book, 'No readable book seeded');

      await loginAs(page, request, SEEDED_READER);
      await page.goto(`/book/${book!.slug}`);
      const likeBtn = page.getByRole('button', { name: 'Beğen' });
      await likeBtn.click();
      await page.waitForResponse(
        (r) => r.url().includes('/api/likes/toggle') && r.ok(),
        { timeout: 15_000 }
      );

      await page.goto('/profile?tab=likes');
      await expect(page.getByText(book!.title).first()).toBeVisible({ timeout: 15_000 });
    });
  });
});
