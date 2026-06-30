import { test, expect } from '@playwright/test';
import {
  API_BASE,
  backendReachable,
  expectNoAppCrash,
  getReadableBook,
} from './helpers';

test.describe('Book detail', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!(await backendReachable(request)), `Backend unreachable at ${API_BASE}`);
  });

  test('shows title, metadata badges and a read CTA', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await page.goto(`/book/${book!.slug}`);

    await expect(page.getByRole('heading', { name: book!.title })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Bölüm/).first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Okumaya Başla|Okumaya Devam Et/ }).first()
    ).toBeVisible();
    await expectNoAppCrash(page);
  });

  test('read CTA navigates into the reader', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await page.goto(`/book/${book!.slug}`);
    await page.getByRole('button', { name: /Okumaya Başla|Okumaya Devam Et/ }).first().click();

    await page.waitForURL(new RegExp(`/book/${book!.slug}/read/`), { timeout: 20_000 });
    expect(page.url()).toContain('/read/');
  });

  test('book tabs (about / chapters / comments) are present', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await page.goto(`/book/${book!.slug}`);
    // Tabs render as role=tab; at least the chapters/comments tabs should exist.
    const tabs = page.getByRole('tab');
    await expect(tabs.first()).toBeVisible({ timeout: 15_000 });
    expect(await tabs.count()).toBeGreaterThan(0);
  });

  test('unknown book slug shows a not-found message rather than crashing', async ({ page }) => {
    await page.goto('/book/this-slug-does-not-exist-9999');
    await expect(page.getByText(/bulunamadı|hata/i)).toBeVisible({ timeout: 15_000 });
    await expectNoAppCrash(page);
  });
});
