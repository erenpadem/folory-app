import { test, expect } from '@playwright/test';
import {
  backendReachable,
  API_BASE,
  getReadableBook,
} from './helpers';

test.describe('Reader settings', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!(await backendReachable(request)), `Backend unreachable at ${API_BASE}`);
  });

  test('reading settings panel opens and sepia filter applies', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await page.goto(`/book/${book!.slug}/read/${book!.sectionId}/${book!.pageId}`);
    await expect(page.getByText(/Sayfa \d+ \//)).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: 'Okuma ayarları' }).click();
    await expect(page.getByText('Yazı Boyutu:')).toBeVisible();
    await page.getByRole('button', { name: 'Sepya' }).click();

    await expect(page.locator('.reader-tone-route-sepia').first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
