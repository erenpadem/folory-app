import { test, expect } from '@playwright/test';
import {
  API_BASE,
  apiLogin,
  apiPostComment,
  authHeaders,
  getReadableBook,
  loginAs,
  requireSeededBackend,
  requireSeededAuthor,
  SEEDED_AUTHOR,
  SEEDED_READER,
} from './helpers';

test.describe('Social UI (rating, follow, reply)', () => {
  test.beforeEach(async ({ request }) => {
    await requireSeededBackend(request);
  });

  test('reader can rate a book with stars on detail page', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await loginAs(page, request, SEEDED_READER);
    await page.goto(`/book/${book!.slug}`);

    const star = page.getByRole('button', { name: '4 yıldız' });
    await expect(star).toBeVisible({ timeout: 15_000 });
    await star.click();

    await expect(page.getByText('Sizin puanınız: 4')).toBeVisible({ timeout: 10_000 });
  });

  test('reader can follow author from public profile', async ({ page, request }) => {
    await requireSeededAuthor(request);
    const authorToken = await apiLogin(request, SEEDED_AUTHOR);
    const me = await request.get(`${API_BASE}/api/user`, { headers: authHeaders(authorToken) });
    const username = (await me.json()).data?.user?.username;
    test.skip(!username, 'Author username missing');

    await loginAs(page, request, SEEDED_READER);
    await page.goto(`/profile/${username}`);

    const followBtn = page.getByRole('button', { name: 'Takip Et' });
    await expect(followBtn).toBeVisible({ timeout: 15_000 });
    await followBtn.click();
    await expect(page.getByRole('button', { name: 'Takibi Bırak' })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('reader can reply to a comment on book detail', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    const readerToken = await apiLogin(request, SEEDED_READER);
    const detail = await (
      await request.get(`${API_BASE}/api/books/${book!.slug}`)
    ).json();
    const bookId = detail.data.id;

    const parentContent = `E2E reply parent ${Date.now()}`;
    await apiPostComment(request, readerToken, {
      bookId,
      content: parentContent,
    });

    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto(`/book/${book!.slug}`);
    await page.getByRole('tab', { name: /Yorumlar/ }).click();

    await expect(page.getByText(parentContent.slice(0, 20), { exact: false }).first()).toBeVisible({
      timeout: 15_000,
    });

    const replyButtons = page.getByRole('button', { name: 'Yanıtla' });
    await replyButtons.first().click();

    const replyText = `E2E UI reply ${Date.now()}`;
    await page.getByPlaceholder(/Yanıtınızı yazın/i).fill(replyText);
    await page.getByRole('button', { name: 'Gönder' }).click();

    await expect(page.getByText(replyText)).toBeVisible({ timeout: 15_000 });
  });

  test('settings page no longer shows broken notification preferences tab', async ({
    page,
    request,
  }) => {
    await loginAs(page, request, SEEDED_READER);
    await page.goto('/settings');

    await expect(page.getByRole('tab', { name: 'Profil' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Hesap' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Gizlilik' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Bildirimler' })).toHaveCount(0);
  });
});
