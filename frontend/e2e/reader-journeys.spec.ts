import { test, expect } from '@playwright/test';
import {
  API_BASE,
  authHeaders,
  requireSeededBackend,
  expectNoAppCrash,
  getReadableBook,
  loginAs,
  SEEDED_READER,
} from './helpers';

test.describe('Reader journeys', () => {
  test.beforeEach(async ({ request }) => {
    await requireSeededBackend(request);
  });

  test('reading progress percentage increases after next page', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await page.goto(`/book/${book!.slug}/read/${book!.sectionId}/${book!.pageId}`);
    await expect(page.getByText(/%\d+ okundu/)).toBeVisible({ timeout: 20_000 });
    const before = await page.getByText(/%\d+ okundu/).innerText();

    const nextBtn = page.getByRole('button', { name: 'Sonraki sayfa' });
    test.skip(await nextBtn.isDisabled(), 'Single-page book');

    await nextBtn.click();
    await expect(page.getByText(/Sayfa 2 \//)).toBeVisible({ timeout: 15_000 });
    const after = await page.getByText(/%\d+ okundu/).innerText();
    expect(after).not.toEqual(before);
  });

  test('reader can bookmark a page while reading', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await loginAs(page, request, SEEDED_READER);
    await page.goto(`/book/${book!.slug}/read/${book!.sectionId}/${book!.pageId}`);
    await expect(page.getByText(/Sayfa \d+ \//)).toBeVisible({ timeout: 20_000 });

    const bookmarkBtn = page.getByTitle('Bu sayfayı yer imlerine ekle / kaldır');
    await expect(bookmarkBtn).toBeVisible();

    const toggle = page.waitForResponse(
      (r) =>
        (r.url().includes('/api/bookmarks') && r.request().method() === 'POST') ||
        (r.url().includes('/api/bookmarks/') && r.request().method() === 'DELETE'),
      { timeout: 15_000 }
    );
    await bookmarkBtn.click();
    const res = await toggle;
    expect(res.ok()).toBeTruthy();
  });

  test('reader can save book to library from detail page', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await loginAs(page, request, SEEDED_READER);
    await page.goto(`/book/${book!.slug}`);
    await expect(page.getByRole('heading', { name: book!.title })).toBeVisible({
      timeout: 15_000,
    });

    // Bookmark icon button in hero (no text label).
    const saveBtn = page.locator('button').filter({ has: page.locator('svg.lucide-bookmark') }).first();
    await expect(saveBtn).toBeVisible();

    const libReq = page.waitForResponse(
      (r) => r.url().includes('/api/library') && r.request().method() === 'POST',
      { timeout: 15_000 }
    );
    await saveBtn.click();
    const res = await libReq;
    expect(res.ok()).toBeTruthy();

    await page.goto('/profile?tab=saved');
    await expect(page.getByRole('tab', { name: /Kaydedilenler/ })).toBeVisible();
    await expect(page.getByText(book!.title).first()).toBeVisible({ timeout: 15_000 });
  });

  test('reader can post a comment with @ mention autocomplete', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await loginAs(page, request, SEEDED_READER);
    await page.goto(`/book/${book!.slug}`);
    await page.getByRole('tab', { name: /Yorumlar/ }).click();

    const textarea = page.getByPlaceholder(/Yorumunuzu yazın/);
    await expect(textarea).toBeVisible({ timeout: 15_000 });

    await textarea.fill('Harika kitap @Eren');
    await expect(page.getByText('Eren Padem').first()).toBeVisible({ timeout: 10_000 });
    await page.getByText('Eren Padem').first().click();

    const value = await textarea.inputValue();
    expect(value).toMatch(/@author\{\d+\}/);

    const mentionText = ` ${Date.now()}`;
    await textarea.press('End');
    await textarea.type(mentionText);

    const post = page.waitForResponse(
      (r) => r.url().includes('/api/comments') && r.request().method() === 'POST',
      { timeout: 15_000 }
    );
    await page.getByRole('button', { name: 'Gönder' }).click();
    expect((await post).ok()).toBeTruthy();
    await expect(page.getByText(new RegExp(mentionText.trim())).first()).toBeVisible({
      timeout: 15_000,
    });
    await expectNoAppCrash(page);
  });

  test('reader can navigate back to previous page after advancing', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await page.goto(`/book/${book!.slug}/read/${book!.sectionId}/${book!.pageId}`);
    await expect(page.getByText(/Sayfa 1 \//)).toBeVisible({ timeout: 20_000 });

    const nextBtn = page.getByRole('button', { name: 'Sonraki sayfa' });
    test.skip(await nextBtn.isDisabled(), 'Single-page book');

    await nextBtn.click();
    await expect(page.getByText(/Sayfa 2 \//)).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Önceki sayfa' }).click();
    await expect(page.getByText(/Sayfa 1 \//)).toBeVisible({ timeout: 15_000 });
  });

  test('bookmarked page appears under profile favorites tab', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await loginAs(page, request, SEEDED_READER);
    await page.goto(`/book/${book!.slug}/read/${book!.sectionId}/${book!.pageId}`);
    await expect(page.getByText(/Sayfa \d+ \//)).toBeVisible({ timeout: 20_000 });

    const bookmarkBtn = page.getByTitle('Bu sayfayı yer imlerine ekle / kaldır');
    const toggle = page.waitForResponse(
      (r) =>
        (r.url().includes('/api/bookmarks') && r.request().method() === 'POST') ||
        (r.url().includes('/api/bookmarks/') && r.request().method() === 'DELETE'),
      { timeout: 15_000 }
    );
    await bookmarkBtn.click();
    await toggle;

    await page.goto('/profile?tab=favorites');
    await expect(page.getByRole('tab', { name: /Favoriler/ })).toBeVisible();
    await expect(page.getByText(book!.title).first()).toBeVisible({ timeout: 15_000 });
  });

  test('reader can like a book from detail page', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await loginAs(page, request, SEEDED_READER);
    await page.goto(`/book/${book!.slug}`);

    const likeBtn = page.getByRole('button', { name: 'Beğen' });
    await expect(likeBtn).toBeVisible({ timeout: 15_000 });
    const toggle = page.waitForResponse(
      (r) => r.url().includes('/api/likes/toggle') && r.request().method() === 'POST',
      { timeout: 15_000 }
    );
    await likeBtn.click();
    expect((await toggle).ok()).toBeTruthy();
  });
});
