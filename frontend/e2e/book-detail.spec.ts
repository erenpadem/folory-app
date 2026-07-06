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

  test('book tabs switch content (Kitap / Bölümler / Yorumlar)', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await page.goto(`/book/${book!.slug}`);
    await expect(page.getByRole('tab', { name: 'Kitap' })).toBeVisible({ timeout: 15_000 });

    await page.getByRole('tab', { name: 'Bölümler' }).click();
    await expect(page.getByText(/Bölüm|Sayfa/i).first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole('tab', { name: /Yorumlar/ }).click();
    await expect(
      page.getByPlaceholder(/Yorumunuzu yazın|yorum/i).or(page.getByText(/Henüz yorum/i))
    ).toBeVisible({ timeout: 10_000 });
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

  test('author profile action navigates from other actions menu', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    const detailRes = await request.get(`${API_BASE}/api/books/${book!.slug}`);
    test.skip(!detailRes.ok(), 'Book detail unavailable');
    const authorUsername = (await detailRes.json())?.data?.author?.username;
    test.skip(!authorUsername, 'Book author username missing');

    await page.goto(`/book/${book!.slug}`);
    await page.getByRole('button').filter({ has: page.locator('svg.lucide-more-vertical') }).click();
    await page.getByRole('button', { name: 'Yazar Profili' }).click();

    await page.waitForURL(new RegExp(`/profile/${authorUsername}`), { timeout: 15_000 });
    expect(page.url()).toContain(`/profile/${authorUsername}`);
  });
});
