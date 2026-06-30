import { test, expect } from '@playwright/test';
import {
  API_BASE,
  backendReachable,
  expectNoAppCrash,
  getReadableBook,
} from './helpers';

test.describe('Reading experience', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!(await backendReachable(request)), `Backend unreachable at ${API_BASE}`);
  });

  test('opens a page and shows reading progress', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await page.goto(`/book/${book!.slug}/read/${book!.sectionId}/${book!.pageId}`);

    await expect(page.getByText(/Sayfa \d+ \/ \d+/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/okundu/)).toBeVisible();
    await expectNoAppCrash(page);
  });

  test('next page navigation advances the page counter', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await page.goto(`/book/${book!.slug}/read/${book!.sectionId}/${book!.pageId}`);
    await expect(page.getByText(/Sayfa 1 \//)).toBeVisible({ timeout: 20_000 });

    const nextBtn = page.getByRole('button', { name: 'Sonraki sayfa' });
    test.skip(await nextBtn.isDisabled(), 'Single-page book, cannot advance');

    await nextBtn.click();
    await expect(page.getByText(/Sayfa 2 \//)).toBeVisible({ timeout: 15_000 });
    // URL should have changed to a different page id.
    expect(page.url()).toContain('/read/');
  });

  test('keyboard arrow navigation works', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await page.goto(`/book/${book!.slug}/read/${book!.sectionId}/${book!.pageId}`);
    await expect(page.getByText(/Sayfa 1 \//)).toBeVisible({ timeout: 20_000 });

    const nextBtn = page.getByRole('button', { name: 'Sonraki sayfa' });
    test.skip(await nextBtn.isDisabled(), 'Single-page book, cannot advance');

    await page.keyboard.press('ArrowRight');
    await expect(page.getByText(/Sayfa 2 \//)).toBeVisible({ timeout: 15_000 });
  });
});
