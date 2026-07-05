import { test, expect } from '@playwright/test';
import {
  API_BASE,
  apiLogin,
  apiPostComment,
  authHeaders,
  getReadableBook,
  loginAs,
  requireSeededBackend,
  SEEDED_AUTHOR,
  SEEDED_READER,
} from './helpers';

test.describe('Notifications UI', () => {
  test.beforeEach(async ({ request }) => {
    await requireSeededBackend(request);
  });

  test('reader sees reply notification and can mark all read', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    const readerToken = await apiLogin(request, SEEDED_READER);
    const authorToken = await apiLogin(request, SEEDED_AUTHOR);
    const detail = await (
      await request.get(`${API_BASE}/api/books/${book!.slug}`)
    ).json();

    const parent = await apiPostComment(request, readerToken, {
      bookId: detail.data.id,
      content: `E2E notify ${Date.now()}`,
    });
    await apiPostComment(request, authorToken, {
      bookId: detail.data.id,
      content: 'E2E UI reply',
      parentId: parent.id,
    });

    await loginAs(page, request, SEEDED_READER);
    await page.goto('/notifications');
    await expect(page.getByRole('heading', { name: 'Bildirimler' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/cevap verdi|yorumunuza/i).first()).toBeVisible({
      timeout: 15_000,
    });

    const markAll = page.waitForResponse(
      (r) => r.url().includes('/api/notifications/mark-all-read') && r.ok(),
      { timeout: 15_000 }
    );
    await page.getByRole('button', { name: /Tümünü Okundu İşaretle/i }).click();
    await markAll;
  });
});
